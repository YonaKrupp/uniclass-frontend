import { getApiBase } from '../../shared/apiBase.ts';
import { requireUser, sameEmail, forbidden } from '../../shared/requireUser.ts';

Deno.serve(async (req) => {
  try {
    let body: any = {};
    try { body = await req.json(); } catch { body = {}; }
    const { todayDate, token } = body;

    const auth = await requireUser(token);
    if (!auth.ok) return auth.response;

    const requestedTeacherEmail = String(body.email || '').trim();
    if (requestedTeacherEmail && !sameEmail(requestedTeacherEmail, auth.email)) {
      return forbidden('אין הרשאה לרשימת התלמידים של מורה אחר');
    }

    const apiUrl = `${getApiBase(req)}/api/StudentsList?teacherEmail=${encodeURIComponent(auth.email)}&todayDate=${encodeURIComponent(todayDate)}`;

    const apiRes = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${String(token).trim()}`,
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