import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import {
  consentStatus,
  recordConsent,
  getDocsVersions,
  isConsentType,
  parseAge,
  MIN_STUDENT_AGE,
} from '../../shared/legalConsent.ts';
import { requireUser, sameEmail, forbidden } from '../../shared/requireUser.ts';
import { isAdminEmail } from '../../shared/adminAuth.ts';
import { checkLimit, noteAttempt, tooManyAttemptsResponse, keyFor } from '../../shared/rateLimit.ts';

// עד 10 אישורי תנאים ב-15 דקות לכל משתמש.
const CONSENT_LIMIT = { max: 10, windowMs: 15 * 60 * 1000, lockMs: 15 * 60 * 1000 };

const CONSENT_REQUIRED = 'יש לאשר את התנאים כדי להמשיך';

export default async function (req: Request): Promise<Response> {
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
    return Response.json({ success: false, message: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action;
    const base44 = createClientFromRequest(req);

    // גרסאות חבילות המסמכים — ציבורי, נדרש לעמודי ההרשמה והתשלום.
    if (action === 'versions') {
      const versions = await getDocsVersions(base44);
      return Response.json({
        success: true,
        teacherDocsVersion: versions.teacher,
        studentDocsVersion: versions.student,
      });
    }

    // כל פעולה אחרת דורשת טוקן מאומת. הזהות (והאימייל שנשמר ברשומה) נלקחת מהטוקן בלבד.
    const auth = await requireUser(body.token);
    if (!auth.ok) return auth.response;

    const requestedEmail = String(body.email || '').trim().toLowerCase();
    if (requestedEmail && !sameEmail(requestedEmail, auth.email) && !isAdminEmail(auth.email)) {
      return forbidden('אין הרשאה לפעול בשם משתמש אחר');
    }
    const email = auth.email.toLowerCase();

    if (action === 'status') {
      const audience = body.audience === 'teacher' ? 'teacher' : body.audience === 'student' ? 'student' : '';
      if (!audience) {
        return Response.json({ success: false, message: 'חסר קהל יעד' }, { status: 400 });
      }
      const status = await consentStatus(base44, email, audience);
      return Response.json({ success: true, ...status });
    }

    if (action === 'accept') {
      const limitKey = keyFor('consent', email);
      const limitState = await checkLimit(req, [limitKey]);
      if (limitState.limited) {
        return tooManyAttemptsResponse(limitState.retryAfter);
      }

      const consentType = String(body.consentType || '');
      if (!isConsentType(consentType)) {
        return Response.json({ success: false, message: 'סוג אישור לא מוכר' }, { status: 400 });
      }
      if (body.acceptedTerms !== true) {
        return Response.json({ success: false, message: CONSENT_REQUIRED }, { status: 400 });
      }

      const audience = consentType === 'teacher_signup' ? 'teacher' : 'student';
      const requestedRole = String(body.roleOfApprover || '');
      const roleOfApprover = ['teacher', 'student', 'parent'].includes(requestedRole)
        ? requestedRole
        : audience === 'teacher'
          ? 'teacher'
          : 'student';

      if (consentType === 'teacher_signup' && body.confirmed18Plus !== true) {
        return Response.json(
          { success: false, message: 'יש לאשר שאתם בני 18 ומעלה' },
          { status: 400 },
        );
      }

      if (
        consentType === 'student_payment' &&
        roleOfApprover === 'parent' &&
        body.confirmedParentGuardian !== true
      ) {
        return Response.json(
          { success: false, message: 'יש לאשר שאתם ההורה או האפוטרופוס של התלמיד' },
          { status: 400 },
        );
      }

      // חסימת הרשמה מתחת לגיל 14 (כאשר הגיל נשלח מהטופס).
      const age = parseAge(body.age);
      if (age !== null && age < MIN_STUDENT_AGE) {
        return Response.json(
          { success: false, message: 'ההרשמה מותרת מגיל 14 ומעלה' },
          { status: 400 },
        );
      }

      const record = await recordConsent(base44, req, {
        email,
        userId: '',
        consentType,
        roleOfApprover,
        audience,
        acceptedTerms: true,
        confirmed18Plus: body.confirmed18Plus === true,
        confirmedParentGuardian: body.confirmedParentGuardian === true,
      });

      await noteAttempt(req, [limitKey], CONSENT_LIMIT);
      return Response.json({ success: true, id: record.id, docsVersion: record.docs_version });
    }

    return Response.json({ success: false, message: 'פעולה לא מוכרת' }, { status: 400 });
  } catch (error) {
    console.error('legalConsentProxy: unexpected error:', error.message);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}