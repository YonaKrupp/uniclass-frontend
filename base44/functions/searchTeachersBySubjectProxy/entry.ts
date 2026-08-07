import { getApiBase } from '../../shared/apiBase.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { studentEmail, subjectId, token } = body;

    if (!studentEmail) return Response.json({ error: 'חסר אימייל תלמיד' }, { status: 400 });
    if (!subjectId) return Response.json({ error: 'חסר מזהה מקצוע' }, { status: 400 });

    const url = `${getApiBase(req)}/api/Student/searchTeachersBySubject`;

    const apiRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ studentEmail, subjectId }),
    });

    const text = await apiRes.text();
    console.log('searchTeachersBySubject API status:', apiRes.status);
    console.log('searchTeachersBySubject API response:', text);
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return Response.json(data);
  } catch (error) {
    console.error('searchTeachersBySubjectProxy error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});