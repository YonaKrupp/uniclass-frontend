// Shared helpers for reading and validating the C# auth JWT.
//
// The token has three base64url segments (header.payload.signature). Everything
// here only PARSES the token — the signature itself is verified in requireUser.ts
// (cryptographically when CSHARP_JWT_KEY is configured, and always by the API
// server on every forwarded call).

/** The claim name .NET uses for roles when the token is serialized. */
export const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

function decodeSegment(segment: string): any {
  const b64 = String(segment || '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

export interface ParsedToken {
  header: Record<string, any>;
  payload: Record<string, any>;
  parts: string[];
}

/**
 * Strict structural parse: exactly three non-empty segments, and the header and
 * payload must both be JSON objects. Anything else (empty, truncated, `none`
 * algorithm with two segments, random text) returns null.
 */
export function parseToken(token: unknown): ParsedToken | null {
  const value = String(token ?? '').trim();
  if (!value || value.length > 4096) return null;
  const parts = value.split('.');
  if (parts.length !== 3) return null;
  if (parts.some((part) => !part)) return null;
  try {
    const header = decodeSegment(parts[0]);
    const payload = decodeSegment(parts[1]);
    if (!header || typeof header !== 'object' || Array.isArray(header)) return null;
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
    return { header, payload, parts };
  } catch {
    return null;
  }
}

export function claimEmail(payload: Record<string, any> | null | undefined): string {
  if (!payload) return '';
  return String(
    payload.email || payload.Email || payload.unique_name || payload.name || '',
  ).trim();
}

export function claimRole(payload: Record<string, any> | null | undefined): string {
  if (!payload) return '';
  return String(payload[ROLE_CLAIM] || payload.role || payload.Role || '').trim();
}

export function claimUserType(payload: Record<string, any> | null | undefined): string {
  if (!payload) return '';
  return String(payload.userType || payload.UserType || '').trim();
}

export function emailFromToken(token: string): string {
  return claimEmail(parseToken(token)?.payload);
}

export function roleFromToken(token: string): string {
  return claimRole(parseToken(token)?.payload);
}

/** A token without an `exp` claim is treated as expired — never as valid forever. */
export function isTokenExpired(token: string): boolean {
  const payload = parseToken(token)?.payload;
  if (!payload) return true;
  const exp = Number(payload.exp || 0);
  if (!exp) return true;
  return exp * 1000 <= Date.now();
}

/** True when the token is signed with HMAC SHA-256 (the algorithm the API issues). */
export function hasSupportedAlgorithm(token: string): boolean {
  const alg = String(parseToken(token)?.header?.alg || '');
  return alg === 'HS256';
}

/** Rejects tokens that are not yet valid (`nbf` in the future). */
export function isNotYetValid(token: string, clockSkewMs = 60000): boolean {
  const payload = parseToken(token)?.payload;
  if (!payload) return true;
  const nbf = Number(payload.nbf || 0);
  if (!nbf) return false;
  return nbf * 1000 > Date.now() + clockSkewMs;
}