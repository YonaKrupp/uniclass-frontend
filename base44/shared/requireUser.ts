import { secrets } from 'base44:runtime';
import {
  parseToken,
  claimEmail,
  claimRole,
  claimUserType,
  isTokenExpired,
  isNotYetValid,
  hasSupportedAlgorithm,
} from './tokenAuth.ts';

// Single server-side identity check shared by every proxy that returns a user's
// data. Default is DENY: without a structurally valid, unexpired token signed
// with the API's HMAC key the request is rejected before anything is forwarded.
//
// The identity (email / role / userType) always comes from the verified token —
// never from a request field such as studentEmail / teacherEmail / role / userId.
//
// Signature: verified cryptographically here when the CSHARP_JWT_KEY secret is
// configured (the same Jwt:Key the API server signs with). Without that secret
// the structural, expiry and algorithm checks below still apply, and the API
// server remains the authority that verifies the signature on every forward.

export type AuthResult =
  | { ok: true; email: string; role: string; userType: string; token: string }
  | { ok: false; response: Response };

function deny(message: string): { ok: false; response: Response } {
  return { ok: false, response: Response.json({ error: message }, { status: 401 }) };
}

function getSigningKey(): string {
  try {
    return String(secrets.get('CSHARP_JWT_KEY') || '').trim();
  } catch {
    return '';
  }
}

function base64UrlToBytes(value: string): Uint8Array {
  const b64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

async function hasValidSignature(token: string, key: string): Promise<boolean> {
  const parts = token.split('.');
  if (parts.length !== 3 || !parts[2]) return false;
  try {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(key),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    return await crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      base64UrlToBytes(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    );
  } catch {
    return false;
  }
}

export async function requireUser(token: unknown): Promise<AuthResult> {
  const value = String(token ?? '').trim();
  if (!value) return deny('נדרשת התחברות');

  const parsed = parseToken(value);
  if (!parsed) return deny('טוקן לא תקין');
  if (!hasSupportedAlgorithm(value)) return deny('טוקן לא תקין');
  if (isTokenExpired(value)) return deny('פג תוקף ההתחברות, יש להתחבר מחדש');
  if (isNotYetValid(value)) return deny('טוקן לא תקין');

  const email = claimEmail(parsed.payload);
  if (!email) return deny('טוקן לא תקין');

  const signingKey = getSigningKey();
  if (signingKey && !(await hasValidSignature(value, signingKey))) {
    return deny('טוקן לא תקין');
  }

  return {
    ok: true,
    email,
    role: claimRole(parsed.payload),
    userType: claimUserType(parsed.payload),
    token: value,
  };
}

export function sameEmail(a: unknown, b: unknown): boolean {
  const left = String(a ?? '').trim().toLowerCase();
  const right = String(b ?? '').trim().toLowerCase();
  return Boolean(left) && left === right;
}

export function forbidden(message = 'אין הרשאה לנתונים של משתמש אחר'): Response {
  return Response.json({ error: message }, { status: 403 });
}

/** Allows the action when the caller is the owner of the record, or an admin. */
export function isOwnerOrAdmin(ownerEmail: unknown, callerEmail: string, isAdmin: boolean): boolean {
  return isAdmin || sameEmail(ownerEmail, callerEmail);
}