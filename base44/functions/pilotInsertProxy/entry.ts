import { getApiBase } from '../../shared/apiBase.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { fullName, email, phone, educationalInstitution, academicDegree, gn32_Notes } = body;

    const API_BASE = getApiBase(req);

    if (!fullName || !email || !phone || !educationalInstitution || !academicDegree) {
      return Response.json({ error: 'חסרים פרמטרים (fullName / email / phone / educationalInstitution / academicDegree)' }, { status: 400 });
    }

    const apiRes = await fetch(`${API_BASE}/api/Pilot/insert_pilot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ fullName, email, phone, educationalInstitution, academicDegree, gn32_Notes: gn32_Notes ?? '' }),
    });

    const text = await apiRes.text();
    console.log('insert_pilot status:', apiRes.status);
    console.log('insert_pilot response:', text);
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return Response.json({ ...data, _status: apiRes.status });
  } catch (error) {
    console.error('insert_pilot error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});