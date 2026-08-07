// Global fetch guard — prevents double API calls across component remounts, HMR, page reloads.
// Uses BOTH globalThis (survives HMR, not page reloads) AND sessionStorage (survives page reloads, cleared on tab close).
const COOLDOWN_MS = 30000;

export function shouldFetch(key, force = false) {
  if (force) return true;
  const now = Date.now();

  // globalThis guard — survives HMR and module re-evaluation, NOT page reloads
  const g = globalThis;
  if (!g.__fetchGuardMap) g.__fetchGuardMap = new Map();
  const lastGlobal = g.__fetchGuardMap.get(key) || 0;

  // localStorage guard — survives page reloads AND iframe re-initialization (builder preview)
  let lastSession = 0;
  try { lastSession = parseInt(localStorage.getItem(`_fetchGuard_${key}`) || "0", 10) || 0; } catch {}

  const last = Math.max(lastGlobal, lastSession);

  if (now - last < COOLDOWN_MS) {
    console.log(`[fetchGuard] BLOCKED ${key}`, { last, now, diff: now - last });
    return false;
  }
  g.__fetchGuardMap.set(key, now);
  try { localStorage.setItem(`_fetchGuard_${key}`, String(now)); } catch {}
  console.log(`[fetchGuard] ALLOWED ${key}`, { last, now, diff: now - last });
  return true;
}

export function clearFetchGuard() {
  try {
    const g = globalThis;
    if (g.__fetchGuardMap) g.__fetchGuardMap.clear();
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith("_fetchGuard_")) localStorage.removeItem(k);
    });
  } catch {}
}