import { getApiBase } from '../../shared/apiBase.ts';

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
      console.error('authProxy: Failed to reach C# API (ngrok):', fetchError.message);
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
    console.error('authProxy: Unexpected error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});