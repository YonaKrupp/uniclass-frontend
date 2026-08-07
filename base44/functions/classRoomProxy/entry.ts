import { getApiBase } from '../../shared/apiBase.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { action, token, ...params } = body;

    const API_BASE = getApiBase(req);
    const headers = {
      'ngrok-skip-browser-warning': 'true',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let url, method, fetchOptions;

    switch (action) {
      case 'getLessons': {
        const { userType, email, todayDate } = params;
        if (!email || !todayDate) {
          return Response.json({ error: 'חסרים פרטים' }, { status: 400 });
        }
        url = userType === 'teacher'
          ? `${API_BASE}/api/Daily/getTeacherNowStudentLessons?teacherEmail=${encodeURIComponent(email)}&todayDate=${todayDate}`
          : `${API_BASE}/api/Daily/getStudentNowStudentLessons?studentEmail=${encodeURIComponent(email)}&todayDate=${todayDate}`;
        method = 'GET';
        fetchOptions = { method, headers };
        break;
      }

      case 'getRoom': {
        const { roomName, userName } = params;
        if (!roomName) {
          return Response.json({ error: 'חסר שם חדר' }, { status: 400 });
        }
        url = `${API_BASE}/api/daily/get-or-create-room`;
        method = 'POST';
        headers['Content-Type'] = 'application/json';
        fetchOptions = {
          method,
          headers,
          body: JSON.stringify({ RoomName: roomName, UserName: userName || '' }),
        };
        break;
      }

      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }

    const apiRes = await fetch(url, fetchOptions);
    const text = await apiRes.text();
    console.log("[classRoomProxy] API status:", apiRes.status, "url:", url);
    console.log("[classRoomProxy] API response:", text.substring(0, 500));
    if (!text || text.trim() === '') {
      return Response.json({ Data: [], _status: apiRes.status });
    }
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    return Response.json({ ...data, _status: apiRes.status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});