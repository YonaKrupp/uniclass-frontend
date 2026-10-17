import { getApiBase } from '../../shared/apiBase.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const {
      fullName, email, phone, educationalInstitution, academicDegree, gn32_Notes,
      gn32_read_and_agree, gn32_accept_mail_sms, gn32_utm_source,
    } = body;

    const API_BASE = getApiBase(req);

    if (!fullName || !email || !phone || !educationalInstitution || !academicDegree) {
      return Response.json({ error: 'חסרים פרמטרים (fullName / email / phone / educationalInstitution / academicDegree)' }, { status: 400 });
    }

    const payload = {
      fullName, email, phone, educationalInstitution, academicDegree, gn32_Notes: gn32_Notes ?? '',
      gn32_read_and_agree: gn32_read_and_agree ? 1 : 0,
      gn32_accept_mail_sms: gn32_accept_mail_sms ? 1 : 0,
      gn32_utm_source: String(gn32_utm_source ?? '').trim(),
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