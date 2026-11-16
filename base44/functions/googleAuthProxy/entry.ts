import { googleLoginCsharp } from '../../shared/googleLogin.ts';
import { secrets } from 'base44:runtime';

// כניסה עם Google מאומתת תמיד מול Google (id_token) ולא לפי אימייל שהלקוח שולח.
// בעבר הפונקציה קיבלה אימייל בלבד והנפיקה טוקן התחברות — מעקף התחברות מלא לכל חשבון.
export default async function (req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { idToken, userType } = body;

    if (!idToken) {
      return Response.json({ error: 'נדרש אימות Google' }, { status: 401 });
    }

    const clientId = secrets.get('GOOGLE_CLIENT_ID');
    if (!clientId) {
      console.error('[googleAuthProxy] Missing GOOGLE_CLIENT_ID');
      return Response.json({ error: 'חסרה הגדרת Google OAuth בשרת.' }, { status: 500 });
    }

    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(String(idToken))}`,
    );
    if (!verifyRes.ok) {
      console.warn('[googleAuthProxy] Google token verification failed:', verifyRes.status);
      return Response.json({ error: 'אימות Google נכשל' }, { status: 401 });
    }

    const claims = await verifyRes.json();
    const email = String(claims?.email || '').trim().toLowerCase();
    const audienceOk = String(claims?.aud || '') === String(clientId);
    const emailVerified = claims?.email_verified === true || claims?.email_verified === 'true';

    if (!email || !audienceOk || !emailVerified) {
      console.warn('[googleAuthProxy] rejected claims', {
        hasEmail: Boolean(email),
        audienceOk,
        emailVerified,
      });
      return Response.json({ error: 'אימות Google נכשל' }, { status: 401 });
    }

    const data = await googleLoginCsharp(req, email, userType === 'teacher' ? 'teacher' : 'student');
    return Response.json(data);
  } catch (error) {
    console.error('[googleAuthProxy] error:', (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}