import { getApiBase } from '../../shared/apiBase.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { action, email, token, pictureData } = body;

    if (!email) {
      return Response.json({ error: 'חסר אימייל מורה' }, { status: 400 });
    }

    const API_BASE = getApiBase(req);

    console.log('teacherPictureProxy called:', { action, email: email?.substring(0, 20), hasToken: !!token });
    const headers = {
      'ngrok-skip-browser-warning': 'true',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let url, method, fetchOptions;

    switch (action) {
      case 'get': {
        url = `${API_BASE}/api/Teacher/GetTeacherPicture?email=${encodeURIComponent(email)}`;
        method = 'GET';
        fetchOptions = { method, headers };
        console.log('GetTeacherPicture fetching:', url);
        const apiRes = await fetch(url, fetchOptions);
        console.log('GetTeacherPicture API status:', apiRes.status);

        if (apiRes.status === 404) {
          return Response.json({ found: false, _status: 404 });
        }
        if (!apiRes.ok) {
          const text = await apiRes.text();
          console.log('GetTeacherPicture error response:', text);
          return Response.json({ error: text || `שגיאה: ${apiRes.status}`, _status: apiRes.status });
        }

        const imageBytes = new Uint8Array(await apiRes.arrayBuffer());
        if (imageBytes.length === 0) {
          return Response.json({ found: false, _status: 200 });
        }

        // Convert to base64
        let binary = '';
        for (let i = 0; i < imageBytes.length; i++) {
          binary += String.fromCharCode(imageBytes[i]);
        }
        const base64 = btoa(binary);

        return Response.json({ found: true, pictureData: base64, _status: 200 });
      }

      case 'upload': {
        if (!pictureData) {
          return Response.json({ error: 'חסרים נתוני תמונה' }, { status: 400 });
        }
        url = `${API_BASE}/api/Teacher/SetTeacherPicture`;
        method = 'POST';
        headers['Content-Type'] = 'application/json';
        fetchOptions = {
          method,
          headers,
          body: JSON.stringify({ email, pictureData }),
        };
        const apiRes = await fetch(url, fetchOptions);
        const text = await apiRes.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }
        return Response.json({ ...data, _status: apiRes.status });
      }

      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});