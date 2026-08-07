import { getApiBase } from '../../shared/apiBase.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { studentEmail, gn06_id, token } = body;

    if (!studentEmail || !gn06_id) {
      return Response.json({ error: 'חסרים פרמטרים (studentEmail / gn06_id)' }, { status: 400 });
    }

    const url = `${getApiBase(req)}/api/StudentHome/cancelLesson?studentEmail=${encodeURIComponent(studentEmail)}&gn06_id=${encodeURIComponent(gn06_id)}`;

    const apiRes = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': `Bearer ${token}`,
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