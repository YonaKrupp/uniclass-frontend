import { getApiBase } from '../../shared/apiBase.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const MAX_FAILED_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;
const LOCK_MESSAGE = 'יותר מדי ניסיונות התחברות. נסו שוב בעוד 15 דקות.';

function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || '';
  return String(forwarded).split(',')[0].trim();
}

function attemptKeys(email: string, ip: string): string[] {
  return [`email:${email.toLowerCase()}`, ip ? `ip:${ip}` : ''].filter(Boolean);
}

async function findAttempt(base44: any, key: string) {
  const { items } = await base44.asServiceRole.entities.LoginAttempt.filter({ key }, { limit: 1 });
  return (items || [])[0] ?? null;
}

async function isLocked(base44: any, keys: string[]): Promise<boolean> {
  for (const key of keys) {
    const record = await findAttempt(base44, key);
    if (record?.locked_until && new Date(record.locked_until).getTime() > Date.now()) return true;
  }
  return false;
}

async function clearAttempts(base44: any, keys: string[]) {
  for (const key of keys) {
    const record = await findAttempt(base44, key);
    if (record?.id) await base44.asServiceRole.entities.LoginAttempt.delete(record.id);
  }
}

async function registerFailure(base44: any, keys: string[]): Promise<boolean> {
  const now = Date.now();
  let locked = false;
  for (const key of keys) {
    const record = await findAttempt(base44, key);
    if (!record) {
      await base44.asServiceRole.entities.LoginAttempt.create({
        key,
        count: 1,
        first_attempt_at: new Date(now).toISOString(),
      });
      continue;
    }
    const first = record.first_attempt_at ? new Date(record.first_attempt_at).getTime() : now;
    const insideWindow = now - first <= ATTEMPT_WINDOW_MS;
    const count = insideWindow ? Number(record.count || 0) + 1 : 1;
    const patch: Record<string, unknown> = {
      count,
      first_attempt_at: insideWindow ? record.first_attempt_at : new Date(now).toISOString(),
    };
    if (count >= MAX_FAILED_ATTEMPTS) {
      patch.locked_until = new Date(now + LOCK_MS).toISOString();
      locked = true;
    }
    await base44.asServiceRole.entities.LoginAttempt.update(record.id, patch);
  }
  return locked;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    const body = await req.json();
    const { userType } = body;
    // Trim email and password to avoid whitespace issues
    const email = body.email ? String(body.email).trim() : '';
    const password = body.password ? String(body.password) : '';

    if (!email || !password) {
      return Response.json({ error: 'חסרים אימייל או סיסמה' }, { status: 400 });
    }

    // הגבלת ניסיונות התחברות: 5 כישלונות בתוך 15 דקות → נעילה של 15 דקות.
    const ip = clientIp(req);
    const keys = attemptKeys(email, ip);
    let base44: any = null;
    try {
      base44 = createClientFromRequest(req);
      if (await isLocked(base44, keys)) {
        console.warn(`[authProxy] login blocked (locked): ${email}`);
        return Response.json(
          { success: false, locked: true, message: LOCK_MESSAGE, error: LOCK_MESSAGE, retryAfter: 900, _status: 429 },
          { status: 429, headers: { 'Retry-After': '900' } },
        );
      }
    } catch (guardError) {
      // תקלה בזיכרון הניסיונות לא חוסמת התחברות תקינה.
      console.error('[authProxy] rate limit check failed:', (guardError as Error).message);
      base44 = null;
    }

    const endpoint = userType === 'teacher'
      ? `${getApiBase(req)}/api/Auth/TeacherLogin`
      : `${getApiBase(req)}/api/Auth/StudentLogin`;

    const requestBody = { email, password };
    console.log('authProxy sending to:', endpoint);

    let apiRes;
    try {
      apiRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(requestBody),
      });
    } catch (fetchError) {
      console.error('authProxy: Failed to reach C# API (ngrok):', (fetchError as Error).message);
      return Response.json({
        success: false,
        error: 'שרת האימות אינו זמין כעת. אנא נסו שוב מאוחר יותר.',
        message: 'שרת האימות אינו זמין כעת. אנא נסו שוב מאוחר יותר.',
        _status: 503,
      });
    }

    const text = await apiRes.text();
    console.log('authProxy API status:', apiRes.status);
    console.log('authProxy API content-type:', apiRes.headers.get('content-type'));
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      // Response is not JSON (e.g., HTML error page from ASP.NET)
      data = {};
    }

    // רישום כישלון התחברות (פרטי שגויים בלבד)
    if (base44) {
      try {
        if (apiRes.status === 401) {
          const locked = await registerFailure(base44, keys);
          if (locked) {
            console.warn(`[authProxy] login locked after repeated failures: ${email}`);
            return Response.json(
              { success: false, locked: true, message: LOCK_MESSAGE, error: LOCK_MESSAGE, _status: 429 },
              { status: 429 },
            );
          }
        } else if (apiRes.status < 400) {
          await clearAttempts(base44, keys);
        }
      } catch (limitError) {
        console.error('[authProxy] failed to record attempt:', (limitError as Error).message);
      }
    }

    // If the C# API returned 500+ with no usable JSON, return a clean error
    if (apiRes.status >= 500 && (!data.success && !data.message)) {
      return Response.json({
        success: false,
        message: 'שגיאת שרת אימות (500). אנא נסו שוב מאוחר יותר.',
        _status: apiRes.status,
      });
    }

    // Always return 200 so the frontend can read the actual error message
    return Response.json({ ...data, _status: apiRes.status });
  } catch (error) {
    console.error('authProxy: Unexpected error:', (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});