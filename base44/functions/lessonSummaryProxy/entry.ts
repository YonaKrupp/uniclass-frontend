import { getApiBase } from '../../shared/apiBase.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { action, email, token, date, show, gn06Id, description } = body;

    const BASE = `${getApiBase(req)}/api/LessonSummary`;

    // GET list
    if (!action || action === 'getSummary') {
      if (!email) return Response.json({ error: 'חסר אימייל' }, { status: 400 });
      const showParam = show ?? 0;
      const url = `${BASE}?teacherEmail=${encodeURIComponent(email)}&date=${encodeURIComponent(date)}&show=${encodeURIComponent(showParam)}`;
      const apiRes = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${token}`,
        },
      });
      const text = await apiRes.text();
      console.log('LessonSummary status:', apiRes.status);
      console.log('LessonSummary response:', text);
      let data;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }
      return Response.json({ ...data, _status: apiRes.status });
    }

    // GET feedback for student
    if (action === 'loadFeedbackForStudent') {
      if (!email) return Response.json({ error: 'חסר אימייל תלמיד' }, { status: 400 });
      const url = `${BASE}/loadFeedbackForStudent?studentEmail=${encodeURIComponent(email)}&date=${encodeURIComponent(date)}`;
      const apiRes = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${token}`,
        },
      });
      const text = await apiRes.text();
      console.log('loadFeedbackForStudent status:', apiRes.status);
      console.log('loadFeedbackForStudent response:', text);
      let data;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }
      return Response.json({ ...data, _status: apiRes.status });
    }

    // POST set feedback
    if (action === 'setFeedback') {
      if (!gn06Id) return Response.json({ error: 'חסר מזהה gn06Id' }, { status: 400 });
      const apiRes = await fetch(`${BASE}/set_teacher_feedback_4_student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ gn06Id, description }),
      });
      const text = await apiRes.text();
      console.log('SetFeedback status:', apiRes.status);
      console.log('SetFeedback response:', text);
      let data;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }
      return Response.json({ ...data, _status: apiRes.status });
    }

    return Response.json({ error: 'פעולה לא מוכרת' }, { status: 400 });
  } catch (error) {
    console.error('lessonSummaryProxy error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});