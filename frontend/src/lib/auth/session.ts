/**
 * Session management for prototype.
 * Stores minimal user context in localStorage.
 * In production: httpOnly cookies + JWT.
 */

export interface UserSession {
  nicSsoId: string;
  role: 'admin' | 'reviewer' | 'officer';
  userId?: string;
  loginTime: number;
}

export const Session = {
  save(session: UserSession): void {
    try {
      localStorage.setItem('nyaya_session', JSON.stringify(session));
    } catch (error) {
      console.error('[Session] Failed to save:', error);
    }
  },

  get(): UserSession | null {
    try {
      const raw = localStorage.getItem('nyaya_session');
      if (!raw) return null;
      return JSON.parse(raw) as UserSession;
    } catch {
      return null;
    }
  },

  clear(): void {
    try {
      localStorage.removeItem('nyaya_session');
    } catch { /* silent */ }
  },

  getRole(): 'admin' | 'reviewer' | 'officer' | null {
    return this.get()?.role ?? null;
  },
};
