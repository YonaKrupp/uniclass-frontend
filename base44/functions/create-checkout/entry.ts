Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { items, customerInfo } = body;

    const apiKey = Deno.env.get("PAYMENTS_BY_WIX_API_KEY");
    const siteId = Deno.env.get("PAYMENTS_BY_WIX_SITE_ID");
    const origin = req.headers.get("Origin") || "https://learn-le-connect.base44.app";

    if (!apiKey || !siteId) {
      console.error("[create-checkout] Missing API key or site ID");
      return Response.json({ error: "Missing Wix Payments configuration" }, { status: 500 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: "Items are required" }, { status: 400 });
    }

    const checkoutBody = {
      cart: {
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity || 1,
          price: String(item.price),
        })),
      },
      callbackUrls: {
        postFlowUrl: `${origin}/student-home`,
        thankYouPageUrl: `${origin}/payment-success`,
      },
    };

    // Pre-fill customer details if available
    if (customerInfo) {
      checkoutBody.cart.customerInfo = {};
      if (customerInfo.email) checkoutBody.cart.customerInfo.email = customerInfo.email;
      if (customerInfo.firstName) checkoutBody.cart.customerInfo.firstName = customerInfo.firstName;
      if (customerInfo.lastName) checkoutBody.cart.customerInfo.lastName = customerInfo.lastName;
      if (customerInfo.phone) checkoutBody.cart.customerInfo.phone = customerInfo.phone;
    }

    console.log("[create-checkout] Creating checkout session with:", JSON.stringify(checkoutBody, null, 2));

    const response = await fetch(
      "https://www.wixapis.com/payments/platform/v1/checkout-sessions/construct",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: apiKey,
          "wix-site-id": siteId,
        },
        body: JSON.stringify(checkoutBody),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("[create-checkout] Wix API error:", response.status, JSON.stringify(data));
      return Response.json(
        { error: data.message || "Failed to create checkout session", details: data },
        { status: response.status }
      );
    }

    console.log("[create-checkout] Checkout session created:", data.checkoutSession?.id);

    return Response.json({
      redirectUrl: data.checkoutSession?.redirectUrl,
      sessionId: data.checkoutSession?.id,
    });
  } catch (error) {
    console.error("[create-checkout] Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});