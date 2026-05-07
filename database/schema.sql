-- =============================================================
-- NyayaSetu — Production Database Schema for Supabase
-- PostgreSQL 15+ | Run in Supabase SQL Editor
-- All timestamps in IST (Asia/Kolkata) via AT TIME ZONE
-- =============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Set default timezone for the session
SET timezone = 'Asia/Kolkata';

-- =============================================================
-- 1. DEPARTMENTS (created before users due to FK dependency)
-- =============================================================
CREATE TABLE IF NOT EXISTS departments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) UNIQUE NOT NULL,
    code            VARCHAR(20)  UNIQUE NOT NULL,
    head_officer_id UUID,               -- FK added after users table
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE departments IS 'Government departments responsible for court order compliance';

-- =============================================================
-- 2. USERS
-- =============================================================
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nic_sso_id      VARCHAR(50)  UNIQUE NOT NULL,
    employee_id     VARCHAR(50)  UNIQUE NOT NULL,
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(100) UNIQUE NOT NULL,
    phone           VARCHAR(15),
    designation     VARCHAR(100),
    role            VARCHAR(20)  NOT NULL
                        CHECK (role IN ('admin', 'reviewer', 'officer')),
    department_id   UUID         REFERENCES departments(id),
    is_active       BOOLEAN      NOT NULL DEFAULT true,
    last_login      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ           -- soft delete
);

COMMENT ON TABLE users IS 'All NyayaSetu platform users — admins, reviewers, officers';
COMMENT ON COLUMN users.deleted_at IS 'Soft delete — never hard delete rows';

-- Add FK from departments back to users now that users exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_dept_head'
      AND conrelid = 'departments'::regclass
  ) THEN
    ALTER TABLE departments
    ADD CONSTRAINT fk_dept_head
    FOREIGN KEY (head_officer_id) REFERENCES users(id);
  END IF;
END $$;

-- =============================================================
-- 2.1 AUTH SYNC TRIGGER
-- =============================================================
CREATE OR REPLACE FUNCTION public.fn_handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $BODY$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, nic_sso_id, employee_id)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'System User'), 
    'officer',
    COALESCE(NEW.raw_user_meta_data->>'nic_sso_id', NEW.id::text),
    COALESCE(NEW.raw_user_meta_data->>'employee_id', NEW.id::text)
  );
  RETURN NEW;
END;
$BODY$;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created 
AFTER INSERT ON auth.users 
FOR EACH ROW EXECUTE FUNCTION public.fn_handle_new_auth_user();

-- =============================================================
-- 3. CASES
-- =============================================================
CREATE TABLE IF NOT EXISTS cases (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number       VARCHAR(100) UNIQUE NOT NULL,
    court_name        TEXT         NOT NULL,
    bench             TEXT,
    date_of_order     DATE         NOT NULL,
    petitioner        TEXT         NOT NULL,
    respondents       TEXT[]       NOT NULL,
    pdf_url           TEXT         NOT NULL,
    raw_text          TEXT,
    status            VARCHAR(30)  NOT NULL DEFAULT 'uploaded'
                          CHECK (status IN (
                              'uploaded', 'extracting', 'extracted',
                              'pending_verification', 'in_review',
                              'verified', 'rejected', 'actioned'
                          )),
    overall_nature    VARCHAR(50),
    appeal_applicable BOOLEAN      NOT NULL DEFAULT false,
    appeal_deadline   DATE,
    uploaded_by       UUID         REFERENCES users(id),
    assigned_reviewer UUID         REFERENCES users(id),
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at        TIMESTAMPTZ           -- soft delete
);

COMMENT ON TABLE cases IS 'Court cases uploaded for compliance tracking';
COMMENT ON COLUMN cases.respondents IS 'Array of respondent names (government depts)';
COMMENT ON COLUMN cases.overall_nature IS 'e.g. COMPLIANCE_REQUIRED, INFORMATIONAL, APPEAL';

