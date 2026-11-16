import { getApiBase } from '../../shared/apiBase.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { DOCUMENT_SET_VERSION, CONSENT_REQUIRED_MESSAGE, hasValidConsent, clientIp } from '../../shared/legalDocs.ts';
import { docsVersionForAudience, INITIAL_DOCS_VERSION } from '../../shared/legalConsent.ts';

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
      sendOtp: { url: 'SendTeacherRegistrationOtp', fields: ['email', 'firstName', 'lastName', 'phoneNumber', 'password'] },
      verifyAndRegister: { url: 'VerifyAndRegisterTeacher', fields: ['sessionId', 'otpCode'] },
      resendOtp: { url: 'ResendTeacherRegistrationOtp', fields: ['sessionId'] },
    };

    const mapping = endpointMap[action];
    if (!mapping) {
      return Response.json({ success: false, message: 'פעולה לא מוכרת' });
    }

    // אישור משפטי חובה — השרת מסרב להתחיל או להשלים רישום בלי שלושת האישורים
    // וגרסת המסמכים הנוכחית, גם אם הבקשה לא הגיעה מהממשק.
    // שליחת קוד מחדש אינה יוצרת חשבון, ולכן אינה מחייבת אישור נוסף.
    if (action !== 'resendOtp' && !hasValidConsent(body.consents)) {
      console.warn(`teacherRegisterProxy: ${action} rejected — missing legal consent for ${body.email || '(no email)'}`);
      return Response.json(
        { success: false, error: 'CONSENT_REQUIRED', message: CONSENT_REQUIRED_MESSAGE },
        { status: 400 },
      );
    }

    const targetUrl = `${getApiBase(req)}/api/Auth/${mapping.url}`;
    const requestBody = {};
    for (const field of mapping.fields) {
      requestBody[field] = body[field];
    }

    // שדות שהשרת מצפה להם בשמות ובטיפוסים שלו: ת"ז כ-tzid (מחרוזת ספרות),
    // והאישורים "קראתי והסכמתי" ו"בן/בת 18 ומעלה" כמספרים (1/0).
    // נשלחים גם באימות הקוד, למקרה שהשרת כותב אותם לרשומת המורה בשלב הזה.
    if (action === 'sendOtp' || action === 'verifyAndRegister') {
      requestBody.tzid = String(body.idNumber || '').replace(/\D/g, '');
      requestBody.readAndAgreed = body.consents?.termsPrivacyConduct === true ? 1 : 0;
      requestBody.over18 = body.consents?.adult === true ? 1 : 0;
      console.log(
        `teacherRegisterProxy: consent fields → tzidLen=${requestBody.tzid.length} readAndAgreed=${requestBody.readAndAgreed} over18=${requestBody.over18}`,
      );
    }

    // ResendTeacherRegistrationOtp validates OtpCode as a required field even though it
    // only generates a new code from the sessionId — send a placeholder, otherwise the
    // request is rejected with 400 and no new code is sent.
    if (action === 'resendOtp') {
      requestBody.otpCode = 'resend';
    }

    console.log(`teacherRegisterProxy: action=${action} → ${targetUrl}`);

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
      console.error('teacherRegisterProxy: C# API unreachable:', fetchError.message);
      return Response.json({
        success: false,
        message: 'שרת ההרשמה אינו זמין כעת. אנא נסו שוב מאוחר יותר.',
      });
    }

    const text = await apiRes.text();
    console.log(`teacherRegisterProxy: C# status=${apiRes.status} response=${text}`);

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    // רישום ההסכמה נשמר רק לאחר שהחשבון נוצר בפועל.
    if (action === 'verifyAndRegister' && apiRes.ok && data.success !== false && !data.error) {
      try {
        const base44 = createClientFromRequest(req);
        const docsVersion = await docsVersionForAudience(base44, 'teacher').catch(() => INITIAL_DOCS_VERSION);
        const consent = await base44.asServiceRole.entities.ConsentRecord.create({
          user_id: String(data.userId ?? data.UserId ?? data.id ?? ''),
          user_email: String(body.email || '').trim().toLowerCase(),
          consent_type: 'teacher_signup',
          role_of_approver: 'teacher',
          docs_version: docsVersion,
          accepted_terms: true,
          confirmed_18_plus: true,
          confirmed_parent_guardian: false,
          // שדות הרשומות הקודמות — נשמרים לתאימות עם זרימת ההקלטה והשער הקיים.
          document_set_version: DOCUMENT_SET_VERSION,
          accepted_terms_privacy_conduct: true,
          accepted_at: new Date().toISOString(),
          ip_address: clientIp(req),
          user_agent: req.headers.get('user-agent') || '',
        });
        console.log(`teacherRegisterProxy: consent record ${consent.id} saved for ${body.email}`);
      } catch (consentError) {
        console.error('teacherRegisterProxy: failed to save consent record:', consentError.message);
      }
    }

    return Response.json({ ...data, _status: apiRes.status });
  } catch (error) {
    console.error('teacherRegisterProxy: Unexpected error:', error.message);
    return Response.json({ success: false, message: error.message });
  }
});