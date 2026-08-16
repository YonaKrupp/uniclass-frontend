// googleOAuthExchange — independent Google OAuth (no Base44 OAuth dependency).
// Two modes:
//   { action: "config" }            → returns { clientId } for the frontend
//   { code, redirectUri, userType } → exchanges the Google auth code for a
//     C# auth token (via the shared C# GoogleLogin call) and returns it.
import { googleLoginCsharp } from '../../shared/googleLogin.ts';
import { secrets } from 'base44:runtime';

export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { action, code, redirectUri, userType } = body;

    const clientId = secrets.get('GOOGLE_CLIENT_ID');
    const clientSecret = secrets.get('GOOGLE_CLIENT_SECRET');

    // Config: expose the public client_id so the frontend can build the OAuth URL
    if (action === 'config') {
      return Response.json({ clientId: clientId || '' });
    }

    if (!clientId || !clientSecret) {
      console.error('[googleOAuthExchange] Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET');
      return Response.json(
        { error: 'חסרה הגדרת Google OAuth בשרת. אנא פנה למנהל המערכת.' },
        { status: 500 }
      );
    }

    if (!code || !redirectUri) {
      return Response.json({ error: 'חסר קוד הרשאה או redirect_uri' }, { status: 400 });
    }

    // Step 1: Exchange the authorization code for Google tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });
    const tokenText = await tokenRes.text();
    console.log('[googleOAuthExchange] Google token status:', tokenRes.status, 'body:', tokenText);

    let tokenData: any;
    try { tokenData = JSON.parse(tokenText); } catch { tokenData = {}; }

    if (!tokenData.id_token && !tokenData.access_token) {
      return Response.json(
        { error: 'החלפת קוד ההרשאה מול Google נכשלה. אנא נסו שוב.' },
        { status: 400 }
      );
    }

    // Step 2: Extract the email — prefer the id_token (JWT), fall back to userinfo
    let email: string | null = null;
    if (tokenData.id_token) {
      try {
        const payload = JSON.parse(
          atob(tokenData.id_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
        );
        email = payload.email || payload.Email || null;
      } catch (e) {
        console.warn('[googleOAuthExchange] id_token decode failed:', (e as Error).message);
      }
    }
    if (!email && tokenData.access_token) {
      try {
        const ui = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const uiData = await ui.json();
        email = uiData.email || null;
      } catch (e) {
        console.warn('[googleOAuthExchange] userinfo fetch failed:', (e as Error).message);
      }
    }

    if (!email) {
      return Response.json(
        { error: 'לא נמצא אימייל בחשבון Google. אנא נסו שוב.' },
        { status: 400 }
      );
    }

    // Step 3: Authenticate against the C# backend (shared with googleAuthProxy)
    const data = await googleLoginCsharp(req, email, userType || 'student');
    return Response.json({ ...data, email });
  } catch (error) {
    console.error('[googleOAuthExchange] error:', error);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}