import { getApiBase } from '../../shared/apiBase.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { email, token, todayDate } = body;

    if (!email) return Response.json({ error: 'חסר אימייל' }, { status: 400 });

    const url = `${getApiBase(req)}/api/TeacherHomeVar?teacherEmail=${encodeURIComponent(email)}&date=${encodeURIComponent(todayDate)}`;

    const apiRes = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': `Bearer ${token}`,
      },
    });

    const text = await apiRes.text();
    console.log('API status:', apiRes.status);
    console.log('API response:', text);
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return Response.json({ ...data, _status: apiRes.status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});