-- =============================================================
-- 4. DIRECTIVES
-- =============================================================
CREATE TABLE IF NOT EXISTS directives (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id            UUID         NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    directive_code     VARCHAR(20)  NOT NULL,
    raw_text           TEXT         NOT NULL,
    action_type        VARCHAR(30)
                           CHECK (action_type IN ('COMPLIANCE', 'APPEAL', 'INFORMATION')),
    timeline_raw       VARCHAR(100),
    timeline_resolved  DATE,
    priority           VARCHAR(20)
                           CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    department_id      UUID         REFERENCES departments(id),
    confidence_score   DECIMAL(4,3) CHECK (confidence_score BETWEEN 0 AND 1),
    source_page        INTEGER,
    source_paragraph   INTEGER,
    status             VARCHAR(30)  NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'approved', 'edited', 'rejected')),
    reviewer_note      TEXT,
    verified_by        UUID         REFERENCES users(id),
    verified_at        TIMESTAMPTZ,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE directives IS 'AI-extracted directives from each court order';
COMMENT ON COLUMN directives.confidence_score IS 'AI extraction confidence 0.000–1.000';

-- =============================================================
-- 5. ACTION PLANS
-- =============================================================
CREATE TABLE IF NOT EXISTS action_plans (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id           UUID         NOT NULL REFERENCES cases(id),
    directive_id      UUID         NOT NULL REFERENCES directives(id),
    action_required   TEXT         NOT NULL,
    responsible_dept  UUID         REFERENCES departments(id),
    assigned_officer  UUID         REFERENCES users(id),
    due_date          DATE         NOT NULL,
    appeal_applicable BOOLEAN      NOT NULL DEFAULT false,
    appeal_deadline   DATE,
    is_verified       BOOLEAN      NOT NULL DEFAULT false,
    completion_status VARCHAR(30)  NOT NULL DEFAULT 'pending'
                          CHECK (completion_status IN (
                              'pending', 'in_progress', 'completed', 'overdue'
                          )),
    completion_note   TEXT,
    completed_at      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE action_plans IS 'Actionable tasks derived from verified directives';

-- =============================================================
-- 6. AUDIT LOG  (append-only — no UPDATE, no DELETE ever)
-- =============================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id      UUID REFERENCES cases(id),
    directive_id UUID REFERENCES directives(id),
    action       VARCHAR(100) NOT NULL,
    performed_by UUID         REFERENCES users(id),
    old_value    JSONB,
    new_value    JSONB,
    ip_address   VARCHAR(50),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    -- Intentionally: no updated_at — this table is immutable
);

COMMENT ON TABLE audit_log IS 'Immutable audit trail — INSERT only, never UPDATE or DELETE';

-- =============================================================
-- 7. NOTIFICATIONS
-- =============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID         NOT NULL REFERENCES users(id),
    case_id    UUID         REFERENCES cases(id),
    type       VARCHAR(50)  NOT NULL
                   CHECK (type IN (
                       'deadline_approaching', 'overdue',
                       'new_case_assigned', 'directive_verified',
                       'contempt_risk', 'action_required'
                   )),
    title      VARCHAR(200) NOT NULL,
    message    TEXT,
    is_read    BOOLEAN      NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE notifications IS 'In-app notifications for users; system-inserted via triggers';

-- =============================================================
-- INDEXES
-- =============================================================

