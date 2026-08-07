import { getApiBase } from '../../shared/apiBase.ts';

export default async function (req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { email, userType } = body;
    console.log("[googleAuthProxy] Request:", { email, userType });

    if (!email) {
      return Response.json({ error: "Missing email" }, { status: 400 });
    }

    const endpoint = `${getApiBase(req)}/api/Auth/GoogleLogin`;

    let apiRes: Response;
    try {
      apiRes = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ email: String(email).trim(), userType: userType || "student" }),
      });
    } catch (fetchError) {
      console.error("[googleAuthProxy] Failed to reach C# API:", (fetchError as Error).message);
      return Response.json({
        success: false,
        error: "שרת האימות אינו זמין כעת. אנא נסו שוב מאוחר יותר.",
        _status: 503,
      });
    }

    const text = await apiRes.text();
    console.log("[googleAuthProxy] C# status:", apiRes.status, "response:", text);
    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }

    return Response.json({ ...data, _status: apiRes.status });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}