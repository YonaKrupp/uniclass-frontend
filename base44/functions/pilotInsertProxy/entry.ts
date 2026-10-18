// Pilot (teacher) registration proxy.
//
// Every registration is written to the PRODUCTION server. The address is
// hard-coded right here: this endpoint does not route by host, by header or by
// anything the page sends, so a real visitor's details can never end up on the
// developer's machine.
const API_BASE = 'http://corewebapi-env.il-central-1.elasticbeanstalk.com';

export default async function (req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const {
      fullName, email, phone, educationalInstitution, academicDegree, gn32_Notes,
      gn32_read_and_agree, gn32_accept_mail_sms,
    } = body;

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
      signal: AbortSignal.timeout(20000),
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
}