import { getApiBase } from '../../shared/apiBase.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body?.email ?? body?.Email;

    if (!email || !String(email).trim()) {
      return Response.json({ error: 'חסר פרמטר email' }, { status: 400 });
    }

    const apiRes = await fetch(`${getApiBase(req)}/api/Pilot/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ Email: String(email).trim() }),
    });

    const text = await apiRes.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return Response.json(data, { status: apiRes.status });
  } catch (error) {
    console.error('unsubscribe error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});