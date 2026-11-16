import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { getApiBase } from '../../shared/apiBase.ts';
import { requireUser } from '../../shared/requireUser.ts';
import {
  checkLimit,
  noteAttempt,
  tooManyAttemptsResponse,
  keyFor,
  ipKey,
} from '../../shared/rateLimit.ts';

// עד 5 הודעות SMS בשעה לכל משתמש.
const SMS_LIMIT = { max: 5, windowMs: 60 * 60 * 1000, lockMs: 60 * 60 * 1000 };

Deno.serve(async (req) => {
  try {
    const { message, phone, company, token } = await req.json();

    // שליחת SMS רק למשתמש מחובר ומאומת — המוקד פתוח לשימוש אנונימי.
    const auth = await requireUser(token);
    if (!auth.ok) return auth.response;

    // הגבלת קצב — מונעת ניצול המוקד לשליחת SMS בהיקף.
    const limitKeys = [keyFor('sms', auth.email), ipKey(req)].filter(Boolean);
    const limitState = await checkLimit(req, limitKeys);
    if (limitState.limited) return tooManyAttemptsResponse(limitState.retryAfter);
    await noteAttempt(req, limitKeys, SMS_LIMIT);

    const apiUrl = `${getApiBase(req)}/api/Sms/send`;

    const apiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${auth.token}`,
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