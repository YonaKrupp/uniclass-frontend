import { getApiBase } from '../../shared/apiBase.ts';

// Reads the identity (email) out of the logged-in user's JWT payload.
// The signature itself is verified by the API server on every forwarded call.
function emailFromToken(token: string): string {
  try {
    const part = token.split('.')[1];
    if (!part) return '';
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const payload = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(padded), (c) => c.charCodeAt(0))));
    return String(payload.email || payload.Email || payload.unique_name || payload.name || '').trim();
  } catch {
    return '';
  }
}

Deno.serve(async (req) => {
  try {
    // Body is parsed defensively so a request with no body still reaches the auth check.
    let body: any = {};
    try { body = await req.json(); } catch { body = {}; }

    // 1) Auth first: without a logged-in user's token the request is rejected before
    //    any parameter check, so both an empty request and an email-only one return 401.
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    if (!token) return Response.json({ error: 'נדרשת התחברות' }, { status: 401 });

    // 2) The identity comes from the token, never from the request body.
    const tokenEmail = emailFromToken(token);
    if (!tokenEmail) return Response.json({ error: 'טוקן לא תקין' }, { status: 401 });

    const studentEmail = String(body?.studentEmail || '').trim();
    if (!studentEmail) return Response.json({ error: 'חסר אימייל תלמיד' }, { status: 400 });
    if (studentEmail.toLowerCase() !== tokenEmail.toLowerCase()) {
      return Response.json({ error: 'אין הרשאה לנתוני תלמיד אחר' }, { status: 403 });
    }

    // 3) Forward the logged-in user's own token — never a fixed service token —
    //    so the API server rejects unauthorised requests on its own.
    const url = `${getApiBase(req)}/api/Student/getAllStudentData`;

    const apiRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ studentEmail }),
    });

    const text = await apiRes.text();
    console.log('getAllStudentData API status:', apiRes.status);
    console.log('getAllStudentData API response:', text);
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return Response.json({ ...data, _status: apiRes.status });
  } catch (error) {
    console.error('getAllStudentDataProxy error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});