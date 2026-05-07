<div align="center">

# ⚖️ NyayaSetu

### AI-Powered Judicial Compliance Platform

**Automated extraction of court directives from Supreme Court orders — helping government departments track, act on, and verify compliance with judicial mandates.**

[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://nyayasetu-backend-xlldv3ypwq-ew.a.run.app/docs)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js-black?logo=next.js)](https://nyayasetu.vercel.app)
[![Database](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase)](https://supabase.com)
[![AI](https://img.shields.io/badge/AI-Gemini_1.5_Flash-4285F4?logo=google)](https://ai.google.dev)
[![Cloud Run](https://img.shields.io/badge/Cloud_Run-europe--west1-4285F4?logo=googlecloud)](https://cloud.google.com/run)

</div>

---

## 📋 Table of Contents

1. [What is NyayaSetu?](#-what-is-nyayasetu)
2. [Architecture](#-architecture)
3. [Live Demo](#-live-demo)
4. [Project Structure](#-project-structure)
5. [Local Development](#-local-development)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
6. [How to Login](#-how-to-login)
7. [How to Use the App](#-how-to-use-the-app)
   - [Demo Mode Walkthrough](#demo-mode-walkthrough)
   - [Upload a Real Judgment](#upload-a-real-judgment)
8. [Environment Variables](#-environment-variables)
9. [Database Setup](#-database-setup)
10. [Deployment](#-deployment)
    - [Backend → Cloud Run](#backend--cloud-run)
    - [Frontend → Vercel](#frontend--vercel)
11. [API Reference](#-api-reference)
12. [Contributing](#-contributing)

---

## 🏛️ What is NyayaSetu?

NyayaSetu (*"Bridge of Justice"* in Hindi) is an AI-powered compliance management system designed for Indian government departments. It:

- **Ingests** Supreme Court and High Court judgment PDFs
- **Extracts** actionable directives using Google Gemini AI + OCR
- **Tracks** compliance deadlines and assigns responsibilities to officers
- **Alerts** officers when contempt of court risk is high
- **Logs** all actions for a complete audit trail

> **Demo Mode** (`DEMO_MODE=true`): The app ships with a pre-loaded Supreme Court judgment (WP 4092/2024). You can log in with any NIC SSO ID and see the full system in action without any real court data.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User's Browser                       │
│              Next.js 14 (App Router + TypeScript)        │
│              Deployed on: Vercel (Region: bom1)          │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS / REST API
                       ▼
┌─────────────────────────────────────────────────────────┐
│              FastAPI Backend (Python 3.11)               │
│  • JWT authentication    • Gemini AI integration         │
│  • PDF OCR (Tesseract)   • Rate limiting                 │
│  Deployed on: Google Cloud Run (europe-west1)            │
└──────────────────────┬──────────────────────────────────┘
                       │ Supabase Client (service role)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                     Supabase                             │
│  • PostgreSQL database   • File storage (judgment PDFs)  │
│  • Row Level Security    • Audit logs                    │
└─────────────────────────────────────────────────────────┘
```

**Tech Stack:**
| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Python 3.11, FastAPI, Uvicorn |
| AI/ML | Google Gemini 1.5 Flash, Tesseract OCR, pdf2image |
| Database | Supabase (PostgreSQL) |
| File Storage | Supabase Storage |
| Auth | Custom OTP + JWT (HS256) |
| Backend Hosting | Google Cloud Run |
| Frontend Hosting | Vercel |

---

## 🚀 Live Demo

| Service | URL | Status |
|---|---|---|
| **Frontend** | [nyayasetu.vercel.app](https://nyayasetu.vercel.app) | 🟡 Deploy via Vercel (see below) |
| **Backend API** | [nyayasetu-backend-xlldv3ypwq-ew.a.run.app](https://nyayasetu-backend-xlldv3ypwq-ew.a.run.app) | 🟢 Live |
| **API Docs (Swagger)** | [/docs](https://nyayasetu-backend-xlldv3ypwq-ew.a.run.app/docs) | 🟢 Live |
| **Health Check** | [/health](https://nyayasetu-backend-xlldv3ypwq-ew.a.run.app/health) | 🟢 Live |

---

## 📁 Project Structure

```
NyayaSetu/
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── core/               # Config, DB, logging, security
│   │   │   ├── config.py       # Pydantic Settings (reads .env)
│   │   │   ├── database.py     # Supabase client singleton
│   │   │   ├── logger.py       # Structured logger
│   │   │   ├── exceptions/     # Custom HTTP exceptions & handlers
│   │   │   ├── security/       # JWT handler, rate limiter, middleware
│   │   ├── models/             # Pydantic request/response models
│   │   ├── modules/
│   │   │   └── email/          # Email service (OTP delivery)
│   │   ├── routers/            # API route handlers
│   │   │   ├── auth.py         # /api/v1/auth/* (OTP, login, logout, me)
│   │   │   ├── cases.py        # /api/v1/cases/* (upload, list, demo)
│   │   │   ├── dashboard.py    # /api/v1/dashboard/*
│   │   │   ├── directives.py   # /api/v1/directives/*
│   │   │   ├── action_plans.py # /api/v1/action-plans/*
│   │   │   ├── users.py        # /api/v1/users/*
│   │   │   ├── notifications.py
│   │   │   └── verify.py       # /api/v1/verify/* (compliance tracking)
│   │   ├── tests/              # Pytest test suite
│   │   └── main.py             # FastAPI app entry point
│   ├── Dockerfile.template     # Template for building production image
│   ├── .env.example            # Required environment variables
│   └── requirements.txt        # Python dependencies (pinned)
│
├── frontend/                   # Next.js 14 application
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   ├── components/         # Reusable React components
│   │   ├── lib/
│   │   │   ├── api/            # Typed API client (client.ts)
│   │   │   ├── auth/           # Session management
│   │   │   └── errors/         # API error types
│   │   └── styles/
│   ├── vercel.json             # Vercel deployment config
│   ├── next.config.js          # Next.js config (image domains)
│   └── .env.example            # Required env vars for frontend
│
├── database/
│   └── schema.sql              # Full PostgreSQL schema (run once in Supabase)
│
├── .github/                    # GitHub Actions CI (if configured)
├── .gitignore                  # Excludes: .env, Dockerfile, PDFs, build artifacts
├── LICENSE
├── SECURITY.md
└── README.md
```

---

## 💻 Local Development

### Prerequisites

- Python 3.11+
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- A [Google AI Studio](https://aistudio.google.com) API key (free tier works)

---

### Backend Setup

**1. Clone the repository**
```bash
git clone https://github.com/HarshSharma-28/NyayaSetu.git
cd NyayaSetu
```

**2. Create and activate a virtual environment**
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

**3. Install dependencies**
```bash
pip install -r requirements.txt
```

**4. Configure environment variables**
```bash
cp .env.example .env
```
Edit `.env` with your actual values (see [Environment Variables](#-environment-variables) section).

**5. Set up the database** (first time only)

Go to your Supabase project → SQL Editor → paste the contents of `database/schema.sql` and click **Run**.

**6. Start the backend server**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API is now available at:
- **API:** `http://localhost:8000`
- **Swagger Docs:** `http://localhost:8000/docs`
- **Health check:** `http://localhost:8000/health`

---

### Frontend Setup

**1. Install Node dependencies**
```bash
cd frontend
npm install
```

**2. Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

**3. Start the development server**
```bash
npm run dev
```

The frontend is now available at `http://localhost:3000`.

> **Note:** Make sure the backend is running on port 8000 before starting the frontend.

---

## 🔐 How to Login

NyayaSetu uses a **two-step OTP authentication** that simulates the NIC (National Informatics Centre) SSO flow used by Indian government systems.

### In Demo Mode (`DEMO_MODE=true`) — Recommended for Testing

> The system **auto-creates** user accounts for any SSO ID you enter, so no pre-registration is required.

**Step 1: Enter your NIC SSO ID**
- Go to the login page
- Enter **any ID** (e.g., `JUDGE001`, `test123`, `demo_user`)
- Click **"Send OTP"**

**Step 2: Get your OTP**
- In Demo Mode, the OTP is returned directly in the API response and also logged to the backend console
- The UI will show a notification with your OTP code
- *(In production, the OTP would be emailed to the officer's government email)*

**Step 3: Complete login**
- Enter the OTP code
- Enter any password (e.g., `password123`) — validation is relaxed in demo mode
- Select your role: **Judge**, **Officer**, or **Admin**
- Click **Login**

### Using the "View Demo" Button

The login page has a **"View Demo"** button that:
1. Automatically pre-fills the SSO ID as `demo_judge`
2. Clicks "Send OTP" on your behalf
3. Pre-fills the OTP from the API response
4. Logs you in as a **Judge** role

This is the fastest way to explore the app with zero setup.

---

## 📱 How to Use the App

### Demo Mode Walkthrough

After logging in, you'll land on the **Dashboard** showing:
- **Active Cases** count and recent uploads
- **Pending Directives** extracted from court orders
- **Contempt Risk** alerts (deadlines approaching)
- **Compliance Stats** (percentage of directives actioned)

#### 1. View Active Cases
Navigate to **"Cases"** in the sidebar to see all uploaded court judgments. In demo mode, the pre-loaded Supreme Court WP 4092/2024 judgment is already visible.

#### 2. View Extracted Directives
Click any case to see:
- **Case details** (case number, court, date, parties)
- **AI-extracted directives** — each directive is a specific order the court issued
- **Responsible department** auto-tagged per directive
- **Deadline** extracted from the judgment text
- **Compliance status** (Pending / In Progress / Completed)

#### 3. Create an Action Plan
On a directive card, click **"Create Action Plan"** to:
- Assign the directive to an officer
- Set a target completion date
- Add implementation notes

#### 4. Track Compliance
Navigate to **"Verify"** to see which directives have been actioned, with a full timeline of when each step was completed.

---

### Upload a Real Judgment

**Method 1: Via the UI**
1. Go to **Cases** → Click **"Upload Judgment"**
2. Enter the case number (e.g., `WP 1234/2024`)
3. Upload a PDF file (max 20 MB)
4. Click **Submit**

The system will:
- Upload the PDF to Supabase Storage
- Extract text using Tesseract OCR + pdf2image
- Send the text to Google Gemini 1.5 Flash
- Parse out structured directives (deadline, department, priority)
- Store everything in the database
- Redirect you to the case detail page

**Method 2: Via the API (Swagger)**
1. Open `http://localhost:8000/docs` (or the Cloud Run URL)
2. Authorize with your JWT token (get it from the `/api/v1/auth/login` endpoint)
3. Use `POST /api/v1/cases/upload` with your PDF file and case number

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | ✅ | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | ✅ | Service role key (bypasses RLS) |
| `SUPABASE_ANON_KEY` | ✅ | Anon/public key |
| `JWT_SECRET` | ✅ | Secret for signing JWTs (min 32 chars) |
| `JWT_ALGORITHM` | ❌ | Default: `HS256` |
| `JWT_EXPIRE_MINUTES` | ❌ | Default: `480` (8 hours) |
| `DEMO_MODE` | ❌ | `true` to enable demo features. Default: `true` |
| `ENVIRONMENT` | ❌ | `development` or `production` |
| `GEMINI_API_KEY` | ❌ | Google AI Studio key (required for AI extraction) |
| `CORS_ORIGINS` | ❌ | JSON array of allowed frontend URLs |
| `SMTP_HOST` | ❌ | SMTP server for OTP emails (optional in demo) |
| `SMTP_USER` | ❌ | SMTP username |
| `SMTP_PASSWORD` | ❌ | SMTP password / app password |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API base URL |
| `NEXT_PUBLIC_SUPABASE_URL` | ❌ | Supabase project URL (for client-side auth, if used) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ❌ | Supabase anon key (for client-side auth, if used) |

---

## 🗄️ Database Setup

The complete PostgreSQL schema is in `database/schema.sql`. Run it once in your Supabase project.

**Steps:**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project → **SQL Editor**
3. Click **"New query"**
4. Paste the contents of `database/schema.sql`
5. Click **Run**

**Schema creates these tables:**
| Table | Purpose |
|---|---|
| `users` | Government officers (auto-created from NIC SSO ID) |
| `cases` | Uploaded court judgments |
| `directives` | AI-extracted directives from each case |
| `action_plans` | Assigned tasks per directive |
| `notifications` | Alert records for officers |
| `otp_store` | Temporary OTP codes (TTL: 5 minutes) |
| `audit_log` | Immutable audit trail of all actions |

**Storage Bucket:** Create a bucket named `judgment-pdfs` in Supabase Storage (Settings → Storage → New Bucket).

---

## 🚢 Deployment

### Backend → Cloud Run

The backend is Dockerized and deployed to Google Cloud Run using the `cloudrun` MCP (or manually via `gcloud`).

**1. Copy and fill in the Dockerfile**
```bash
cd backend
cp Dockerfile.template Dockerfile
# Edit Dockerfile and fill in your ENV values
```

**2. Deploy using gcloud (manual)**
```bash
# Build and push image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/nyayasetu-backend

# Deploy to Cloud Run
gcloud run deploy nyayasetu-backend \
  --image gcr.io/YOUR_PROJECT_ID/nyayasetu-backend \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 8080
```

Or better, **use Google Cloud Run environment variables** (not baked into Dockerfile):
```bash
gcloud run services update nyayasetu-backend \
  --region europe-west1 \
  --set-env-vars "SUPABASE_URL=...,SUPABASE_SERVICE_KEY=...,..."
```

**Current production backend:**
```
https://nyayasetu-backend-xlldv3ypwq-ew.a.run.app
```

---

### Frontend → Vercel

**1. Go to [vercel.com/new](https://vercel.com/new)**

**2. Import the GitHub repository**
- Select `HarshSharma-28/NyayaSetu`

**3. Configure the project**
- **Framework:** Next.js (auto-detected)
- **Root Directory:** `NyayaSetu/frontend`

**4. Add Environment Variables** in the Vercel dashboard:
| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://nyayasetu-backend-xlldv3ypwq-ew.a.run.app` |

**5. Click Deploy** — Vercel will build and deploy automatically.

**6. Update backend CORS** — after you get your Vercel URL (e.g., `https://nyayasetu-xyz.vercel.app`), add it to the backend's `CORS_ORIGINS` environment variable and redeploy.

---

## 📖 API Reference

Full interactive documentation available at:
- **Swagger UI:** [/docs](https://nyayasetu-backend-xlldv3ypwq-ew.a.run.app/docs)
- **ReDoc:** [/redoc](https://nyayasetu-backend-xlldv3ypwq-ew.a.run.app/redoc)

### Key Endpoints

```
Authentication
  POST  /api/v1/auth/send-otp          Request OTP for a given NIC SSO ID
  POST  /api/v1/auth/login             Verify OTP + issue JWT token
  POST  /api/v1/auth/logout            Blacklist the current JWT
  GET   /api/v1/auth/me                Get current user profile

Cases
  GET   /api/v1/cases                  List all cases (paginated)
  POST  /api/v1/cases/upload           Upload a new judgment PDF
  GET   /api/v1/cases/{id}             Get a specific case with directives
  POST  /api/v1/cases/demo-upload      Upload the bundled demo judgment

Directives
  GET   /api/v1/directives             List all directives (filterable)
  GET   /api/v1/directives/{id}        Get a specific directive
  PATCH /api/v1/directives/{id}        Update directive status

Dashboard
  GET   /api/v1/dashboard/stats        Overview counts and metrics
  GET   /api/v1/dashboard/actions      Pending action items
  GET   /api/v1/dashboard/contempt-risk  High-risk upcoming deadlines

System
  GET   /health                        Health check (no auth required)
  GET   /ping                          UptimeRobot keep-alive
  GET   /docs                          Swagger UI
  GET   /redoc                         ReDoc documentation
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Run tests: `cd backend && pytest app/tests/`
5. Commit with a clear message
6. Open a Pull Request

**Never commit** `.env` files, `Dockerfile` with real secrets, or judgment PDFs.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
Built with ❤️ for improving judicial compliance in India's court system.
</div>
