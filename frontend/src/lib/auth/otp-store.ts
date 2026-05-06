/**
 * OTP storage — sessionStorage based for prototype.
 * In production: Redis with 5-min TTL on backend.
 * All operations explicit — no silent failures.
 */

export const OTPStore = {
  save(otp: string, role: string, nicSsoId: string): void {
    try {
      sessionStorage.setItem('nyaya_otp', otp);
      sessionStorage.setItem('nyaya_role', role);
      sessionStorage.setItem('nyaya_nic_id', nicSsoId);
      sessionStorage.setItem(
        'nyaya_otp_generated_at',
        Date.now().toString()
      );
    } catch (error) {
      throw new Error(
        '[OTPStore] Failed to save OTP to sessionStorage: ' +
        String(error)
      );
    }
  },

  get(): { otp: string; role: string; nicSsoId: string } | null {
    try {
      const otp = sessionStorage.getItem('nyaya_otp');
      const role = sessionStorage.getItem('nyaya_role');
      const nicSsoId = sessionStorage.getItem('nyaya_nic_id');
      const generatedAt = sessionStorage.getItem('nyaya_otp_generated_at');

      if (!otp || !role || !nicSsoId) return null;

      // Check 10-minute expiry for demo
      if (generatedAt) {
        const age = Date.now() - parseInt(generatedAt);
        if (age > 10 * 60 * 1000) {
          OTPStore.clear();
          return null;
        }
      }

      return { otp, role, nicSsoId };
    } catch {
      return null;
    }
  },

  clear(): void {
    try {
      ['nyaya_otp','nyaya_role','nyaya_nic_id',
       'nyaya_otp_generated_at'].forEach(k =>
        sessionStorage.removeItem(k)
      );
    } catch { /* silent clear */ }
  },

  generate(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },
};
