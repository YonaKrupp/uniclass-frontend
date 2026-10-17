import { getApiBase, getApiBaseFromAppUrl } from '../../shared/apiBase.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const {
      fullName, email, phone, educationalInstitution, academicDegree, gn32_Notes,
      gn32_read_and_agree, gn32_accept_mail_sms,
    } = body;

    // The page the user is actually on decides the API server: the browser sends
    // its own origin with every call (originUrl), so a form submitted on
    // uniclass.co.il always reaches the production API. Header-based detection
    // stays as a fallback for callers that don't send it.
    const API_BASE = body.originUrl ? getApiBaseFromAppUrl(body.originUrl) : getApiBase(req);
    console.log('pilotInsertProxy API_BASE:', API_BASE, '| originUrl:', body.originUrl ?? '(none)');

    if (!fullName || !email || !phone || !educationalInstitution || !academicDegree) {
      return Response.json({
        error: 'חסרים פרמטרים (fullName / email / phone / educationalInstitution / academicDegree)',
        _api: API_BASE,
        _v: 3,
      }, { status: 400 });
    }

    const payload = {
      fullName, email, phone, educationalInstitution, academicDegree, gn32_Notes: gn32_Notes ?? '',
      gn32_read_and_agree: gn32_read_and_agree ? 1 : 0,
      gn32_accept_mail_sms: gn32_accept_mail_sms ? 1 : 0,
    };

    const apiRes = await fetch(`${API_BASE}/api/Pilot/insert_pilot_v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(payload),
    });

    const text = await apiRes.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!apiRes.ok) {
      const message = data?.error || data?.message || `שגיאה בשמירת הפרטים (${apiRes.status})`;
      console.error('insert_pilot upstream error:', apiRes.status, message);
      return Response.json({ error: message }, { status: apiRes.status });
    }

    if (data?.success === false) {
      const message = data?.error || data?.message || 'שגיאה בשמירת הפרטים';
      console.error('insert_pilot failed:', message);
      return Response.json({ error: message });
    }

    return Response.json(data);
  } catch (error) {
    console.error('insert_pilot error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});