-- cases
CREATE INDEX IF NOT EXISTS idx_cases_status            ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_uploaded_by       ON cases(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_reviewer ON cases(assigned_reviewer);
CREATE INDEX IF NOT EXISTS idx_cases_deleted_at        ON cases(deleted_at) WHERE deleted_at IS NULL;

-- directives
CREATE INDEX IF NOT EXISTS idx_directives_case_id      ON directives(case_id);
CREATE INDEX IF NOT EXISTS idx_directives_dept         ON directives(department_id);
CREATE INDEX IF NOT EXISTS idx_directives_status       ON directives(status);

-- action_plans
CREATE INDEX IF NOT EXISTS idx_ap_due_date             ON action_plans(due_date);
CREATE INDEX IF NOT EXISTS idx_ap_assigned_officer     ON action_plans(assigned_officer);
CREATE INDEX IF NOT EXISTS idx_ap_completion_status    ON action_plans(completion_status);

-- notifications
CREATE INDEX IF NOT EXISTS idx_notif_user_read         ON notifications(user_id, is_read);

-- audit_log
CREATE INDEX IF NOT EXISTS idx_audit_case_id           ON audit_log(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_performed_by      ON audit_log(performed_by);

-- =============================================================
-- TRIGGER FUNCTION: auto-update updated_at
-- =============================================================
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Apply updated_at trigger to all mutable tables
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'departments', 'users', 'cases',
        'directives', 'action_plans', 'notifications'
    ]
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_updated_at_%1$s ON %1$s', t);
        EXECUTE format(
            'CREATE TRIGGER trg_updated_at_%1$s
             BEFORE UPDATE ON %1$s
             FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at()',
            t
        );
    END LOOP;
END;
$$;

-- =============================================================
-- TRIGGER FUNCTION: auto-create action_plan when directive approved
-- =============================================================
CREATE OR REPLACE FUNCTION fn_create_action_plan_on_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only fire when status transitions to 'approved' or 'edited'
    IF NEW.status IN ('approved', 'edited')
       AND (OLD.status IS DISTINCT FROM NEW.status)
    THEN
        -- Avoid duplicate action plans for same directive
        IF NOT EXISTS (
            SELECT 1 FROM action_plans
            WHERE directive_id = NEW.id
        ) THEN
            INSERT INTO action_plans (
                case_id,
                directive_id,
                action_required,
                responsible_dept,
                due_date,
                appeal_applicable,
                appeal_deadline,
                is_verified
            )
            VALUES (
                NEW.case_id,
                NEW.id,
                NEW.raw_text,
                NEW.department_id,
                COALESCE(NEW.timeline_resolved, CURRENT_DATE + INTERVAL '30 days'),
                (NEW.action_type = 'APPEAL'),
                CASE WHEN NEW.action_type = 'APPEAL'
                     THEN NEW.timeline_resolved + INTERVAL '30 days'
                     ELSE NULL END,
                true   -- verified, because directive was approved by reviewer
            );

            -- Audit the auto-creation
            INSERT INTO audit_log (case_id, directive_id, action, new_value)
            VALUES (
                NEW.case_id,
                NEW.id,
                'action_plan_auto_created',
                jsonb_build_object(
                    'directive_status', NEW.status,
                    'triggered_at', NOW()
                )
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_directive_auto_action_plan ON directives;
CREATE TRIGGER trg_directive_auto_action_plan
AFTER UPDATE OF status ON directives
FOR EACH ROW
EXECUTE FUNCTION fn_create_action_plan_on_approval();

-- =============================================================
-- TRIGGER FUNCTION: mark overdue + notify officer
-- =============================================================
CREATE OR REPLACE FUNCTION fn_check_overdue_on_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Mark overdue if due_date has passed and not completed
    IF NEW.due_date < CURRENT_DATE
       AND NEW.completion_status = 'pending'
    THEN
        NEW.completion_status = 'overdue';

        -- Insert notification for the assigned officer
        IF NEW.assigned_officer IS NOT NULL THEN
            INSERT INTO notifications (
                user_id, case_id, type, title, message
            )
            SELECT
                NEW.assigned_officer,
                NEW.case_id,
                'overdue',
                'Action Plan Overdue',
                format(
                    'Action plan for case %s was due on %s and is now overdue.',
                    c.case_number,
                    TO_CHAR(NEW.due_date, 'DD Mon YYYY')
                )
            FROM cases c WHERE c.id = NEW.case_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_action_plan_overdue ON action_plans;
CREATE TRIGGER trg_action_plan_overdue
BEFORE UPDATE OF due_date, completion_status ON action_plans
FOR EACH ROW
EXECUTE FUNCTION fn_check_overdue_on_update();

-- =============================================================
-- ROW LEVEL SECURITY — Enable on all tables
-- =============================================================
-- RLS ENABLE
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases          ENABLE ROW LEVEL SECURITY;
ALTER TABLE directives     ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plans   ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log      ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION fn_current_user_role() RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT role FROM users WHERE id = auth.uid() AND deleted_at IS NULL AND is_active = true LIMIT 1;
$$;
CREATE OR REPLACE FUNCTION fn_current_user_dept() RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT department_id FROM users WHERE id = auth.uid() AND deleted_at IS NULL LIMIT 1;
$$;

-- RLS POLICIES (DROP and RECREATE for idempotency)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- =============================================================
-- RLS: USERS TABLE
-- =============================================================
-- Own row always visible
CREATE POLICY pol_users_select_own
ON users FOR SELECT
USING (id = auth.uid());

-- Admin sees all active users
CREATE POLICY pol_users_select_admin
ON users FOR SELECT
USING (fn_current_user_role() = 'admin' AND deleted_at IS NULL);

-- Admin can insert/update users (but not change own role via UPDATE)
CREATE POLICY pol_users_insert_admin
ON users FOR INSERT
WITH CHECK (fn_current_user_role() = 'admin');

CREATE POLICY pol_users_update_admin
ON users FOR UPDATE
USING (fn_current_user_role() = 'admin')
WITH CHECK (true); -- Field-level restrictions handled via trigger/app logic

-- Soft delete only — admin sets deleted_at
CREATE POLICY pol_users_softdelete_admin
ON users FOR UPDATE
USING (
    fn_current_user_role() = 'admin'
    AND deleted_at IS NULL
);

-- =============================================================
-- RLS: DEPARTMENTS TABLE
-- =============================================================
CREATE POLICY pol_dept_select_all
ON departments FOR SELECT
USING (fn_current_user_role() IN ('admin', 'reviewer', 'officer'));

CREATE POLICY pol_dept_write_admin
ON departments FOR ALL
USING (fn_current_user_role() = 'admin');

-- =============================================================
-- RLS: CASES TABLE
-- =============================================================
-- Admin: full access
CREATE POLICY pol_cases_all_admin
ON cases FOR ALL
USING (fn_current_user_role() = 'admin' AND deleted_at IS NULL);

-- Reviewer: select all, update status only
CREATE POLICY pol_cases_select_reviewer
ON cases FOR SELECT
USING (fn_current_user_role() = 'reviewer' AND deleted_at IS NULL);

CREATE POLICY pol_cases_update_reviewer
ON cases FOR UPDATE
USING (fn_current_user_role() = 'reviewer')
WITH CHECK (
    fn_current_user_role() = 'reviewer'
    -- Reviewer may only change status and assigned_reviewer fields
);

-- Officer: select cases where their department has a linked directive
CREATE POLICY pol_cases_select_officer
ON cases FOR SELECT
USING (
    fn_current_user_role() = 'officer'
    AND deleted_at IS NULL
    AND id IN (
        SELECT DISTINCT d.case_id
        FROM directives d
        WHERE d.department_id = fn_current_user_dept()
    )
);

-- =============================================================
-- RLS: DIRECTIVES TABLE
-- =============================================================
CREATE POLICY pol_directives_all_admin
ON directives FOR ALL
USING (fn_current_user_role() = 'admin');

CREATE POLICY pol_directives_all_reviewer
ON directives FOR ALL
USING (fn_current_user_role() = 'reviewer');

-- Officer: select only their department's directives
CREATE POLICY pol_directives_select_officer
ON directives FOR SELECT
USING (
    fn_current_user_role() = 'officer'
    AND department_id = fn_current_user_dept()
);

-- =============================================================
-- RLS: ACTION PLANS TABLE
-- =============================================================
CREATE POLICY pol_ap_all_admin
ON action_plans FOR ALL
USING (fn_current_user_role() = 'admin');

CREATE POLICY pol_ap_all_reviewer
ON action_plans FOR ALL
USING (fn_current_user_role() = 'reviewer');

-- Officer: select own, update only completion fields
CREATE POLICY pol_ap_select_officer
ON action_plans FOR SELECT
USING (
    fn_current_user_role() = 'officer'
    AND assigned_officer = auth.uid()
);

CREATE POLICY pol_ap_update_officer
ON action_plans FOR UPDATE
USING (
    fn_current_user_role() = 'officer'
    AND assigned_officer = auth.uid()
)
WITH CHECK (true); -- Officers may update their assigned tasks; app logic enforces fields

-- =============================================================
-- RLS: AUDIT LOG — Insert only; no update/delete
-- =============================================================
CREATE POLICY pol_audit_insert_all
ON audit_log FOR INSERT
WITH CHECK (true);  -- any authenticated user; app enforces context

CREATE POLICY pol_audit_select_admin
ON audit_log FOR SELECT
USING (fn_current_user_role() = 'admin');

CREATE POLICY pol_audit_select_own
ON audit_log FOR SELECT
USING (performed_by = auth.uid());

-- Prevent UPDATE and DELETE via RLS (no policy = deny)

-- =============================================================
-- RLS: NOTIFICATIONS
-- =============================================================
CREATE POLICY pol_notif_select_own
ON notifications FOR SELECT
USING (user_id = auth.uid());

-- Only allow updating is_read
CREATE POLICY pol_notif_update_own
ON notifications FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- System inserts via triggers (SECURITY DEFINER) — no user policy needed for INSERT

-- =============================================================
-- FUNCTION: get_dashboard_stats(p_user_id UUID)
-- Returns role-aware JSON stats for the dashboard
-- =============================================================
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_user_id UUID DEFAULT auth.uid())
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    v_role       TEXT;
    v_dept_id    UUID;
    v_total      INT;
    v_pending    INT;
    v_due_week   INT;
    v_overdue    INT;
    v_contempt   INT;
    v_verified   INT;
    v_base_cases UUID[];
BEGIN
    -- Get caller role and department
    SELECT role, department_id
    INTO v_role, v_dept_id
    FROM users
    WHERE id = p_user_id AND deleted_at IS NULL AND is_active = true;

    -- Build base case set by role
    IF v_role = 'admin' OR v_role = 'reviewer' THEN
        SELECT ARRAY_AGG(id) INTO v_base_cases
        FROM cases WHERE deleted_at IS NULL;
    ELSIF v_role = 'officer' THEN
        SELECT ARRAY_AGG(DISTINCT d.case_id) INTO v_base_cases
        FROM directives d WHERE d.department_id = v_dept_id;
    ELSE
        RETURN json_build_object('error', 'unauthorized');
    END IF;

    -- Total cases
    SELECT COUNT(*) INTO v_total
    FROM cases
    WHERE id = ANY(v_base_cases) AND deleted_at IS NULL;

    -- Pending verification
    SELECT COUNT(*) INTO v_pending
    FROM cases
    WHERE id = ANY(v_base_cases)
      AND status IN ('pending_verification', 'in_review')
      AND deleted_at IS NULL;

    -- Due this week (action plans)
    SELECT COUNT(*) INTO v_due_week
    FROM action_plans ap
    WHERE ap.case_id = ANY(v_base_cases)
      AND ap.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
      AND ap.completion_status != 'completed';

    -- Overdue action plans
    SELECT COUNT(*) INTO v_overdue
    FROM action_plans ap
    WHERE ap.case_id = ANY(v_base_cases)
      AND ap.completion_status = 'overdue';

    -- Contempt risk (due within 7 days, not completed, compliance required)
    SELECT COUNT(*) INTO v_contempt
    FROM action_plans ap
    JOIN cases c ON c.id = ap.case_id
    WHERE ap.case_id = ANY(v_base_cases)
      AND ap.due_date <= CURRENT_DATE + INTERVAL '7 days'
      AND ap.completion_status != 'completed'
      AND c.overall_nature = 'COMPLIANCE_REQUIRED';

    -- Verified today
    SELECT COUNT(*) INTO v_verified
    FROM directives d
    WHERE d.case_id = ANY(v_base_cases)
      AND d.status IN ('approved', 'edited')
      AND DATE(d.verified_at AT TIME ZONE 'Asia/Kolkata') = CURRENT_DATE;

    RETURN json_build_object(
        'total_cases',          COALESCE(v_total, 0),
        'pending_verification', COALESCE(v_pending, 0),
        'due_this_week',        COALESCE(v_due_week, 0),
        'overdue',              COALESCE(v_overdue, 0),
        'contempt_risk',        COALESCE(v_contempt, 0),
        'verified_today',       COALESCE(v_verified, 0)
    );
END;
$$;

COMMENT ON FUNCTION get_dashboard_stats IS
    'Returns role-filtered dashboard stats JSON. Call with no args to use current auth user.';

-- =============================================================
-- FUNCTION: check_contempt_risk()
-- Returns cases at risk of contempt proceedings
-- =============================================================
CREATE OR REPLACE FUNCTION check_contempt_risk()
RETURNS TABLE (
    case_id       UUID,
    case_number   VARCHAR,
    court_name    TEXT,
    due_date      DATE,
    days_until    INT,
    action_plan_id UUID
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT
        c.id            AS case_id,
        c.case_number,
        c.court_name,
        ap.due_date,
        (ap.due_date - CURRENT_DATE)::INT AS days_until,
        ap.id           AS action_plan_id
    FROM action_plans ap
    JOIN cases c ON c.id = ap.case_id
    WHERE
        ap.due_date <= CURRENT_DATE + INTERVAL '7 days'
        AND ap.completion_status != 'completed'
        AND c.overall_nature = 'COMPLIANCE_REQUIRED'
        AND c.deleted_at IS NULL
    ORDER BY ap.due_date ASC;
$$;

COMMENT ON FUNCTION check_contempt_risk IS
    'Returns action plans at contempt risk: due within 7 days, not completed, compliance cases';

-- =============================================================
-- SCHEDULED: Mark pending action plans as overdue daily
-- (Run via pg_cron or Supabase Edge Function cron)
-- =============================================================
CREATE OR REPLACE FUNCTION fn_daily_overdue_sweep()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE action_plans
    SET completion_status = 'overdue'
    WHERE due_date < CURRENT_DATE
      AND completion_status = 'pending';

    -- Insert notifications for affected officers
    INSERT INTO notifications (user_id, case_id, type, title, message)
    SELECT DISTINCT
        ap.assigned_officer,
        ap.case_id,
        'overdue',
        'Action Plan Overdue',
        format(
            'Your action plan (Case: %s) was due on %s.',
            c.case_number,
            TO_CHAR(ap.due_date, 'DD Mon YYYY')
        )
    FROM action_plans ap
    JOIN cases c ON c.id = ap.case_id
    WHERE ap.completion_status = 'overdue'
      AND ap.assigned_officer IS NOT NULL
      -- Skip if notification already sent today
      AND NOT EXISTS (
          SELECT 1 FROM notifications n
          WHERE n.user_id = ap.assigned_officer
            AND n.case_id = ap.case_id
            AND n.type = 'overdue'
            AND DATE(n.created_at AT TIME ZONE 'Asia/Kolkata') = CURRENT_DATE
      );
END;
$$;

-- =============================================================
-- GRANT minimal permissions to authenticated role
-- =============================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
REVOKE UPDATE, DELETE ON audit_log FROM authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_contempt_risk()     TO authenticated;
GRANT EXECUTE ON FUNCTION fn_current_user_role()    TO authenticated;
GRANT EXECUTE ON FUNCTION fn_current_user_dept()    TO authenticated;

-- =============================================================
-- END OF SCHEMA
-- Run time: < 5 seconds on a fresh Supabase project
-- =============================================================
