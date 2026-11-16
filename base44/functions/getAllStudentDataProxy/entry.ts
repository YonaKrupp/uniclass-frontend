import { getApiBase } from '../../shared/apiBase.ts';
import { requireUser, forbidden } from '../../shared/requireUser.ts';
import { isAdminEmail } from '../../shared/adminAuth.ts';

// Returns one student's full record. Identity comes from the verified token:
// a student may read only their own record, an admin may read any student's.
Deno.serve(async (req) => {
  try {
    // Body is parsed defensively so a request with no body still reaches the auth check.
    let body: any = {};
    try { body = await req.json(); } catch { body = {}; }

    const auth = await requireUser(body?.token);
    if (!auth.ok) return auth.response;

    const studentEmail = String(body?.studentEmail || '').trim();
    if (!studentEmail) return Response.json({ error: 'חסר אימייל תלמיד' }, { status: 400 });

    const callerIsAdmin = isAdminEmail(auth.email);
    if (!callerIsAdmin && studentEmail.toLowerCase() !== auth.email.toLowerCase()) {
      return forbidden('אין הרשאה לנתוני תלמיד אחר');
    }

    // Forward the caller's own token — never a fixed service token — so the API
    // server applies its own authorization on top of the check above.
    const url = `${getApiBase(req)}/api/Student/getAllStudentData`;

    const apiRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': `Bearer ${auth.token}`,
      },
      body: JSON.stringify({ studentEmail }),
    });

    const text = await apiRes.text();
    console.log('getAllStudentData API status:', apiRes.status);
    console.log('getAllStudentData API response:', text);
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    // Forward the API server's own status code and body unchanged, so a 401/403
    // from the server reaches the client as 401/403 instead of a wrapped 200.
    return Response.json(data, { status: apiRes.status });
  } catch (error) {
    console.error('getAllStudentDataProxy error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});