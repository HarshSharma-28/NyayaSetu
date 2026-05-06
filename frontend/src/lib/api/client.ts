import { Session } from '../auth/session';
import { ApiError } from './api-error';

/**
 * Typed API client — all endpoints go through here.
 * Explicit error handling per status code.
 * Never silently swallow errors.
 */

// Basic Types
type LoginBody = any;
type LoginResponse = any;
type UserProfile = any;
type DashboardStats = any;
type ActionPlan = any;
type ActionFilters = any;
type CaseFilters = any;
type PaginatedCases = any;
type Case = any;
type Directive = any;
type DirectiveEdit = any;
type UserFilters = any;
type User = any;
type Notification = any;

class NyayaSetuApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';
    if (!process.env.NEXT_PUBLIC_API_URL) {
      console.warn(
        '[ApiClient] NEXT_PUBLIC_API_URL is not set. Using localhost fallback.'
      );
    }
  }

  private getHeaders(): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });
    // In prototype Session doesn't store token, but let's assume it might or we get it from elsewhere
    // const session = Session.get();
    // if (session?.token) {
    //   headers.set('Authorization', `Bearer ${session.token}`);
    // }
    return headers;
  }

  async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    params?: Record<string, string>
  ): Promise<T> {
    let url = `${this.baseUrl}${endpoint}`;
    if (params && Object.keys(params).length > 0) {
      url += '?' + new URLSearchParams(params).toString();
    }

    const response = await fetch(url, {
      method,
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }

    return response.json() as Promise<T>;
  }

  // Typed endpoint methods
  auth = {
    sendOTP: (nicSsoId: string) =>
      this.request('POST', '/api/v1/auth/send-otp', { nic_sso_id: nicSsoId }),
    login: (data: LoginBody) =>
      this.request<LoginResponse>('POST', '/api/v1/auth/login', data),
    logout: () =>
      this.request('POST', '/api/v1/auth/logout'),
    me: () =>
      this.request<UserProfile>('GET', '/api/v1/auth/me'),
  };

  dashboard = {
    stats: () =>
      this.request<DashboardStats>('GET', '/api/v1/dashboard/stats'),
    actions: (filters?: ActionFilters) =>
      this.request<ActionPlan[]>('GET', '/api/v1/dashboard/actions', undefined, filters as any),
    contemptRisk: () =>
      this.request('GET', '/api/v1/dashboard/contempt-risk'),
  };

  cases = {
    list: (filters?: CaseFilters) =>
      this.request<PaginatedCases>('GET', '/api/v1/cases', undefined, filters as any),
    get: (id: string) =>
      this.request<Case>('GET', `/api/v1/cases/${id}`),
    upload: (formData: FormData) => {
      return fetch(`${this.baseUrl}/api/v1/cases/upload`, {
        method: 'POST',
        headers: { 
          // 'Authorization': `Bearer ${Session.get()?.token}` 
        },
        body: formData,
      }).then(async r => {
        if (!r.ok) throw await ApiError.fromResponse(r);
        return r.json();
      });
    },
    delete: (id: string) =>
      this.request('DELETE', `/api/v1/cases/${id}`),
  };

  verify = {
    queue: () =>
      this.request<Directive[]>('GET', '/api/v1/verify/queue'),
    approve: (id: string) =>
      this.request('POST', `/api/v1/verify/${id}/approve`),
    edit: (id: string, data: DirectiveEdit) =>
      this.request('POST', `/api/v1/verify/${id}/edit`, data),
    reject: (id: string, reason: string) =>
      this.request('POST', `/api/v1/verify/${id}/reject`, { reason }),
  };

  users = {
    list: (filters?: UserFilters) =>
      this.request<User[]>('GET', '/api/v1/users', undefined, filters as any),
    updateRole: (id: string, role: string) =>
      this.request('PUT', `/api/v1/users/${id}/role`, { role }),
    toggleActive: (id: string) =>
      this.request('PUT', `/api/v1/users/${id}/toggle-active`),
    delete: (id: string) =>
      this.request('DELETE', `/api/v1/users/${id}`),
  };

  notifications = {
    list: (unread?: boolean) =>
      this.request<Notification[]>('GET', '/api/v1/notifications', undefined, unread ? { is_read: 'false' } : undefined),
    markRead: (id: string) =>
      this.request('PUT', `/api/v1/notifications/${id}/read`),
    markAllRead: () =>
      this.request('PUT', '/api/v1/notifications/read-all'),
  };

  actionPlans = {
    list: (filters?: ActionFilters) =>
      this.request<ActionPlan[]>('GET', '/api/v1/action-plans', undefined, filters as any),
    updateStatus: (id: string, status: string, note?: string) =>
      this.request('PUT', `/api/v1/action-plans/${id}/status`, { completion_status: status, completion_note: note }),
  };
}

export const api = new NyayaSetuApiClient();
