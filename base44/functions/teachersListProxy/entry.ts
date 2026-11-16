import { getApiBase } from '../../shared/apiBase.ts';
import { requireUser, sameEmail, forbidden } from '../../shared/requireUser.ts';
import { stripSensitiveFields } from '../../shared/redact.ts';

Deno.serve(async (req) => {
  try {
    let body: any = {};
    try { body = await req.json(); } catch { body = {}; }
    const { todayDate, token } = body;

    // הזהות נלקחת מהטוקן של המשתמש המחובר בלבד — לא מפרמטר שהלקוח שולח.
    const auth = await requireUser(token);
    if (!auth.ok) return auth.response;

    const requestedStudentEmail = String(body.studentEmail || '').trim();
    if (requestedStudentEmail && !sameEmail(requestedStudentEmail, auth.email)) {
      return forbidden('אין הרשאה לרשימת המורים של תלמיד אחר');
    }

    const apiUrl = `${getApiBase(req)}/api/StudentsList/select_teachersList?studentEmail=${encodeURIComponent(auth.email)}&date=${encodeURIComponent(todayDate)}`;

    const apiRes = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${String(token).trim()}`,
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

    // ת"ז ומזהים אישיים אינם נשלחים לתלמיד שמחפש מורה.
    if (Array.isArray(data)) {
      return Response.json({ Data: stripSensitiveFields(data), _status: apiRes.status });
    }
    return Response.json({ ...stripSensitiveFields(data), _status: apiRes.status });
  } catch (error) {
    console.error('TeachersList proxy error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});