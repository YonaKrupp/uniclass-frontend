import { getApiBase } from '../../shared/apiBase.ts';
import { requireUser, sameEmail, forbidden } from '../../shared/requireUser.ts';
import { isAdminEmail } from '../../shared/adminAuth.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { gn06_id, token } = body;

    const auth = await requireUser(token);
    if (!auth.ok) return auth.response;

    const callerIsAdmin = isAdminEmail(auth.email);
    const requestedEmail = String(body.studentEmail || '').trim();

    // הבעלות נקבעת לפי הטוקן: התלמיד מבטל שיעור של עצמו בלבד; מנהל רשאי לבטל עבור תלמיד שצוין.
    if (!callerIsAdmin && requestedEmail && !sameEmail(requestedEmail, auth.email)) {
      return forbidden('אין הרשאה לבטל שיעור של תלמיד אחר');
    }

    if (!gn06_id) {
      return Response.json({ error: 'חסרים פרמטרים (gn06_id)' }, { status: 400 });
    }

    const studentEmail = callerIsAdmin && requestedEmail ? requestedEmail : auth.email;

    const url = `${getApiBase(req)}/api/StudentHome/cancelLesson?studentEmail=${encodeURIComponent(studentEmail)}&gn06_id=${encodeURIComponent(gn06_id)}`;

    const apiRes = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': `Bearer ${auth.token}`,
      },
      body: JSON.stringify({ studentEmail, gn06_id: String(gn06_id) }),
    });

    const text = await apiRes.text();
    console.log('cancelLesson API status:', apiRes.status);
    console.log('cancelLesson API response:', text);
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return Response.json({ ...data, _status: apiRes.status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});