import { getApiBase } from '../../shared/apiBase.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { action, token, ...params } = body;

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
        apiUrl = `${API_BASE}/GetConversations?userEmail=${encodeURIComponent(params.userEmail)}&userRole=${encodeURIComponent(params.userRole || "")}&studentEmail=${encodeURIComponent(params.studentEmail || params.userEmail || "")}`;
        break;
      case "markAsRead":
        apiUrl = `${API_BASE}/MarkAsRead`;
        method = "POST";
        break;
      case "getUnreadCount":
        apiUrl = `${API_BASE}/GetUnreadCount?userEmail=${encodeURIComponent(params.userEmail)}`;
        break;
      default:
        return Response.json({ error: "Unknown action" }, { status: 400 });
    }

    const fetchOptions = {
      method,
      headers: {
        'Authorization': `Bearer ${token || ""}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    };

    if (method === "POST") {
      const postBody = action === "sendMessage"
        ? {
            senderEmail: params.senderEmail,
            senderRole: params.senderRole,
            recipientEmail: params.recipientEmail,
            recipientRole: params.recipientRole,
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