const APP_ID = "6a37f1517bf59551c5f4b6f9";
const API_BASE = `https://learn-le-connect.base44.app/api/apps/${APP_ID}`;

/**
 * Receives a Base44 access token via Authorization header,
 * calls the Base44 User/me API directly with ONLY that token
 * (no SDK, no cookies, no cached session), and returns the email.
 *
 * This bypasses the SDK's browser-side session caching that can
 * return a stale/old user after Google OAuth account switching.
 */
export default async function (req: Request): Promise<Response> {
  try {
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    if (!authHeader) {
      return Response.json({ email: null, error: "Missing Authorization header" }, { status: 200 });
    }

    const token = authHeader.replace(/^Bearer\s+/i, "");

    // Direct HTTP call — no SDK, no service role, no cookies
    const res = await fetch(`${API_BASE}/entities/User/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn("[getBase44UserEmail] API status:", res.status, "body:", text);
      return Response.json({ email: null, error: `API returned ${res.status}` }, { status: 200 });
    }

    const user = await res.json();
    console.log("[getBase44UserEmail] API response:", JSON.stringify(user));

    if (!user || !user.email) {
      return Response.json({ email: null, error: "No email in user object" }, { status: 200 });
    }

    return Response.json({ email: user.email, fullName: user.full_name || null });
  } catch (error) {
    console.error("[getBase44UserEmail] Error:", (error as Error).message);
    return Response.json({ email: null, error: (error as Error).message }, { status: 200 });
  }
}