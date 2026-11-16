// adminInterfaceProxy - fresh deploy - teacherIncome GET support
import { getApiBase } from '../../shared/apiBase.ts';
import { requireAdmin } from '../../shared/adminAuth.ts';
import { requireUser } from '../../shared/requireUser.ts';
import {
  checkLimit,
  noteAttempt,
  tooManyAttemptsResponse,
  keyFor,
  ipKey,
} from '../../shared/rateLimit.ts';

// "צור קשר" — עד 5 הודעות ב-15 דקות לכל משתמש וכתובת IP.
const CONTACT_LIMIT = { max: 5, windowMs: 15 * 60 * 1000, lockMs: 15 * 60 * 1000 };

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { action, p_1Student_2Teacher, p_Today_yyyyMMdd, p_mail, p_show_0New_1handeld, p_msgId, p_handelDescription, SubjectText, MessageText, token } = body;

    if (!action) return Response.json({ error: 'חסר action' }, { status: 400 });

    // "צור קשר": פתוח לכל משתמש מחובר. הפונה נקבע לפי הטוקן (אי אפשר לשלוח בשם
    // אחר) והבקשה מוגבלת בקצב.
    if (action === 'insertContactMessage') {
      const auth = await requireUser(token);
      if (!auth.ok) return auth.response;

      const limitKeys = [keyFor('contact', auth.email), ipKey(req)];
      const state = await checkLimit(req, limitKeys);
      if (state.limited) {
        console.warn('[adminInterfaceProxy] contact message blocked (rate limit):', auth.email);
        return tooManyAttemptsResponse(state.retryAfter);
      }

      const contactRes = await fetch(`${getApiBase(req)}/api/ContactMessages/p_insert_contactMessages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          p_nCase_1Student_2teacher: Number(p_1Student_2Teacher),
          p_mail: auth.email,
          SubjectText: String(SubjectText || '').slice(0, 200),
          MessageText: String(MessageText || '').slice(0, 4000),
        }),
      });
      await noteAttempt(req, limitKeys, CONTACT_LIMIT);

      const contactText = await contactRes.text();
      let contactData;
      try { contactData = contactText ? JSON.parse(contactText) : {}; } catch { contactData = { message: contactText }; }
      console.log(`[adminInterfaceProxy] insertContactMessage status=${contactRes.status}`);
      return Response.json({ ...contactData, _status: contactRes.status });
    }

    // הרשאת ניהול נבדקת בשרת, לכל בקשה בנפרד — לא רק בהסתרת התפריט בדפדפן.
    const admin = await requireAdmin(token);
    if (!admin.ok) {
      console.warn(`[adminInterfaceProxy] rejected ${action}: ${admin.error}`);
      return Response.json({ error: admin.error, message: admin.error }, { status: admin.status });
    }

    const base = `${getApiBase(req)}/api`;
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      'Authorization': `Bearer ${String(token).trim()}`,
    };

    let apiRes;

    if (action === 'mails') {
      const url = `${base}/DropDown/ddlb_name_mail_DropDown?p_1Student_2Teacher=${encodeURIComponent(p_1Student_2Teacher)}`;
      apiRes = await fetch(url, { headers });
    } else if (action === 'trace') {
      const url = `${base}/Trace/select_Today_trace_List_new`;
      apiRes = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          p_Today_yyyyMMdd,
          p_1Student_2Teacher: Number(p_1Student_2Teacher),
          p_mail,
        }),
      });
    } else if (action === 'sms') {
      const url = `${base}/SMS/select_SMSList_new`;
      apiRes = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          p_Today_yyyyMMdd,
          p_mail,
        }),
      });
    } else if (action === 'contactMessages') {
      const url = `${base}/ContactMessages/select_ContactMessagesList_new`;
      apiRes = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          p_nCase_1Student_2teacher: Number(p_1Student_2Teacher),
          p_show_0New_1handeld: Number(p_show_0New_1handeld ?? 0),
          p_Today_yyyyMMdd,
        }),
      });
    } else if (action === 'setContactMessage') {
      const url = `${base}/ContactMessages/p_set_ContactMessages`;
      apiRes = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          p_gn11_msg_id: Number(p_msgId),
          p_desc: p_handelDescription ?? '',
        }),
      });
    } else if (action === 'teacherIncome') {
      const url = `${base}/TeacherProfile/select_teacherIncome_Full_month?targetDate=${encodeURIComponent(p_Today_yyyyMMdd)}&teacherEmail=${encodeURIComponent(p_mail ?? '')}`;
      console.log('[adminInterfaceProxy] teacherIncome GET:', url);
      apiRes = await fetch(url, { method: 'GET', headers });
    } else {
      return Response.json({ error: 'action לא תקין' }, { status: 400 });
    }

    const text = await apiRes.text();
    console.log(`[adminInterfaceProxy] action=${action} status=${apiRes.status}`);

    if (!text || text.trim() === '') {
      return Response.json({ data: [], _status: apiRes.status });
    }
    let data;
    try { data = JSON.parse(text); } catch { data = { message: text }; }

    if (Array.isArray(data)) {
      data = { data };
    }

    return Response.json({ ...data, _status: apiRes.status });
  } catch (error) {
    console.error('[adminInterfaceProxy] error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});