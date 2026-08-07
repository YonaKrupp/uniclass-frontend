import { getApiBase } from '../../shared/apiBase.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { studentEmail, token } = body;

    if (!studentEmail) return Response.json({ error: 'חסר אימייל תלמיד' }, { status: 400 });

    const url = `${getApiBase(req)}/api/StudentHome/studentHomeList?studentEmail=${encodeURIComponent(studentEmail)}`;

    const apiRes = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': `Bearer ${token}`,
      },
    });

    const text = await apiRes.text();
    console.log('StudentHome API status:', apiRes.status);
    console.log('StudentHome API response:', text);
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return Response.json({ ...data, _status: apiRes.status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});