import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Server-side attempt limiter shared by the login / reset / consent / contact
// entry points. Counters live in the LoginAttempt entity (admin-only RLS) and are
// always accessed with the service role.

export interface LimitOptions {
  max: number;
  windowMs: number;
  lockMs: number;
}

export const GENERIC_LIMIT_MESSAGE = 'יותר מדי ניסיונות. נסו שוב בעוד מספר דקות.';

/** 5 attempts per 15 minutes, then a 15 minute lock — the login/reset default. */
export const FIVE_PER_15_MIN: LimitOptions = {
  max: 5,
  windowMs: 15 * 60 * 1000,
  lockMs: 15 * 60 * 1000,
};

export function clientIp(req: Request): string {
  const forwarded =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-real-ip') ||
    '';
  return String(forwarded).split(',')[0].trim();
}

export function ipKey(req: Request): string {
  const ip = clientIp(req);
  return ip ? `ip:${ip}` : '';
}

export function keyFor(scope: string, value: unknown): string {
  const normalized = String(value ?? '').trim().toLowerCase();
  return normalized ? `${scope}:${normalized}` : '';
}

function attemptStore(req: Request) {
  return createClientFromRequest(req).asServiceRole.entities.LoginAttempt;
}

async function findRecord(req: Request, key: string): Promise<any> {
  const { items } = await attemptStore(req).filter({ key }, { limit: 1 });
  return (items || [])[0] ?? null;
}

export interface LimitState {
  limited: boolean;
  retryAfter: number;
}

/** Read-only check: is any of these keys currently locked? */
export async function checkLimit(req: Request, keys: string[]): Promise<LimitState> {
  for (const key of keys.filter(Boolean)) {
    const record = await findRecord(req, key);
    const until = record?.locked_until ? new Date(record.locked_until).getTime() : 0;
    if (until > Date.now()) {
      return { limited: true, retryAfter: Math.max(1, Math.ceil((until - Date.now()) / 1000)) };
    }
  }
  return { limited: false, retryAfter: 0 };
}

/** Counts one attempt against each key and locks them once `max` is reached. */
export async function noteAttempt(
  req: Request,
  keys: string[],
  options: LimitOptions,
): Promise<LimitState> {
  const now = Date.now();
  let retryAfter = 0;

  for (const key of keys.filter(Boolean)) {
    const record = await findRecord(req, key);
    if (!record) {
      await attemptStore(req).create({
        key,
        count: 1,
        first_attempt_at: new Date(now).toISOString(),
      });
      continue;
    }
    const first = record.first_attempt_at ? new Date(record.first_attempt_at).getTime() : now;
    const insideWindow = now - first <= options.windowMs;
    const count = insideWindow ? Number(record.count || 0) + 1 : 1;
    const patch: Record<string, unknown> = {
      count,
      first_attempt_at: insideWindow ? record.first_attempt_at : new Date(now).toISOString(),
    };
    if (count >= options.max) {
      const lockUntil = now + options.lockMs;
      patch.locked_until = new Date(lockUntil).toISOString();
      retryAfter = Math.max(retryAfter, Math.ceil((lockUntil - now) / 1000));
    }
    await attemptStore(req).update(record.id, patch);
  }

  return { limited: retryAfter > 0, retryAfter };
}

export async function clearLimit(req: Request, keys: string[]): Promise<void> {
  for (const key of keys.filter(Boolean)) {
    const record = await findRecord(req, key);
    if (record?.id) await attemptStore(req).delete(record.id);
  }
}

/** 429 response with the standard headers and a generic Hebrew message. */
export function tooManyAttemptsResponse(retryAfter: number, message = GENERIC_LIMIT_MESSAGE): Response {
  return Response.json(
    { success: false, error: message, message, retryAfter, _status: 429 },
    { status: 429, headers: { 'Retry-After': String(Math.max(1, retryAfter)) } },
  );
}