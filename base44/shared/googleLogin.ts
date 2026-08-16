import { getApiBase } from './apiBase.ts';

/**
 * Calls the C# GoogleLogin endpoint with the given email + userType.
 * Returns the parsed JSON response from C# (includes accessToken/token),
 * with an _status field. On connection failure returns a 503-shaped object.
 *
 * Shared by googleAuthProxy and googleOAuthExchange so the C# call logic
 * lives in one place.
 */
export async function googleLoginCsharp(req: Request, email: string, userType: string): Promise<any> {
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
    console.error("[googleLogin] Failed to reach C# API:", (fetchError as Error).message);
    return {
      success: false,
      error: "שרת האימות אינו זמין כעת. אנא נסו שוב מאוחר יותר.",
      _status: 503,
    };
  }

  const text = await apiRes.text();
  console.log("[googleLogin] C# status:", apiRes.status, "response:", text);
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  return { ...data, _status: apiRes.status };
}