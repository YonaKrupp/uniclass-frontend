import { requireUser } from './requireUser.ts';

// The platform account(s) allowed to reach the internal admin interface.
// Checked on the server for every admin request, never only in the UI — and only
// after the caller's token has passed requireUser (structure, expiry, signature).
export const ADMIN_EMAILS = ['idanmichaly@gmail.com'];

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(String(email || '').trim().toLowerCase());
}

export type AdminCheck = { ok: true; email: string } | { ok: false; status: number; error: string };

export async function requireAdmin(token: unknown): Promise<AdminCheck> {
  const auth = await requireUser(token);
  if (!auth.ok) {
    let message = 'נדרשת התחברות';
    try {
      const body = await auth.response.clone().json();
      message = String(body?.error || message);
    } catch { /* keep default */ }
    return { ok: false, status: auth.response.status, error: message };
  }
  if (!isAdminEmail(auth.email)) {
    return { ok: false, status: 403, error: 'אין הרשאה לגשת לממשק הניהול' };
  }
  return { ok: true, email: auth.email };
}