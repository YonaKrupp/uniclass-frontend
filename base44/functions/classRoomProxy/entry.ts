import { getApiBase } from '../../shared/apiBase.ts';
import { requireUser, sameEmail, forbidden } from '../../shared/requireUser.ts';

/** "2026-11-16" in Israel time — the lessons endpoints expect this format. */
function todayInIsrael(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jerusalem',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/**
 * A room may only be opened for a lesson the caller actually has today: the
 * lessons payload of the caller (as teacher or as student) must contain the room
 * name. Without this check any logged-in user could mint a join token for any
 * room name.
 */
async function ownsRoom(
  apiBase: string,
  headers: Record<string, string>,
  roomName: string,
  email: string,
): Promise<boolean> {
  const todayDate = todayInIsrael();
  const urls = [
    `${apiBase}/api/Daily/getTeacherNowStudentLessons?teacherEmail=${encodeURIComponent(email)}&todayDate=${todayDate}`,
    `${apiBase}/api/Daily/getStudentNowStudentLessons?studentEmail=${encodeURIComponent(email)}&todayDate=${todayDate}`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers });
      const text = await res.text();
      if (res.ok && text && text.includes(roomName)) return true;
    } catch (error) {
      console.error('[classRoomProxy] room ownership check failed:', (error as Error).message);
    }
  }
  return false;
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { action, token, ...params } = body;

    const auth = await requireUser(token);
    if (!auth.ok) return auth.response;

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
        if (!todayDate) {
          return Response.json({ error: 'חסרים פרטים' }, { status: 400 });
        }
        if (email && !sameEmail(email, auth.email)) {
          return forbidden('אין הרשאה לשיעורים של משתמש אחר');
        }
        const ownerEmail = auth.email;
        url = userType === 'teacher'
          ? `${API_BASE}/api/Daily/getTeacherNowStudentLessons?teacherEmail=${encodeURIComponent(ownerEmail)}&todayDate=${todayDate}`
          : `${API_BASE}/api/Daily/getStudentNowStudentLessons?studentEmail=${encodeURIComponent(ownerEmail)}&todayDate=${todayDate}`;
        method = 'GET';
        fetchOptions = { method, headers };
        break;
      }

      case 'getRoom': {
        const { roomName, userName } = params;
        if (!roomName) {
          return Response.json({ error: 'חסר שם חדר' }, { status: 400 });
        }
        const allowed = await ownsRoom(API_BASE, headers, String(roomName), auth.email);
        if (!allowed) {
          console.warn('[classRoomProxy] room not owned by caller:', roomName, auth.email);
          return forbidden('אין הרשאה לחדר השיעור הזה');
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