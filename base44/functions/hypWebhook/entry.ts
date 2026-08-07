import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { getApiBaseFromAppUrl } from '../../shared/apiBase.ts';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const body = await req.json();
    console.log("[hypWebhook] Received from HYP:", body);

    // HYP webhook sends: Id, CCode, Amount, Order, Sign (and others)
    const { Id, CCode, Amount, Order, Sign, ACode, Fild1, Fild2, Fild3 } = body;

    if (!Order || !Sign) {
      console.error("[hypWebhook] Missing Order or Sign");
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Build string for signature validation (based on HYP docs)
    // HYP typically signs: Id|CCode|Amount|Order|Secret
    // But the exact format depends on HYP's implementation
    // For now, log what we got and forward to C# for verification
    
    console.log("[hypWebhook] Processing payment: Order=" + Order + ", CCode=" + CCode + ", Amount=" + Amount);

    // Look up the saved appBaseUrl by order to determine which C# API to call
    let apiBase = 'https://hacking-frighten-dandy.ngrok-free.dev';
    try {
      const base44 = createClientFromRequest(req);
      if (Order) {
        const results = await base44.asServiceRole.entities.PaymentScheduleParam.filter({ order: String(Order) });
        if (results && results.length > 0 && results[0].appBaseUrl) {
          apiBase = getApiBaseFromAppUrl(results[0].appBaseUrl);
          console.log('[hypWebhook] Resolved apiBase from saved appBaseUrl:', results[0].appBaseUrl, '→', apiBase);
        }
      }
    } catch (e) {
      console.error('[hypWebhook] Failed to look up PaymentScheduleParam:', (e as Error).message);
    }

    // Forward to C# backend for verification (without token - webhook is from HYP)
    const verifyRes = await fetch(
      `${apiBase}/api/HypPayment/VerifyPayment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          Id,
          CCode,
          Amount,
          Order,
          Sign,
          ACode,
          Fild1,
          Fild2,
          Fild3,
        }),
      }
    );

    const verifyData = await verifyRes.text();
    console.log("[hypWebhook] C# verification response:", verifyData, "Status:", verifyRes.status);

    if (verifyRes.status === 200) {
      console.log(`[hypWebhook] Payment processed for order ${Order}`);
      return Response.json({ success: true, message: 'Payment processed' });
    } else {
      console.error(`[hypWebhook] Payment verification failed for order ${Order}`);
      return Response.json({ success: false, message: 'Payment verification failed' }, { status: 400 });
    }
  } catch (error) {
    console.error("[hypWebhook] Error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});