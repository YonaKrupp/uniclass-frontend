import { useEffect } from "react";

const COOLDOWN_MS = 30000;

// Store on globalThis so the Map survives module re-evaluation (HMR, dynamic imports).
// A plain module-level const would be reset to a new empty Map if the module is re-imported.
const _g = globalThis;
if (!_g.__singleMountEffectMap) {
  _g.__singleMountEffectMap = new Map();
}
const recentRuns = _g.__singleMountEffectMap;

/**
 * Like useEffect with [], but guarantees the callback runs at most once per
 * COOLDOWN_MS for a given key — even if the component unmounts and remounts,
 * or the module is re-evaluated by HMR.
 */
export function useSingleMountEffect(key, callback, deps = []) {
  useEffect(() => {
    const now = Date.now();
    const lastRun = recentRuns.get(key) || 0;
    if (now - lastRun < COOLDOWN_MS) {
      console.log(`[useSingleMountEffect] BLOCKED ${key}`, { lastRun, now, diff: now - lastRun });
      return;
    }
    recentRuns.set(key, now);
    console.log(`[useSingleMountEffect] ALLOWED ${key}`, { lastRun, now, diff: now - lastRun });
    callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}