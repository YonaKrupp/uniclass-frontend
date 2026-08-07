import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { getApiBase } from '../../shared/apiBase.ts';

Deno.serve(async (req) => {
  try {
    const { message, phone, company, token } = await req.json();

    const apiUrl = `${getApiBase(req)}/api/Sms/send`;

    const apiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        message,
        cellNumber: phone,
        companyName: company,
      }),
    });

    const text = await apiRes.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    return Response.json(data, { status: apiRes.status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});