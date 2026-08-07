import { getApiBase } from '../../shared/apiBase.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { studentEmail, token } = body;

    if (!studentEmail) return Response.json({ error: 'חסר אימייל תלמיד' }, { status: 400 });

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