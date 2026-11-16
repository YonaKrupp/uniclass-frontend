import { getApiBase } from '../../shared/apiBase.ts';
import { requireUser, sameEmail, forbidden } from '../../shared/requireUser.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { random6, date, token } = body;

    const auth = await requireUser(token);
    if (!auth.ok) return auth.response;

    const requestedEmail = String(body.studentEmail || '').trim();
    if (requestedEmail && !sameEmail(requestedEmail, auth.email)) {
      return forbidden('אין הרשאה לנתוני תשלום של תלמיד אחר');
    }

    const studentEmail = auth.email;

    const apiUrl = `${getApiBase(req)}/api/HypPayment/studentPayment`;

    const apiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': `Bearer ${token || ''}`,
      },
      body: JSON.stringify({ studentEmail, random6, date }),
    });

    const text = await apiRes.text();
    console.log('studentPayment status:', apiRes.status);
    console.log('studentPayment response:', text);
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return Response.json({ ...data, _status: apiRes.status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});