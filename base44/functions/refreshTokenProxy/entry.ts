import { getApiBase } from '../../shared/apiBase.ts';
import { checkLimit, noteAttempt, tooManyAttemptsResponse, ipKey } from '../../shared/rateLimit.ts';

// חידוש טוקן — עד 20 בקשות ב-15 דקות לכל כתובת IP.
const REFRESH_LIMIT = { max: 20, windowMs: 15 * 60 * 1000, lockMs: 15 * 60 * 1000 };

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
    const refreshToken = body.refreshToken || body.RefreshToken || '';

    if (!refreshToken) {
      return Response.json({ error: 'Missing refresh token' }, { status: 400 });
    }

    const limitKeys = [ipKey(req)].filter(Boolean);
    const limitState = await checkLimit(req, limitKeys);
    if (limitState.limited) return tooManyAttemptsResponse(limitState.retryAfter);
    await noteAttempt(req, limitKeys, REFRESH_LIMIT);

    const endpoint = `${getApiBase(req)}/api/Auth/RefreshToken`;

    console.log('[refreshTokenProxy] Calling:', endpoint);

    let apiRes;
    try {
      apiRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (fetchError) {
      console.error('[refreshTokenProxy] Failed to reach C# API:', fetchError.message);
      return Response.json({
        success: false,
        error: 'שרת האימות אינו זמין כעת',
        _status: 503,
      });
    }

    const text = await apiRes.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }

    console.log('[refreshTokenProxy] C# status:', apiRes.status);

    return Response.json({ ...data, _status: apiRes.status });
  } catch (error) {
    console.error('[refreshTokenProxy] Unexpected error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});