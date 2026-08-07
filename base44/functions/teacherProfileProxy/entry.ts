import { getApiBase } from '../../shared/apiBase.ts';

// Search recursively for any field that looks like document data (base64 / data URL)
// Returns the value of the first match, or null
function findDocumentField(obj, depth = 0) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || depth > 3) return null;
  // First pass: check for field names containing "document" or "data" with string values
  for (const key of Object.keys(obj)) {
    const lowerKey = key.toLowerCase();
    if ((lowerKey.includes('document') || lowerKey.includes('data') || lowerKey.includes('verified_doc')) && typeof obj[key] === 'string' && obj[key].length > 100) {
      return obj[key];
    }
  }
  // Second pass: check for any long string value that looks like base64 / data URL
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string' && (obj[key].startsWith('data:') || obj[key].startsWith('data:image') || (obj[key].length > 500 && /^[A-Za-z0-9+/=\s]+$/.test(obj[key])))) {
      return obj[key];
    }
  }
  // Third pass: recurse into nested objects
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      const found = findDocumentField(obj[key], depth + 1);
      if (found) return found;
    }
  }
  return null;
}

// Search recursively for any field containing "seq" in its name (case-insensitive)
// Returns { key, value } of the first match, or null
function findSeqField(obj, depth = 0) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || depth > 3) return null;
  for (const key of Object.keys(obj)) {
    if (key.toLowerCase().includes('seq') && obj[key] != null && obj[key] !== '') {
      const val = obj[key];
      if (typeof val !== 'object') {
        return { key, value: val };
      }
    }
  }
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      const found = findSeqField(obj[key], depth + 1);
      if (found) return found;
    }
  }
  return null;
}

// Resolve gn02Seq: use provided value, otherwise fetch the profile and find it
async function resolveSeq(gn02Seq, email, token, todayDate, apiBase) {
  if (gn02Seq) return gn02Seq;
  if (!email) return null;
  console.log('[teacherProfileProxy] gn02Seq missing — fetching profile to find it');
  const profileUrl = `${apiBase}/api/TeacherProfile?email=${encodeURIComponent(email)}&date=${encodeURIComponent(todayDate)}`;
  const profileRes = await fetch(profileUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  });
  const profileText = await profileRes.text();
  console.log('[teacherProfileProxy] Profile fetch for seq — status:', profileRes.status);
  if (profileText) {
    try {
      const profileData = JSON.parse(profileText);
      const found = findSeqField(profileData);
      if (found) {
        console.log('[teacherProfileProxy] Found seq in field:', found.key, '=', found.value);
        return found.value;
      }
      console.log('[teacherProfileProxy] No seq field found in profile. Keys:', JSON.stringify(Object.keys(profileData)));
    } catch { /* not JSON */ }
  }
  return null;
}

