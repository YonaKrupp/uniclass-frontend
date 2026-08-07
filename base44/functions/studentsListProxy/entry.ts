import { getApiBase } from '../../shared/apiBase.ts';

Deno.serve(async (req) => {
  try {
    const { email, todayDate, token } = await req.json();

    const apiUrl = `${getApiBase(req)}/api/StudentsList?teacherEmail=${encodeURIComponent(email)}&todayDate=${encodeURIComponent(todayDate)}`;

    const apiRes = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    const text = await apiRes.text();
    console.log('StudentsList API status:', apiRes.status);
    console.log('StudentsList API response:', text);
    if (!text || text.trim() === '') {
      return Response.json({ Data: [], _status: apiRes.status });
    }
    let data;
    try { data = JSON.parse(text); } catch { data = { message: text }; }

    if (Array.isArray(data)) {
      return Response.json({ Data: data, _status: apiRes.status });
    }
    return Response.json({ ...data, _status: apiRes.status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});