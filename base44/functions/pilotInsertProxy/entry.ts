import { PRODUCTION_BASE } from '../../shared/apiBase.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const {
      fullName, email, phone, educationalInstitution, academicDegree, gn32_Notes,
      gn32_read_and_agree, gn32_accept_mail_sms,
    } = body;

    // Pilot registrations ALWAYS go to the production server.
    //
    // The landing page is reachable from several hosts (the custom domain, the
    // published Base44 address, the builder preview) and the developer's tunnel
    // must never receive a real visitor's details — so this endpoint does not
    // route by host, by header or by anything the page sends. There is no path
    // that can end up on a laptop.
    const API_BASE = PRODUCTION_BASE;
    console.log('[pilotInsertProxy] API_BASE=', API_BASE);

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