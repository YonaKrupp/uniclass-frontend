import { getApiBase } from '../../shared/apiBase.ts';
import { requireUser, sameEmail, forbidden } from '../../shared/requireUser.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { action, token, ...params } = body;

    const auth = await requireUser(token);
    if (!auth.ok) return auth.response;

    // התפקיד נגזר מהטוקן המאומת בלבד — לא מפרמטר שהלקוח שולח.
    // ה-API מקבל רק "teacher" או "student" באותיות קטנות, לכן מנרמלים את הערך מהטוקן.
    const normalizeRole = (value: unknown): string => {
      const role = String(value ?? '').trim().toLowerCase();
      return role === 'teacher' || role === 'student' ? role : '';
    };
    const recipientRoleFromClient = normalizeRole(params.recipientRole);
    // תמיד נשלח תפקיד תקין ל-API: מהטוקן, אחר כך מהתפקיד השמור אצל הלקוח,
    // ואם אין בכלל תפקיד — מהתפקיד של הצד השני בשיחה.
    const callerRole = normalizeRole(auth.userType)
      || normalizeRole(auth.role)
      || normalizeRole(params.senderRole)
      || normalizeRole(params.userRole)
      || (recipientRoleFromClient === 'teacher' ? 'student' : 'teacher');
    const recipientRole = recipientRoleFromClient || (callerRole === 'teacher' ? 'student' : 'teacher');
    console.log('[chatProxy] action:', action, 'callerRole:', callerRole, 'recipientRole:', recipientRole);

    const API_BASE = `${getApiBase(req)}/api/Chat`;
    let apiUrl = "";
    let method = "GET";

    switch (action) {
      case "sendMessage":
        apiUrl = `${API_BASE}/SendMessage`;
        method = "POST";
        break;
      case "getConversation":
        apiUrl = `${API_BASE}/GetConversation?user1=${encodeURIComponent(params.user1)}&user2=${encodeURIComponent(params.user2)}`;
        break;
      case "getConversations":
        apiUrl = `${API_BASE}/GetConversations?userEmail=${encodeURIComponent(auth.email)}&userRole=${encodeURIComponent(callerRole)}&studentEmail=${encodeURIComponent(params.studentEmail || auth.email)}`;
        break;
      case "markAsRead":
        apiUrl = `${API_BASE}/MarkAsRead`;
        method = "POST";
        break;
      case "getUnreadCount":
        apiUrl = `${API_BASE}/GetUnreadCount?userEmail=${encodeURIComponent(auth.email)}`;
        break;
      default:
        return Response.json({ error: "Unknown action" }, { status: 400 });
    }

    // הזהות מהטוקן בלבד — משתמש לא יכול לקרוא או לשלוח בשם משתמש אחר.
    if (action === "getConversation" || action === "markAsRead") {
      if (!sameEmail(params.user1, auth.email) && !sameEmail(params.user2, auth.email)) {
        return forbidden('אין הרשאה לשיחה של משתמש אחר');
      }
    }
    if (action === "sendMessage" && !sameEmail(params.senderEmail, auth.email)) {
      return forbidden('אין הרשאה לשלוח הודעה בשם משתמש אחר');
    }
    if ((action === "getConversations" || action === "getUnreadCount") && params.userEmail && !sameEmail(params.userEmail, auth.email)) {
      return forbidden('אין הרשאה לנתוני הצ׳אט של משתמש אחר');
    }

    const fetchOptions = {
      method,
      headers: {
        'Authorization': `Bearer ${auth.token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    };

    if (method === "POST") {
      const postBody = action === "sendMessage"
        ? {
            senderEmail: auth.email,
            senderRole: callerRole,
            recipientEmail: params.recipientEmail,
            recipientRole,
            messageText: params.messageText,
          }
        : { user1: params.user1, user2: params.user2 };
      fetchOptions.body = JSON.stringify(postBody);
    }

    const apiRes = await fetch(apiUrl, fetchOptions);
    const text = await apiRes.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }

    return Response.json({ ...data, _status: apiRes.status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});