import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { requireUser, sameEmail, forbidden } from '../../shared/requireUser.ts';

// רשימת שדות מותרים בלעדית — מונעת mass assignment מהגוף של הבקשה.
const ALLOWED_PATCH_FIELDS = [
  'stage',
  'profileStep',
  'tourStep',
  'completed',
  'skipped',
  'scheduleTourCompleted',
  'experience',
  'education',
  'availability',
];

function pickAllowedFields(patch: unknown): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return output;
  const source = patch as Record<string, unknown>;
  for (const field of ALLOWED_PATCH_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(source, field)) output[field] = source[field];
  }
  return output;
}

// גישה לנתוני מדריך ההצטרפות של המורה דרך השרת בלבד.
// הזהות נלקחת מהטוקן של המשתמש, ולא מהגוף — כך מורה לא יכול לקרוא נתוני מורה אחר.
Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { action, teacherEmail, id, patch } = body;
    const auth = await requireUser(body?.token);
    if (!auth.ok) return auth.response;

    if (teacherEmail && !sameEmail(teacherEmail, auth.email)) {
      return forbidden('אין הרשאה לנתוני מורה אחר');
    }
    const email = auth.email.toLowerCase();

    const base44 = createClientFromRequest(req);

    if (action === 'get') {
      const { items } = await base44.asServiceRole.entities.TeacherOnboarding.filter(
        { teacherEmail: email },
        { sort: '-created_date', limit: 1 },
      );
      return Response.json({ record: (items || [])[0] ?? null });
    }

    if (action === 'create') {
      const record = await base44.asServiceRole.entities.TeacherOnboarding.create({
        ...pickAllowedFields(patch),
        teacherEmail: email,
      });
      return Response.json({ record });
    }

    if (action === 'update') {
      if (!id) return Response.json({ error: 'חסר מזהה רשומה' }, { status: 400 });
      const existing = await base44.asServiceRole.entities.TeacherOnboarding.get(id);
      if (!existing) return Response.json({ error: 'הרשומה לא נמצאה' }, { status: 404 });
      if (String(existing.teacherEmail || '').trim().toLowerCase() !== email) {
        return Response.json({ error: 'אין הרשאה לעדכן רשומה זו' }, { status: 403 });
      }
      const record = await base44.asServiceRole.entities.TeacherOnboarding.update(id, pickAllowedFields(patch));
      return Response.json({ record });
    }

    return Response.json({ error: 'פעולה לא מוכרת' }, { status: 400 });
  } catch (error) {
    console.error('[teacherOnboardingProxy] error:', (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});