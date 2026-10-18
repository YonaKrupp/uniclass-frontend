import { getApiBase, isKnownApiBase } from '../../shared/apiBase.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const {
      fullName, email, phone, educationalInstitution, academicDegree, gn32_Notes,
      gn32_read_and_agree, gn32_accept_mail_sms,
    } = body;

    // The frontend sends the origin the form was submitted from, so the request
    // always lands on the same API the page advertises (production vs ngrok).
    // The form sends the API base it displays on screen; fall back to the
    // request-based resolution only when it is missing or unknown.
    const API_BASE = isKnownApiBase(body.apiBase) ? body.apiBase : getApiBase(req, body.clientOrigin);
    console.log('[pilotInsertProxy] API_BASE=', API_BASE,
      '| apiBase=', body.apiBase || '(none)',
      '| clientOrigin=', body.clientOrigin || '(none)',
      '| appUrl=', req.headers.get('X-Base44-App-Url') || '(none)');

    if (!fullName || !email || !phone || !educationalInstitution || !academicDegree) {
      return Response.json({ error: 'חסרים פרמטרים (fullName / email / phone / educationalInstitution / academicDegree)' }, { status: 400 });
    }

    const payload = {
      fullName, email, phone, educationalInstitution, academicDegree, gn32_Notes: gn32_Notes ?? '',
      gn32_read_and_agree: gn32_read_and_agree ? 1 : 0,
      gn32_accept_mail_sms: gn32_accept_mail_sms ? 1 : 0,
    };

    const apiRes = await fetch(`${API_BASE}/api/Pilot/insert_pilot`, {
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

    return Response.json(data);
  } catch (error) {
    console.error('insert_pilot error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});