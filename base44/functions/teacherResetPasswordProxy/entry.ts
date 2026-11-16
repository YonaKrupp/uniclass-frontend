import { getApiBase } from '../../shared/apiBase.ts';
import { passwordError } from '../../shared/passwordPolicy.ts';
import {
  checkLimit,
  noteAttempt,
  tooManyAttemptsResponse,
  keyFor,
  ipKey,
  FIVE_PER_15_MIN,
} from '../../shared/rateLimit.ts';

// תשובה אחידה — אינה חושפת אם קיימת כתובת במערכת.
const GENERIC_SENT_MESSAGE = 'אם קיים חשבון עם כתובת זו, שלחנו אליה הוראות לאיפוס סיסמה.';

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

    // הגבלת קצב: 5 ניסיונות ב-15 דקות לכל אימייל/כתובת IP — מונע הצפת SMS וניחוש קודים.
    const limitKeys = [
      keyFor(`reset-${action}`, body.email || body.sessionId),
      ipKey(req),
    ].filter(Boolean);
    const limitState = await checkLimit(req, limitKeys);
    if (limitState.limited) {
      console.warn(`teacherResetPasswordProxy: rate limited (${action})`);
      return tooManyAttemptsResponse(limitState.retryAfter, GENERIC_SENT_MESSAGE);
    }
    await noteAttempt(req, limitKeys, FIVE_PER_15_MIN);

    // מדיניות סיסמאות נאכפת גם בשרת, לא רק בטופס.
    if (action === 'verifyAndReset') {
      const pwError = passwordError(body.newPassword);
      if (pwError) return Response.json({ success: false, message: pwError }, { status: 400 });
    }

    const targetUrl = `${getApiBase(req)}/api/Auth/${mapping.url}`;
    const requestBody = {};
    for (const field of mapping.fields) {
      requestBody[field] = body[field];
    }

    // ResendTeacherPasswordResetOtp validates OtpCode as a required field even though it
    // only generates a new code from the sessionId — send a placeholder, otherwise the
    // request is rejected with 400 and no new code is sent.
    if (action === 'resendOtp') {
      requestBody.otpCode = 'resend';
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
      console.error('teacherResetPasswordProxy: C# API unreachable:', (fetchError as Error).message);
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

    // שליחת הקוד מחזירה תשובה אחידה תמיד — כדי לא לחשוף אילו כתובות רשומות.
    if (action === 'sendOtp' && apiRes.status >= 400 && apiRes.status < 500) {
      console.warn(`teacherResetPasswordProxy: sendOtp normalized (C# ${apiRes.status})`);
      return Response.json({ success: true, sessionId: '', message: GENERIC_SENT_MESSAGE, _status: 200 });
    }

    return Response.json({ ...data, _status: apiRes.status });
  } catch (error) {
    console.error('teacherResetPasswordProxy: Unexpected error:', (error as Error).message);
    return Response.json({ success: false, message: (error as Error).message });
  }
});