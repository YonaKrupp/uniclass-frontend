import { googleLoginCsharp } from '../../shared/googleLogin.ts';

export default async function (req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { email, userType } = body;
    console.log("[googleAuthProxy] Request:", { email, userType });

    if (!email) {
      return Response.json({ error: "Missing email" }, { status: 400 });
    }

    const data = await googleLoginCsharp(req, email, userType || "student");
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}