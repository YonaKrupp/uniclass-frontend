import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { getApiBaseFromAppUrl } from '../../shared/apiBase.ts';

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

Deno.serve(async (req) => {
  try {
    const params: Record<string, string> = {};

    console.log('[hypPaymentReturn] Method:', req.method);
    console.log('[hypPaymentReturn] Content-Type:', req.headers.get('Content-Type'));
    console.log('[hypPaymentReturn] URL:', req.url);

    if (req.method === 'GET') {
      const url = new URL(req.url);
      url.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      console.log('[hypPaymentReturn] GET param keys:', Object.keys(params).join(','));
    } else if (req.method === 'POST') {
      const contentType = req.headers.get('Content-Type') || '';
      if (contentType.includes('application/json')) {
        try {
          const body = await req.json();
          Object.assign(params, body);
        } catch { /* ignore parse error */ }
      } else {
        try {
          const formData = await req.formData();
          formData.forEach((value, key) => {
            params[key] = String(value);
          });
        } catch {
          try {
            const text = await req.text();
            console.log('[hypPaymentReturn] Raw body:', text);
            const searchParams = new URLSearchParams(text);
            searchParams.forEach((value, key) => {
              params[key] = value;
            });
          } catch { /* ignore */ }
        }
      }
      console.log('[hypPaymentReturn] POST param keys:', Object.keys(params).join(','));
    }

    // HYP/Shva CCode → Hebrew message mapping (from https://developers.hyp.co.il/pay/reference/response-status-codes.md)
    const ccodeMessages: Record<string, string> = {
      '0': 'התשלום אושר',
      '1': 'כרטיס חסום',
      '2': 'כרטיס גנוב, יש להחרים',
      '3': 'יש לפנות לחברת האשראי',
      '4': 'העסקה לא אושרה על ידי חברת האשראי',
      '5': 'כרטיס מזויף, יש להחרים',
      '6': 'קוד אבטחה (CVV) שגוי או מספר זהות חסר',
      '7': 'שגיאת אימות CAVV/UCAF',
      '8': 'שגיאת אימות AVS',
      '9': 'תקלת תקשורת, העסקה נדחתה',
      '12': 'הכרטיס אינו מורשה במסוף זה',
      '14': 'הכרטיס אינו שייך לרשת',
      '15': 'הכרטיס אינו תקין',
      '16': 'אין הרשאה לסוג מטבע זה או חסרים שדות נדרשים',
      '17': 'אין הרשאה לסוג אשראי זה',
      '26': 'מספר זהות שגוי',
    };

    // Determine success or failure based on CCode from HYP redirect
    const ccode = params.CCode || params.ccode || '';
    const isHypSuccess = ccode === '0' || ccode === '600' || ccode === '700' || ccode === '800';
    const declineMessage = ccodeMessages[ccode] || (ccode ? `קוד דחייה: ${ccode}` : '');
    const hypTransactionId = params.Id || params.id || '';
    const orderId = params.Order || params.order || '';
    const amount = params.Amount || '';
    const l4digit = params.L4digit || params.l4digit || '';
    console.log('[hypPaymentReturn] CCode:', ccode, 'isHypSuccess:', isHypSuccess, 'orderId:', orderId, 'amount:', amount);

    // Call C# VerifyPayment server-side (no frontend needed)
    // Don't trust Origin header — HYP redirect may send its own origin or "null" string.
    const originHeader = req.headers.get('origin');
    console.log('[hypPaymentReturn] Origin header:', originHeader);
    console.log('[hypPaymentReturn] Host header:', req.headers.get('host'));

    // Look up saved schedule params by order ID (stored when payment was created)
    // Fallback: HYP may return a different order number than the one we sent (C# assigns its own),
    // so if order lookup fails, find the most recent record by student email (Fild2).
    // This lookup is done BEFORE the VerifyPayment call so we can resolve the correct API base.
    let savedScheduleParams = null;
    let lookupMethod = 'none';
    const studentEmailFromHyp = params.Fild2 || params.fild2 || '';
    try {
      const base44 = createClientFromRequest(req);
      if (orderId) {
        const results = await base44.asServiceRole.entities.PaymentScheduleParam.filter({ order: orderId });
        if (results && results.length > 0) {
          savedScheduleParams = results[0];
          lookupMethod = 'order';
          console.log('[hypPaymentReturn] Found scheduleParams by order:', orderId);
        }
      }
      if (!savedScheduleParams && studentEmailFromHyp) {
        console.log('[hypPaymentReturn] Order lookup failed, trying studentEmail fallback:', studentEmailFromHyp);
        const results = await base44.asServiceRole.entities.PaymentScheduleParam.filter({ studentEmail: studentEmailFromHyp });
        if (results && results.length > 0) {
          // Most recent first
          results.sort((a: any, b: any) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
          savedScheduleParams = results[0];
          lookupMethod = 'studentEmail-fallback';
          console.log('[hypPaymentReturn] Found scheduleParams by studentEmail fallback, order:', savedScheduleParams.order);
        }
      }
      if (!savedScheduleParams) {
        console.log('[hypPaymentReturn] No scheduleParams found for order:', orderId, 'or studentEmail:', studentEmailFromHyp);
      }
    } catch (e) {
      console.error('[hypPaymentReturn] Failed to look up scheduleParams:', e.message);
    }

    // Resolve C# API base from the saved appBaseUrl (captured at payment creation),
    // falling back to the Origin header, then ngrok (Base44 dev).
    const apiBase = getApiBaseFromAppUrl(savedScheduleParams?.appBaseUrl || originHeader || '');

    let verifyResult: any = null;
    let verifyError = '';
    try {
      console.log('[hypPaymentReturn] Calling C# VerifyPayment at:', `${apiBase}/api/HypPayment/VerifyPayment`);
      const verifyResponse = await fetch(`${apiBase}/api/HypPayment/VerifyPayment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Referer': apiBase,
        },
        body: JSON.stringify(params),
      });
      const verifyText = await verifyResponse.text();
      console.log('[hypPaymentReturn] C# Verify status:', verifyResponse.status);
      try { verifyResult = JSON.parse(verifyText); } catch { verifyResult = { raw: verifyText }; }
      // Log only key fields — hypResponse can be huge and causes log truncation
      console.log('[hypPaymentReturn] C# isValid:', verifyResult?.isValid, 'parsedCCode:', verifyResult?.parsedCCode, 'redirectCCode:', verifyResult?.redirectCCode);
    } catch (err: any) {
      verifyError = err.message;
      console.error('[hypPaymentReturn] Verify call failed:', verifyError);
    }

    // Use verify result for transactionId if available, fall back to HYP redirect Id
    const transactionId = verifyResult?.transactionId || hypTransactionId;
    const isVerified = verifyResult?.isValid === true || verifyResult?.IsValid === true;

    console.log('[hypPaymentReturn] Final: transactionId=', transactionId, 'isHypSuccess=', isHypSuccess, 'isVerified=', isVerified);

    // Render result as a full HTML page — no redirect, no SPA dependency
    // Trust C# VerifyPayment result (checks signature + CCode) as primary; local check as fallback
    const isSuccess = isHypSuccess || isVerified;

    // Determine the app URL: prefer the saved appBaseUrl (captured at payment creation),
    // then the Origin header if valid, then fall back to the known Base44 URL.
    const savedAppUrl = savedScheduleParams?.appBaseUrl || '';
    const isValidOrigin = (originHeader && originHeader.startsWith('http') &&
      (originHeader.includes('learn-le-connect') || originHeader.includes('uniclass')));
    const appUrl = savedAppUrl || (isValidOrigin ? originHeader : 'https://learn-le-connect.base44.app');
    console.log('[hypPaymentReturn] appUrl:', appUrl, '(savedAppUrl:', savedAppUrl, ')');

    // Build schedule URL from saved params (server-side, no localStorage dependency)
    let scheduleQuery = '';
    if (savedScheduleParams) {
      const sp = new URLSearchParams();
      if (savedScheduleParams.teacherEmail) sp.set('teacherEmail', savedScheduleParams.teacherEmail);
      if (savedScheduleParams.studentEmail) sp.set('studentEmail', savedScheduleParams.studentEmail);
      if (savedScheduleParams.firstDayOfWeek) sp.set('firstDayOfWeek', savedScheduleParams.firstDayOfWeek);
      if (savedScheduleParams.subjectId) sp.set('subjectId', savedScheduleParams.subjectId);
      if (savedScheduleParams.subjectName) sp.set('subjectName', savedScheduleParams.subjectName);
      if (savedScheduleParams.authToken) sp.set('authToken', savedScheduleParams.authToken);
      scheduleQuery = sp.toString();
    }
    const scheduleHref = scheduleQuery
      ? `${appUrl}/student-schedule?${scheduleQuery}`
      : `${appUrl}/student-schedule`;
    console.log('[hypPaymentReturn] scheduleHref:', scheduleHref);

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${isSuccess ? 'תשלום התקבל' : 'שגיאת תשלום'}</title>
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Heebo', sans-serif; background: linear-gradient(135deg, #f0f4f8 0%, #e0e7ff 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .card { max-width: 420px; width: 100%; background: #fff; border-radius: 24px; padding: 40px 32px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.08); }
    .icon-wrap { width: 72px; height: 72px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; }
    .success-bg { background: #dbeafe; }
    .error-bg { background: #fee2e2; }
    .check { width: 36px; height: 36px; color: #2563eb; }
    .cross { width: 36px; height: 36px; color: #dc2626; }
    h1 { font-size: 22px; font-weight: 800; color: #1e293b; margin-bottom: 8px; }
    .subtitle { color: #64748b; font-size: 15px; margin-bottom: 24px; }
    .ref-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0; }
    .ref-label { font-size: 13px; color: #64748b; margin-bottom: 4px; }
    .ref-value { font-size: 20px; font-weight: 700; color: #2563eb; letter-spacing: 1px; }
    .order-line { font-size: 13px; color: #94a3b8; margin-top: 8px; }
    .verify-status { font-size: 12px; margin-top: 12px; padding: 6px 12px; border-radius: 8px; display: inline-block; }
    .verify-ok { background: #dcfce7; color: #16a34a; }
    .verify-fail { background: #fef3c7; color: #d97706; }
    .btn { display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 15px; margin-top: 24px; transition: background 0.2s; }
    .btn:hover { background: #1d4ed8; }
    .spinner { width: 20px; height: 20px; border: 2px solid #dbeafe; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; vertical-align: middle; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-wrap ${isSuccess ? 'success-bg' : 'error-bg'}">
      ${isSuccess
        ? '<svg class="check" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>'
        : '<svg class="cross" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>'}
    </div>
    <h1>${isSuccess ? 'התשלום בוצע בהצלחה!' : 'שגיאה בתשלום'}</h1>
    <p class="subtitle">${isSuccess ? 'תודה על רכישתכם. השיעורים נוספו לחשבונכם.' : (declineMessage || 'התשלום לא הצליח, אנא צרו קשר עם התמיכה.')}</p>

    ${isSuccess && transactionId ? `<div class="ref-box"><div class="ref-label">מספר אסמכתה</div><div class="ref-value">${escapeHtml(transactionId)}</div></div>` : ''}
    <div class="order-line">
      ${orderId ? `<div>מספר הזמנה: ${escapeHtml(orderId)}</div>` : ''}
      ${l4digit ? `<div>כרטיס: ****${escapeHtml(l4digit)}</div>` : ''}
      ${amount ? `<div>סכום: ₪${escapeHtml(amount)}</div>` : ''}
    </div>

    ${verifyError
      ? '<div class="verify-status verify-fail">אימות: שגיאת תקשורת</div>'
      : isVerified
        ? '<div class="verify-status verify-ok">אימות HYP: אושר ✓</div>'
        : isSuccess
          ? '<div class="verify-status verify-ok">סטטוס תשלום: התקבל</div>'
          : '<div class="verify-status verify-fail">סטטוס תשלום: נכשל</div>'}

    <br>
    <div style="margin-top:24px;">
      <a href="${escapeHtml(scheduleHref)}" class="btn">לוח שעות</a>
    </div>
  </div>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[hypPaymentReturn] Error:', error.message);
    const appUrl = 'https://learn-le-connect.base44.app';
    const errorHtml = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>שגיאה</title>
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Heebo', sans-serif; background: #fee2e2; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .card { max-width: 400px; background: #fff; border-radius: 16px; padding: 32px; text-align: center; }
    h1 { color: #dc2626; margin-bottom: 8px; }
    a { display: inline-block; margin-top: 16px; background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <h1>שגיאה בעיבוד התשלום</h1>
    <p>אנא צרו קשר עם התמיכה.</p>
    <a href="${escapeHtml(appUrl)}/student-home">חזרה לדף הבית</a>
  </div>
</body>
</html>`;
    return new Response(errorHtml, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
});