// Pilot (teacher) registration proxy.
//
// The page the visitor is on decides where the registration is written: the
// Base44 builder/preview writes to the developer's tunnel, every other origin
// (uniclass.co.il above all) writes to the production server. The shared
// resolver reads the caller origin, so a real visitor's details never end up on
// the developer's machine.
import { getApiBase } from '../../shared/apiBase.ts';

export default async function (req: Request): Promise<Response> {
  try {
    const API_BASE = getApiBase(req);
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