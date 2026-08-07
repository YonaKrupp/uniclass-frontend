import { getApiBase } from '../../shared/apiBase.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    const body = await req.json();
    const action = body.action;

    const endpointMap = {
      sendOtp: { url: 'SendTeacherPasswordResetOtp', fields: ['email'] },
      verifyAndReset: { url: 'VerifyAndResetTeacherPassword', fields: ['sessionId', 'otpCode', 'newPassword'] },
      resendOtp: { url: 'ResendTeacherPasswordResetOtp', fields: ['sessionId'] },
    };

    const mapping = endpointMap[action];
    if (!mapping) {
      return Response.json({ success: false, message: 'פעולה לא מוכרת' });
    }

    const targetUrl = `${getApiBase(req)}/api/Auth/${mapping.url}`;
    const requestBody = {};
    for (const field of mapping.fields) {
      requestBody[field] = body[field];
    }

    console.log(`teacherResetPasswordProxy: action=${action} → ${targetUrl}`);

    let apiRes;
    try {
      apiRes = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(requestBody),
      });
    } catch (fetchError) {
      console.error('teacherResetPasswordProxy: C# API unreachable:', fetchError.message);
      return Response.json({
        success: false,
        message: 'השרת אינו זמין כעת. אנא נסו שוב מאוחר יותר.',
      });
    }

    const text = await apiRes.text();
    console.log(`teacherResetPasswordProxy: C# status=${apiRes.status} response=${text}`);

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    return Response.json({ ...data, _status: apiRes.status });
  } catch (error) {
    console.error('teacherResetPasswordProxy: Unexpected error:', error.message);
    return Response.json({ success: false, message: error.message });
  }
});