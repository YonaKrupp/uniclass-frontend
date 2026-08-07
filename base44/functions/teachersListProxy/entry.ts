import { getApiBase } from '../../shared/apiBase.ts';

Deno.serve(async (req) => {
  try {
    const { studentEmail, todayDate, token } = await req.json();

    if (!studentEmail) {
      return Response.json({ error: 'חסר אימייל תלמיד' }, { status: 400 });
    }

    const apiUrl = `${getApiBase(req)}/api/StudentsList/select_teachersList?studentEmail=${encodeURIComponent(studentEmail)}&date=${encodeURIComponent(todayDate)}`;

    const apiRes = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    const text = await apiRes.text();
    console.log('TeachersList API status:', apiRes.status);
    console.log('TeachersList API response:', text);
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
    console.error('TeachersList proxy error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});