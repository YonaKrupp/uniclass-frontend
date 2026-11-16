import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { DOCUMENT_SET_VERSION, CONSENT_REQUIRED_MESSAGE, hasValidConsent, clientIp } from '../../shared/legalDocs.ts';

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
    return Response.json({ success: false, message: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action;
    const email = String(body.email || '').trim().toLowerCase();

    if (!email) {
      return Response.json({ success: false, message: 'חסר אימייל' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    if (action === 'status') {
      const page = await base44.asServiceRole.entities.ConsentRecord.filter(
        { user_email: email, document_set_version: DOCUMENT_SET_VERSION },
        { sort: '-created_date', limit: 50 },
      );
      const records = page?.items || [];
      // אישורי החובה: תנאים, פרטיות וקוד התנהגות + גיל 18.
      const baseConsent =
        records.find((r) => r.accepted_terms_privacy_conduct === true && r.confirmed_18_plus === true) || null;
      // ההסכמה להקלטה נפרדת ואופציונלית: true / false / null (טרם נבחר).
      const recordingRecord = records.find((r) => typeof r.accepted_recording_ai === 'boolean') || null;
      const recordingDecision = recordingRecord ? recordingRecord.accepted_recording_ai === true : null;
      console.log(
        `consentProxy status: ${email} → needsConsent=${!baseConsent} recordingDecision=${recordingDecision}`,
      );
      return Response.json({
        documentSetVersion: DOCUMENT_SET_VERSION,
        needsConsent: !baseConsent,
        recordingDecision,
        acceptedAt: baseConsent?.accepted_at || null,
      });
    }

    // בחירת המורה לגבי הקלטת שיעוריו (בכניסה הראשונה לכיתה) — אופציונלי.
    if (action === 'recording') {
      if (typeof body.accepted !== 'boolean') {
        return Response.json({ success: false, message: 'חסר אישור הקלטה' }, { status: 400 });
      }

      const record = await base44.asServiceRole.entities.ConsentRecord.create({
        user_id: String(body.userId || ''),
        user_email: email,
        document_set_version: DOCUMENT_SET_VERSION,
        accepted_terms_privacy_conduct: false,
        confirmed_18_plus: false,
        accepted_recording_ai: body.accepted,
        accepted_at: new Date().toISOString(),
        ip_address: clientIp(req),
        user_agent: req.headers.get('user-agent') || '',
      });

      console.log(`consentProxy recording: ${email} accepted=${body.accepted} (record ${record.id})`);
      return Response.json({ success: true, id: record.id, accepted: body.accepted });
    }

    if (action === 'accept') {
      if (!hasValidConsent(body.consents)) {
        console.warn(`consentProxy accept rejected for ${email}: missing legal consent`);
        return Response.json({ success: false, message: CONSENT_REQUIRED_MESSAGE }, { status: 400 });
      }

      const record = await base44.asServiceRole.entities.ConsentRecord.create({
        user_id: String(body.userId || ''),
        user_email: email,
        document_set_version: DOCUMENT_SET_VERSION,
        accepted_terms_privacy_conduct: true,
        confirmed_18_plus: true,
        accepted_at: new Date().toISOString(),
        ip_address: clientIp(req),
        user_agent: req.headers.get('user-agent') || '',
      });

      console.log(`consentProxy accept: saved consent ${record.id} for ${email} (${DOCUMENT_SET_VERSION})`);
      return Response.json({ success: true, id: record.id, documentSetVersion: DOCUMENT_SET_VERSION });
    }

    return Response.json({ success: false, message: 'פעולה לא מוכרת' }, { status: 400 });
  } catch (error) {
    console.error('consentProxy: unexpected error:', error.message);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
});