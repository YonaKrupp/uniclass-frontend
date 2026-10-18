import { getApiBase, NGROK_BASE, PRODUCTION_BASE } from '../../shared/apiBase.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const {
      fullName, email, phone, educationalInstitution, academicDegree, gn32_Notes,
      gn32_read_and_agree, gn32_accept_mail_sms,
    } = body;

    // The page the visitor is on decides: Base44 builder/preview → the developer's
    // tunnel, the live site → production.
    //
    // Two independent sources are used, and production always wins:
    // 1. `apiBase` — the environment the page declares for itself (only the two
    //    known servers are accepted, anything else is ignored).
    // 2. the request's own origin signals (X-Client-Origin / Origin / Referer).
    // A real visitor can therefore never be routed to the developer's machine,
    // whatever a browser, a proxy or an older cached page happens to send.
    const signalBase = getApiBase(req);
    const declared = body.apiBase === NGROK_BASE || body.apiBase === PRODUCTION_BASE ? body.apiBase : '';
    const API_BASE = declared === PRODUCTION_BASE || signalBase === PRODUCTION_BASE
      ? PRODUCTION_BASE
      : (declared || signalBase);
    console.log('[pilotInsertProxy] API_BASE=', API_BASE, '| declared=', body.apiBase || '(none)', '| signals=', signalBase);

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

    // Forward the server's REAL status: a failed insert must reach the form as a
    // failure, never as a silent success.
    console.log('[pilotInsertProxy] API status:', apiRes.status, '| body:', text.slice(0, 500));

    return Response.json(data, { status: apiRes.status });
  } catch (error) {
    console.error('insert_pilot error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});