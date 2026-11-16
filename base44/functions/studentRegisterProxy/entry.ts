import { getApiBase } from '../../shared/apiBase.ts';
import { passwordError } from '../../shared/passwordPolicy.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import {
  docsVersionForAudience,
  recordConsent,
  parseAge,
  ageFromDateOfBirth,
  MIN_STUDENT_AGE,
} from '../../shared/legalConsent.ts';
import {
  checkLimit,
  noteAttempt,
  tooManyAttemptsResponse,
  keyFor,
  ipKey,
  FIVE_PER_15_MIN,
} from '../../shared/rateLimit.ts';

// "2004-03-12" → "2004-03-12T00:00:00" — פורמט שה-API מפרסר בביטחון כ-DateTime
function toIsoDate(value: unknown): string | null {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return `${raw}T00:00:00`;
  return raw;
}

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
      sendOtp: { url: 'SendRegistrationOtp', fields: ['email', 'firstName', 'lastName', 'phoneNumber', 'DateOfBirth', 'password'] },
      verifyAndRegister: { url: 'VerifyAndRegisterStudent', fields: ['sessionId', 'otpCode', 'DateOfBirth'] },
      resendOtp: { url: 'ResendRegistrationOtp', fields: ['sessionId'] },
    };

    const mapping = endpointMap[action];
    if (!mapping) {
      return Response.json({ success: false, message: 'פעולה לא מוכרת' });
    }

    // הגבלת קצב לשליחת קודים (מונע הצפת SMS): 5 ב-15 דקות לכל אימייל/כתובת IP.
    const limitKeys = [
      keyFor(`register-${action}`, body.email || body.sessionId),
      ipKey(req),
    ].filter(Boolean);
    const limitState = await checkLimit(req, limitKeys);
    if (limitState.limited) {
      console.warn(`studentRegisterProxy: rate limited (${action})`);
      return tooManyAttemptsResponse(limitState.retryAfter);
    }
    await noteAttempt(req, limitKeys, FIVE_PER_15_MIN);

    // מדיניות סיסמאות נאכפת גם בשרת, לא רק בטופס.
    if (action === 'sendOtp') {
      const pwError = passwordError(body.password);
      if (pwError) {
        console.warn(`studentRegisterProxy: rejected weak password for ${body.email || '(no email)'}`);
        return Response.json({ success: false, message: pwError }, { status: 400 });
      }
    }

    // אישור התנאים הוא תנאי להרשמה — גם בבקשה ישירה אל השרת, ללא הממשק.
    if (action === 'sendOtp' && body.consents?.acceptedTerms !== true) {
      console.warn(`studentRegisterProxy: sendOtp rejected — missing consent for ${body.email || '(no email)'}`);
      return Response.json(
        { success: false, message: 'יש לאשר את התנאים כדי להירשם' },
        { status: 400 },
      );
    }

    // חסימת הרשמה מתחת לגיל 14 — לפי תאריך הלידה (או גיל מפורש אם נשלח).
    const studentAge = ageFromDateOfBirth(body.dateOfBirth) ?? parseAge(body.age);
    if (
      (action === 'sendOtp' || action === 'verifyAndRegister') &&
      studentAge !== null &&
      studentAge < MIN_STUDENT_AGE
    ) {
      console.warn(`studentRegisterProxy: rejected under-age registration (${studentAge})`);
      return Response.json(
        { success: false, message: 'לא ניתן להירשם מתחת לגיל 14' },
        { status: 400 },
      );
    }

    const targetUrl = `${getApiBase(req)}/api/Auth/${mapping.url}`;
    const requestBody = {};
    for (const field of mapping.fields) {
      // ה-API מצפה לשם DateOfBirth; הטופס שולח dateOfBirth
      requestBody[field] = field === 'DateOfBirth' ? toIsoDate(body.dateOfBirth) : body[field];
    }

    // The ResendRegistrationOtp endpoint validates OtpCode as a required field even
    // though it only generates a new code from the sessionId — send a placeholder,
    // otherwise the request is rejected with 400 and no new code is sent.
    if (action === 'resendOtp') {
      requestBody.otpCode = 'resend';
    }

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
      console.error('studentRegisterProxy: C# API unreachable:', fetchError.message);
      return Response.json({
        success: false,
        message: 'שרת ההרשמה אינו זמין כעת. אנא נסו שוב מאוחר יותר.',
      });
    }

    const text = await apiRes.text();

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    // שמירת רשומת אישור לאחר שהחשבון נוצר בפועל.
    if (
      action === 'verifyAndRegister' &&
      apiRes.ok &&
      data.success !== false &&
      !data.error &&
      body.consents?.acceptedTerms === true
    ) {
      try {
        const base44 = createClientFromRequest(req);
        const email = String(body.email || '').trim().toLowerCase();
        if (email) {
          const version = await docsVersionForAudience(base44, 'student');
          await recordConsent(base44, req, {
            email,
            userId: String(data.userId ?? data.UserId ?? data.id ?? ''),
            consentType: 'student_signup',
            roleOfApprover: 'student',
            audience: 'student',
            acceptedTerms: true,
            docsVersion: version,
          });
        }
      } catch (consentError) {
        console.error('studentRegisterProxy: failed to save consent record:', consentError.message);
      }
    }

    return Response.json({ ...data, _status: apiRes.status });
  } catch (error) {
    console.error('studentRegisterProxy: Unexpected error:', error.message);
    return Response.json({ success: false, message: error.message });
  }
});