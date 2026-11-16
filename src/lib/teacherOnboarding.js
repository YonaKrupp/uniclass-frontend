import { base44 } from "@/api/base44Client";

export const ONBOARDING_RESTART_EVENT = "teacher-onboarding:restart";
export const ONBOARDING_TOUR_STEP_EVENT = "teacher-onboarding:tour-step";

const DEFAULT_STATE = {
  stage: "profile",
  profileStep: 0,
  tourStep: 0,
  completed: false,
  skipped: false,
};

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

export function getTeacherIdentity() {
  try {
    const data = JSON.parse(localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}");
    return {
      email: String(data.teacherEmail || data.email || "").trim().toLowerCase(),
      token: localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || "",
    };
  } catch {
    return { email: "", token: "" };
  }
}

export function todayDateString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

// מדריך ההצטרפות נשמר ונקרא דרך השרת בלבד (מאומת לפי הטוקן של המורה).
async function callOnboarding(action, payload) {
  const { email, token } = getTeacherIdentity();
  if (!email || !token) return null;
  const response = await base44.functions.invoke("teacherOnboardingProxy", {
    action,
    teacherEmail: email,
    token,
    ...payload,
  });
  // invoke מחזיר תשובת Axios; שגיאת הרשאה מגיעה כשגיאה מן השרת.
  return response?.data ?? response ?? null;
}

export async function loadOnboarding(teacherEmail) {
  const email = normalizeEmail(teacherEmail);
  if (!email) return null;
  const res = await callOnboarding("get");
  return res?.record ?? null;
}

export async function createOnboarding(teacherEmail, extra = {}) {
  const res = await callOnboarding("create", { patch: { ...DEFAULT_STATE, ...extra } });
  return res?.record ?? null;
}

export async function updateOnboarding(id, patch) {
  if (!id) return null;
  const res = await callOnboarding("update", { id, patch });
  return res?.record ?? null;
}

// Restart is triggered from the profile page: reset the saved progress so the
// wizard starts again from its first step.
export async function restartOnboarding(teacherEmail) {
  const existing = await loadOnboarding(teacherEmail);
  if (existing?.id) return updateOnboarding(existing.id, DEFAULT_STATE);
  return createOnboarding(teacherEmail);
}

// Returns the teacher's onboarding record, creating it if needed. When the
// teacher already has a profile, the profile onboarding is marked as done so
// the wizard never pops up for an existing teacher.
export async function ensureOnboarding(teacherEmail, hasProfile) {
  const existing = await loadOnboarding(teacherEmail);
  if (existing) return existing;
  const created = await createOnboarding(teacherEmail);
  if (!hasProfile || !created?.id) return created;
  const updated = await updateOnboarding(created.id, { completed: true });
  return { ...created, ...(updated || {}), completed: true };
}

export async function markScheduleTourCompleted(teacherEmail, hasProfile) {
  const record = await ensureOnboarding(teacherEmail, hasProfile);
  if (!record?.id) return null;
  return updateOnboarding(record.id, { scheduleTourCompleted: true });
}

// A teacher who already wrote their "about" text is not new — don't surprise
// them with the profile wizard on their next visit. If the profile can't be
// read we treat the teacher as new, and the wizard is skippable anyway.
export async function teacherHasProfile(email, token) {
  if (!email) return true;
  try {
    const res = await base44.functions.invoke("teacherProfileProxy", {
      email,
      token,
      todayDate: todayDateString(),
    });
    const data = res.data || {};
    const details = data.details || data.Details || {};
    const about = String(details.gn02_presentYourSelf || data.gn02_presentYourSelf || "").trim();
    return about.length > 0;
  } catch {
    return false;
  }
}