// Send a POST update to a C# endpoint with gn02_Seq + extra fields
async function sendUpdate(endpointPath, gn02Seq, payload, token, apiBase) {
  const updateUrl = `${apiBase}${endpointPath}`;
  const body = { gn02_Seq: gn02Seq, ...payload };
  console.log('[teacherProfileProxy] Sending POST to C#:', JSON.stringify(body));
  const updateRes = await fetch(updateUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(body),
  });
  const updateText = await updateRes.text();
  console.log('[teacherProfileProxy] C# update status:', updateRes.status, 'response:', updateText);
  let updateData;
  try { updateData = JSON.parse(updateText); } catch { updateData = { message: updateText }; }
  if (!updateRes.ok) {
    const errMsg = updateData?.message || updateData?.error || updateData?.title || updateText || `שגיאה בשמירה (סטטוס ${updateRes.status})`;
    return Response.json({ error: errMsg, _status: updateRes.status });
  }
  return Response.json({ ...updateData, _status: updateRes.status });
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { email, token, todayDate, action } = body;
    const API_BASE = getApiBase(req);

    if (action === 'updateAbout') {
      const { gn02Seq, description } = body;
      console.log('[teacherProfileProxy] updateAbout: gn02Seq=', gn02Seq, 'description length=', description?.length);
      const seq = await resolveSeq(gn02Seq, email, token, todayDate, API_BASE);
      if (!seq) {
        return Response.json({ error: 'חסר מזהה מורה (gn02Seq) — לא נמצא בפרופיל', _status: 400 });
      }
      return await sendUpdate('/api/TeacherProfile/set_teacher_presentYourSelf', seq, { description }, token, API_BASE);
    }

    if (action === 'updateHourlyPayment') {
      let { gn02Seq, hourlyPayment } = body;
      // Parse to int and validate range (80–200 in steps of 10)
      const parsed = parseInt(hourlyPayment, 10);
      if (isNaN(parsed) || parsed < 80 || parsed > 200 || (parsed % 10) !== 0) {
        return Response.json({ error: 'סכום לא תקין — חייב להיות בין 80 ל־200 בקפיצות של 10', _status: 400 });
      }
      hourlyPayment = parsed;
      console.log('[teacherProfileProxy] updateHourlyPayment: gn02Seq=', gn02Seq, 'hourlyPayment=', hourlyPayment);
      const seq = await resolveSeq(gn02Seq, email, token, todayDate, API_BASE);
      if (!seq) {
        return Response.json({ error: 'חסר מזהה מורה (gn02Seq) — לא נמצא בפרופיל', _status: 400 });
      }
      return await sendUpdate('/api/TeacherProfile/set_teacher_hourlyPayment', seq, { hourlyPayment }, token, API_BASE);
    }

    if (action === 'insertNewTeacherSubject') {
      const { teacherEmail, subject } = body;
      if (!teacherEmail || !subject) {
        return Response.json({ error: 'חסרים אימייל מורה או מזהה מקצוע', _status: 400 });
      }
      console.log('[teacherProfileProxy] insertNewTeacherSubject: teacherEmail=', teacherEmail, 'subject=', subject);
      const insertUrl = `${API_BASE}/api/TeacherProfile/set_insertNewTeacherSubject`;
      const insertRes = await fetch(insertUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ teacherEmail, subject }),
      });
      const insertText = await insertRes.text();
      console.log('[teacherProfileProxy] insertNewTeacherSubject status:', insertRes.status, 'response:', insertText);
      let insertData;
      try { insertData = JSON.parse(insertText); } catch { insertData = { message: insertText }; }
      if (!insertRes.ok) {
        const errMsg = insertData?.message || insertData?.error || insertData?.title || insertText || `שגיאה בהוספת מקצוע (סטטוס ${insertRes.status})`;
        return Response.json({ error: errMsg, _status: insertRes.status });
      }
      return Response.json({ ...insertData, _status: insertRes.status });
    }

    if (action === 'removeTeacherSubject') {
      const { teacherEmail, subject } = body;
      if (!teacherEmail || !subject) {
        return Response.json({ error: 'חסרים אימייל מורה או מזהה מקצוע', _status: 400 });
      }
      console.log('[teacherProfileProxy] removeTeacherSubject: teacherEmail=', teacherEmail, 'subject=', subject);
      const removeUrl = `${API_BASE}/api/TeacherProfile/set_RemoveTeacherSubject`;
      const removeRes = await fetch(removeUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ teacherEmail, subject }),
      });
      const removeText = await removeRes.text();
      console.log('[teacherProfileProxy] removeTeacherSubject status:', removeRes.status, 'response:', removeText);
      let removeData;
      try { removeData = JSON.parse(removeText); } catch { removeData = { message: removeText }; }
      if (!removeRes.ok) {
        const errMsg = removeData?.message || removeData?.error || removeData?.title || removeText || `שגיאה בהסרת מקצוע (סטטוס ${removeRes.status})`;
        return Response.json({ error: errMsg, _status: removeRes.status });
      }
      return Response.json({ ...removeData, _status: removeRes.status });
    }

    if (action === 'set_Verified_document') {
      const { teacherEmail, subject, documentData } = body;
      if (!teacherEmail || !subject || !documentData) {
        return Response.json({ error: 'חסרים פרטים לשמירת מסמך', _status: 400 });
      }
      // Strip data URL prefix (e.g. "data:image/png;base64,") so C# gets clean base64
      const base64Match = documentData.match(/^data:[^;]+;base64,(.+)$/);
      const cleanBase64 = base64Match ? base64Match[1] : documentData;
      console.log('[teacherProfileProxy] set_Verified_document: teacherEmail=', teacherEmail, 'subject=', subject, 'cleanBase64 length=', cleanBase64?.length);
      const verifyUrl = `${API_BASE}/api/TeacherProfile/set_Verified_document`;
      const verifyRes = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ teacherEmail, subject, documentBase64: cleanBase64 }),
      });
      const verifyText = await verifyRes.text();
      console.log('[teacherProfileProxy] set_Verified_document status:', verifyRes.status, 'response:', verifyText);
      let verifyData;
      try { verifyData = JSON.parse(verifyText); } catch { verifyData = { message: verifyText }; }
      if (!verifyRes.ok) {
        const errMsg = verifyData?.message || verifyData?.error || verifyData?.title || verifyText || `שגיאה בשמירת מסמך (סטטוס ${verifyRes.status})`;
        return Response.json({ error: errMsg, _status: verifyRes.status });
      }
      return Response.json({ ...verifyData, _status: verifyRes.status });
    }

    if (action === 'select_Verified_document') {
      const { teacherEmail, subject } = body;
      if (!teacherEmail || !subject) {
        return Response.json({ error: 'חסרים אימייל מורה או מזהה מקצוע', _status: 400 });
      }
      console.log('[teacherProfileProxy] select_Verified_document: teacherEmail=', teacherEmail, 'subject=', subject);
      const fetchUrl = `${API_BASE}/api/TeacherProfile/select_Verified_document?teacherEmail=${encodeURIComponent(teacherEmail)}&subject=${encodeURIComponent(subject)}`;
      const fetchRes = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });
      const contentType = fetchRes.headers.get('content-type') || '';
      console.log('[teacherProfileProxy] select_Verified_document status:', fetchRes.status, 'content-type:', contentType);
      // Handle binary responses (C# returns File() with application/octet-stream)
      if (fetchRes.ok && (contentType.includes('octet-stream') || contentType.startsWith('image/') || contentType.includes('pdf'))) {
        const arrayBuffer = await fetchRes.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
        }
        const base64 = btoa(binary);
        // C# returns application/octet-stream, but the data is JPEG — use image/jpeg so <img> renders it
        const dataUrl = `data:image/jpeg;base64,${base64}`;
        console.log('[teacherProfileProxy] select_Verified_document: binary response, length=', bytes.length);
        return Response.json({ _documentData: dataUrl, _status: fetchRes.status });
      }
      // Handle JSON responses (error messages, or JSON with document data)
      const fetchText = await fetchRes.text();
      if (!fetchText || fetchText.trim() === '') {
        return Response.json({ _status: fetchRes.status });
      }
      let fetchData;
      try { fetchData = JSON.parse(fetchText); } catch { fetchData = { message: fetchText }; }
      if (!fetchRes.ok) {
        const errMsg = fetchData?.message || fetchData?.error || fetchData?.title || fetchText || `שגיאה בשליפת מסמך (סטטוס ${fetchRes.status})`;
        return Response.json({ error: errMsg, _status: fetchRes.status });
      }
      const docValue = findDocumentField(fetchData);
      if (docValue) {
        console.log('[teacherProfileProxy] select_Verified_document: found document data, length=', docValue.length, 'starts with:', docValue.substring(0, 30));
      } else {
        console.log('[teacherProfileProxy] select_Verified_document: no document field found. Keys:', JSON.stringify(Object.keys(fetchData)));
      }
      return Response.json({ ...fetchData, _documentData: docValue, _status: fetchRes.status });
    }

    if (action === 'getRating') {
      const { teacherEmail, studentEmail, subject, todayDate } = body;
      if (!teacherEmail || !studentEmail || !subject) {
        return Response.json({ error: 'חסרים פרטים לשליפת דירוג', _status: 400 });
      }
      const dateParam = todayDate || new Date().toISOString().slice(0, 10);
      const url = `${API_BASE}/api/TeacherProfile/select_teacher_student_subject_Rating?teacherEmail=${encodeURIComponent(teacherEmail)}&studentEmail=${encodeURIComponent(studentEmail)}&subject=${encodeURIComponent(subject)}&date=${encodeURIComponent(dateParam)}`;
      console.log('[teacherProfileProxy] getRating:', teacherEmail, studentEmail, subject);
      const apiRes = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });
      const text = await apiRes.text();
      console.log('[teacherProfileProxy] getRating status:', apiRes.status, 'response:', text);
      if (!text || text.trim() === '') {
        return Response.json({ _status: apiRes.status });
      }
      let data;
      try { data = JSON.parse(text); } catch { data = { message: text }; }
      if (!apiRes.ok) {
        const errMsg = data?.message || data?.error || data?.title || text || `שגיאה בשליפת דירוג (סטטוס ${apiRes.status})`;
        return Response.json({ error: errMsg, _status: apiRes.status });
      }
      return Response.json({ ...data, _status: apiRes.status });
    }

    if (action === 'setRating') {
      const { teacherEmail, studentEmail, subject, rating, description, todayDate } = body;
      if (!teacherEmail || !studentEmail || !subject || !rating) {
        return Response.json({ error: 'חסרים פרטים לשמירת דירוג', _status: 400 });
      }
      const dateParam = todayDate || new Date().toISOString().slice(0, 10);
      console.log('[teacherProfileProxy] setRating:', teacherEmail, studentEmail, subject, rating);
      const url = `${API_BASE}/api/TeacherProfile/insert_teacher_student_subject_Rating`;
      const apiRes = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ teacherEmail, studentEmail, subject, rating, ratingDescription: description || '', date: dateParam }),
      });
      const text = await apiRes.text();
      console.log('[teacherProfileProxy] setRating status:', apiRes.status, 'response:', text);
      let data;
      try { data = JSON.parse(text); } catch { data = { message: text }; }
      if (!apiRes.ok) {
        const errMsg = data?.message || data?.error || data?.title || text || `שגיאה בשמירת דירוג (סטטוס ${apiRes.status})`;
        return Response.json({ error: errMsg, _status: apiRes.status });
      }
      return Response.json({ ...data, _status: apiRes.status });
    }

    // GET profile
    const url = `${API_BASE}/api/TeacherProfile?email=${encodeURIComponent(email)}&date=${encodeURIComponent(todayDate)}`;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    const apiRes = await fetch(url, { method: 'GET', headers });
    const text = await apiRes.text();
    console.log('[teacherProfileProxy] GET status:', apiRes.status);

    if (!text || text.trim() === '') {
      if (apiRes.status >= 500) {
        return Response.json({ error: 'שרת הפרופיל אינו זמין כעת. נסו שוב.', _status: apiRes.status });
      }
      return Response.json({ _status: apiRes.status });
    }
    let data;
    try { data = JSON.parse(text); } catch { data = { message: text }; }

    if (apiRes.status >= 500) {
      return Response.json({ error: data?.message || data?.error || 'שגיאה בטעינת הפרופיל. נסו שוב.', _status: apiRes.status });
    }

    // Find seq field and add it as _foundSeq for the frontend
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const found = findSeqField(data);
      if (found) {
        console.log('[teacherProfileProxy] Found seq field:', found.key, '=', found.value);
        data._foundSeq = found.value;
        data._foundSeqKey = found.key;
      } else {
        console.log('[teacherProfileProxy] No seq field found. Top keys:', Object.keys(data));
      }
    }

    if (Array.isArray(data)) {
      return Response.json({ Data: data, _status: apiRes.status });
    }
    return Response.json({ ...data, _status: apiRes.status });
  } catch (error) {
    console.error('[teacherProfileProxy] Unhandled error:', error.message, error.stack);
    return Response.json({ error: 'שגיאת שרת פנימית: ' + error.message, _status: 500 });
  }
});