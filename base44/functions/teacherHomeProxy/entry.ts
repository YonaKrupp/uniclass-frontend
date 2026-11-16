import { getApiBase } from '../../shared/apiBase.ts';
import { requireUser, sameEmail, forbidden } from '../../shared/requireUser.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { token, todayDate } = body;

    const auth = await requireUser(token);
    if (!auth.ok) return auth.response;

    const requestedEmail = String(body.email || '').trim();
    if (requestedEmail && !sameEmail(requestedEmail, auth.email)) {
      return forbidden('אין הרשאה לנתוני מורה אחר');
    }

    const url = `${getApiBase(req)}/api/TeacherHomeVar?teacherEmail=${encodeURIComponent(auth.email)}&date=${encodeURIComponent(todayDate)}`;

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