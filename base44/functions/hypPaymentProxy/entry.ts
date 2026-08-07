import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { getApiBase } from '../../shared/apiBase.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { action, scheduleParams, ...params } = body;
    const authToken = params.token || '';

    // verifyPayment is called from HYP redirect — no user token available; C# endpoint doesn't require auth
    if (!authToken && action !== 'verifyPayment') {
      console.log('[hypPaymentProxy] Missing authToken - returning 401');
      return Response.json({ error: 'Missing token' }, { status: 401 });
    }

    // Save schedule params for retrieval by hypPaymentReturn after HYP redirect
    if (action === 'createPayment' && scheduleParams) {
      try {
        const base44 = createClientFromRequest(req);
        // Capture the frontend origin so hypPaymentReturn can redirect back to the correct domain
        const appBaseUrl = req.headers.get('Origin') || '';
        await base44.asServiceRole.entities.PaymentScheduleParam.create({
          order: String(params.order),
          teacherEmail: scheduleParams.teacherEmail || '',
          studentEmail: scheduleParams.studentEmail || '',
          firstDayOfWeek: scheduleParams.firstDayOfWeek || '',
          subjectId: scheduleParams.subjectId || '',
          subjectName: scheduleParams.subjectName || '',
          authToken: authToken || '',
          appBaseUrl,
        });
        console.log('[hypPaymentProxy] Saved scheduleParams for order:', params.order, 'appBaseUrl:', appBaseUrl);
      } catch (e) {
        console.error('[hypPaymentProxy] Failed to save scheduleParams:', e.message);
      }
    }

    const baseUrl = `${getApiBase(req)}/api`;
    
    console.log('[hypPaymentProxy] Incoming action:', action);

    let endpoint, payload;

    if (action === 'createPayment') {
      endpoint = '/HypPayment/CreatePayment';
      payload = {
        amount: params.amount,
        order: params.order,
        description: params.description,
        studentEmail: params.studentEmail,
        clientName: params.clientName,
        clientLName: params.clientLName,
        cell: params.cell,
        heshDesc: params.heshDesc,
        studentMobile: params.studentMobile,
        PostAction: false,
      };
    } else if (action === 'verifyPayment') {
      endpoint = '/HypPayment/VerifyPayment';
      payload = params.verifyParams;
    } else {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    const fullUrl = `${baseUrl}${endpoint}`;
    console.log('[hypPaymentProxy] Calling:', fullUrl);
    
    // Extract real client IP from incoming request (Base44 sits behind a CDN/proxy)
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      '127.0.0.1';

    const apiBase = getApiBase(req);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      'Referer': apiBase,
      'REMOTE-HOST': clientIp,
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const apiRes = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const text = await apiRes.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    console.log('[hypPaymentProxy] C# status:', apiRes.status);

    return Response.json({ ...data, _status: apiRes.status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});