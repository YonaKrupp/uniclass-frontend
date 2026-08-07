import { getApiBase } from '../../shared/apiBase.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { action, p_1Student_2Teacher, p_Today_yyyyMMdd, p_mail, p_show_0New_1handeld, p_msgId, p_handelDescription, SubjectText, MessageText, token } = body;

    if (!action) return Response.json({ error: 'חסר action' }, { status: 400 });

    const base = `${getApiBase(req)}/api`;
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    let apiRes;

    if (action === 'mails') {
      // GET /api/DropDown/ddlb_name_mail_DropDown?p_1Student_2Teacher=2
      const url = `${base}/DropDown/ddlb_name_mail_DropDown?p_1Student_2Teacher=${encodeURIComponent(p_1Student_2Teacher)}`;
      apiRes = await fetch(url, { headers });
    } else if (action === 'trace') {
      // POST /api/Trace/select_Today_trace_List_new with JSON body
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
      // POST /api/SMS/select_SMSList_new with JSON body
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
      // POST /api/ContactMessages/select_ContactMessagesList_new with JSON body
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
      // POST /api/ContactMessages/p_set_ContactMessages — update handling description (params: p_gn11_msg_id, p_desc)
      const url = `${base}/ContactMessages/p_set_ContactMessages`;
      apiRes = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          p_gn11_msg_id: Number(p_msgId),
          p_desc: p_handelDescription ?? '',
        }),
      });
    } else if (action === 'insertContactMessage') {
      // POST /api/ContactMessages/p_insert_contactMessages — insert a new contact message
      const url = `${base}/ContactMessages/p_insert_contactMessages`;
      apiRes = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          p_nCase_1Student_2teacher: Number(p_1Student_2Teacher),
          p_mail,
          SubjectText,
          MessageText,
        }),
      });
    } else {
      return Response.json({ error: 'action לא תקין' }, { status: 400 });
    }

    const text = await apiRes.text();
    console.log(`[adminInterfaceProxy] action=${action} status=${apiRes.status}`);
    console.log(`[adminInterfaceProxy] response:`, text);

    if (!text || text.trim() === '') {
      return Response.json({ data: [], _status: apiRes.status });
    }
    let data;
    try { data = JSON.parse(text); } catch { data = { message: text }; }

    return Response.json({ ...data, _status: apiRes.status });
  } catch (error) {
    console.error('[adminInterfaceProxy] error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});