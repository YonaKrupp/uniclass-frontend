import { getApiBase } from '../../shared/apiBase.ts';
import { requireUser, sameEmail, forbidden } from '../../shared/requireUser.ts';
import { stripSensitiveFields } from '../../shared/redact.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { studentEmail, subjectId, token } = body;

    const auth = await requireUser(token);
    if (!auth.ok) return auth.response;

    if (studentEmail && !sameEmail(studentEmail, auth.email)) {
      return forbidden('אין הרשאה לחיפוש מורים עבור תלמיד אחר');
    }

    if (!subjectId) return Response.json({ error: 'חסר מזהה מקצוע' }, { status: 400 });

    const url = `${getApiBase(req)}/api/Student/searchTeachersBySubject`;

    const apiRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ studentEmail: auth.email, subjectId }),
    });

    const text = await apiRes.text();
    console.log('searchTeachersBySubject API status:', apiRes.status);
    console.log('searchTeachersBySubject API response:', text);
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return Response.json(stripSensitiveFields(data));
  } catch (error) {
    console.error('searchTeachersBySubjectProxy error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});