import jwt from "npm:jsonwebtoken@9.0.2";

Deno.serve(async (req) => {
  try {
    const requestBody = await req.text();
    const publicKey = Deno.env.get("PAYMENTS_BY_WIX_WEBHOOK_PUBLIC_KEY");

    if (!publicKey) {
      console.error("[wix-payments-webhook] Missing WEBHOOK_PUBLIC_KEY");
      return Response.json({ error: "Missing public key" }, { status: 500 });
    }

    // Step 1: Verify JWT signature - fail closed if verification fails
    const rawPayload = jwt.verify(requestBody, publicKey, { algorithms: ["RS256"] });

    // Step 2: Parse double-nested JSON (WebhookEnvelope -> event data)
    const event = JSON.parse(rawPayload.data);
    const eventData = JSON.parse(event.data);

    console.log("[wix-payments-webhook] Event type:", event.eventType);

    if (event.eventType === "wix.ecom.v1.order_approved") {
      const order = eventData.actionEvent.body.order;
      console.log("[wix-payments-webhook] Order approved - ID:", order.id, "checkoutId:", order.checkoutId);
      console.log("[wix-payments-webhook] Payment status:", order.paymentStatus, "Total:", order.priceSummary?.total?.amount, order.currency);
      console.log("[wix-payments-webhook] Buyer email:", order.buyerInfo?.email);

      // Store subscription IDs if present (needed for subscription lifecycle tracking)
      for (const lineItem of order.lineItems || []) {
        if (lineItem.subscriptionInfo) {
          console.log("[wix-payments-webhook] Subscription ID:", lineItem.subscriptionInfo.id, "Item:", lineItem.productName?.original);
        }
      }
    } else if (event.eventType === "wix.ecom.subscription_contracts.v1.subscription_contract_canceled") {
      const subscriptionContract = eventData.actionEvent.body.subscriptionContract;
      console.log("[wix-payments-webhook] Subscription canceled:", subscriptionContract.id);
    } else if (event.eventType === "wix.ecom.subscription_contracts.v1.subscription_contract_expired") {
      const subscriptionContract = eventData.actionEvent.body.subscriptionContract;
      console.log("[wix-payments-webhook] Subscription expired:", subscriptionContract.id);
    } else {
      console.log("[wix-payments-webhook] Unhandled event type:", event.eventType);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("[wix-payments-webhook] Error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});