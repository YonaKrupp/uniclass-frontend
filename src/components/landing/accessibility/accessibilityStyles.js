/**
 * Client-side CSS for the accessibility toolbar.
 * Injected once into <head> by useAccessibility (see accessibilityStyles injection there).
 * Nothing here leaves the browser and nothing is sent to a server.
 */
export const ACCESSIBILITY_CSS = `
/* ==========================================================================
   UniClass — accessibility toolbar
   Everything below is scoped so it can never reach the toolbar itself.
   ========================================================================== */

/* Filter immunity: the page is inverted on <html>, so the toolbar applies the
   identical filter to cancel it out and stay readable. */
html.uc-invert .uc-a11y-immune { filter: invert(1) hue-rotate(180deg); }

/* --------------------------------------------------------------- 1. contrast */
/* Only the page itself is painted black. Every element inside is made
   transparent, so no card, overlay or decorative layer can sit opaque on top
   of the content and hide it. */
html.uc-contrast,
html.uc-contrast body,
html.uc-contrast #root { background-color: #000000 !important; }
html.uc-contrast #root header { background-color: #000000 !important; }
html.uc-contrast #root * {
  background-color: transparent !important;
  background-image: none !important;
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  border-color: #ffe600 !important;
  box-shadow: none !important;
  text-shadow: none !important;
  background-clip: border-box !important;
  -webkit-background-clip: border-box !important;
}
html.uc-contrast #root a,
html.uc-contrast #root a * {
  color: #ffe600 !important;
  -webkit-text-fill-color: #ffe600 !important;
  text-decoration: underline !important;
  text-decoration-thickness: 2px !important;
}
html.uc-contrast #root input,
html.uc-contrast #root textarea,
html.uc-contrast #root select,
html.uc-contrast #root button {
  background-color: #000000 !important;
  border: 1px solid #ffe600 !important;
}
html.uc-contrast #root ::placeholder { color: #ffe600 !important; opacity: 1 !important; }
html.uc-contrast #root ::selection { background: #ffe600 !important; color: #000000 !important; }

/* ----------------------------------------------------------- 2. inverted */
html.uc-invert { filter: invert(1) hue-rotate(180deg); }

/* ------------------------------------------------------------ 3. grayscale */
html.uc-grayscale { filter: grayscale(1); }

/* ------------------------------------------------------------ 4. black/white */
html.uc-bw,
html.uc-bw body,
html.uc-bw #root { background-color: #ffffff !important; }
html.uc-bw #root header { background-color: #ffffff !important; }
html.uc-bw #root * {
  background-color: transparent !important;
  background-image: none !important;
  color: #000000 !important;
  -webkit-text-fill-color: #000000 !important;
  border-color: #000000 !important;
  box-shadow: none !important;
  text-shadow: none !important;
  background-clip: border-box !important;
  -webkit-background-clip: border-box !important;
}
html.uc-bw #root a,
html.uc-bw #root a * {
  color: #000000 !important;
  -webkit-text-fill-color: #000000 !important;
  text-decoration: underline !important;
  text-decoration-thickness: 2px !important;
}
html.uc-bw #root input,
html.uc-bw #root textarea,
html.uc-bw #root select,
html.uc-bw #root button {
  background-color: #ffffff !important;
  border: 1px solid #000000 !important;
}
html.uc-bw #root ::placeholder { color: #000000 !important; opacity: 1 !important; }
html.uc-bw #root img,
html.uc-bw #root svg { filter: grayscale(1) !important; }

/* ------------------------------------- 6 + 7. word spacing / letter spacing */
html.uc-ws,
html.uc-ws * { word-spacing: var(--uc-ws) !important; }
html.uc-ls,
html.uc-ls * { letter-spacing: var(--uc-ls) !important; }
html.uc-ws .uc-a11y-panel,
html.uc-ws .uc-a11y-panel * { word-spacing: normal !important; }
html.uc-ls .uc-a11y-panel,
html.uc-ls .uc-a11y-panel * { letter-spacing: normal !important; }

/* --------------------------------------------------------- 8. readable font */
html.uc-font * { font-family: Arial, Helvetica, sans-serif !important; }

/* ------------------------------------------------------- 9. highlight links */
html.uc-links #root a {
  text-decoration: underline !important;
  text-decoration-thickness: 2px !important;
  text-underline-offset: 2px !important;
  background-color: #fff3b0 !important;
  color: #5a3a00 !important;
  -webkit-text-fill-color: #5a3a00 !important;
  outline: 2px solid #b45309 !important;
  outline-offset: 1px !important;
  border-radius: 3px !important;
}
html.uc-links #root a * {
  color: #5a3a00 !important;
  -webkit-text-fill-color: #5a3a00 !important;
  background-color: transparent !important;
}

/* ---------------------------------------------------- 10. highlight headings */
html.uc-headings #root h1,
html.uc-headings #root h2,
html.uc-headings #root h3,
html.uc-headings #root h4,
html.uc-headings #root h5,
html.uc-headings #root h6 {
  outline: 3px solid #7c3aed !important;
  outline-offset: 2px !important;
  border-radius: 4px !important;
  background-color: rgba(196, 181, 253, 0.32) !important;
}

/* ------------------------------------------------------- 12. reading guide */
.uc-guide {
  position: fixed;
  left: 0;
  right: 0;
  top: -100px;
  height: 34px;
  display: none;
  background-color: rgba(82, 32, 146, 0.18);
  border-top: 2px solid rgba(82, 32, 146, 0.85);
  border-bottom: 2px solid rgba(82, 32, 146, 0.85);
  pointer-events: none;
  z-index: 99998;
}

/* ------------------------------------------------- 13. screen-reader support */
html.uc-sr a:focus,
html.uc-sr button:focus,
html.uc-sr input:focus,
html.uc-sr select:focus,
html.uc-sr textarea:focus,
html.uc-sr [tabindex]:focus {
  outline: 3px solid #522092 !important;
  outline-offset: 3px !important;
  border-radius: 4px !important;
}
.uc-skip-link {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 100000;
  transform: translateY(-320%);
  background: #522092;
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  padding: 12px 18px;
  border-radius: 10px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 10px 30px rgba(15, 23, 41, 0.35);
  transition: transform 0.18s ease;
}
.uc-skip-link:focus { transform: translateY(0); outline: 3px solid #ffffff !important; }

/* -------------------------------------------------------- 14. hide images */
html.uc-hide-img #root img { visibility: hidden !important; }
html.uc-hide-img #root * { background-image: none !important; }

/* ------------------------------------------------------- 15 + 16. cursors */
html.uc-cursor-dark,
html.uc-cursor-dark * {
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='46' height='46' viewBox='0 0 32 32'%3E%3Cpath d='M7 2 L7 27 L13 21 L17 31 L22 29 L18 19 L27 19 Z' fill='%23000000' stroke='%23ffffff' stroke-width='2.5' stroke-linejoin='round'/%3E%3C/svg%3E") 7 2, auto !important;
}
html.uc-cursor-light,
html.uc-cursor-light * {
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='46' height='46' viewBox='0 0 32 32'%3E%3Cpath d='M7 2 L7 27 L13 21 L17 31 L22 29 L18 19 L27 19 Z' fill='%23ffffff' stroke='%23000000' stroke-width='2.5' stroke-linejoin='round'/%3E%3C/svg%3E") 7 2, auto !important;
}

/* --------------------------------------------------- 17. stop all motion */
html.uc-nomotion *,
html.uc-nomotion *::before,
html.uc-nomotion *::after {
  animation: none !important;
  transition: none !important;
  scroll-behavior: auto !important;
}

/* ==========================================================================
   The drawer itself — fixed px sizing so text scaling can never break it,
   and rendered outside #root so colour modes cannot reach it.
   ========================================================================== */
.uc-a11y-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99990;
  border: 0;
  padding: 0;
  background: rgba(15, 23, 41, 0.45);
}

.uc-a11y-panel {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  width: 360px;
  max-width: 100vw;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  color: #0f1729;
  border-radius: 0 18px 18px 0;
  box-shadow: 0 24px 70px rgba(15, 23, 41, 0.32);
  font-family: "Heebo", "Rubik", Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  letter-spacing: normal !important;
  word-spacing: normal !important;
  overflow: hidden;
  animation: uc-a11y-slide 0.24s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes uc-a11y-slide {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.uc-a11y-head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 18px 14px;
  border-bottom: 1px solid #e1e7ef;
  background: #ffffff;
}
.uc-a11y-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #522092;
  letter-spacing: normal !important;
  word-spacing: normal !important;
}
.uc-a11y-close {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid #e1e7ef;
  background: #ffffff;
  color: #475569;
  cursor: pointer;
}
.uc-a11y-close:hover { background: #f1f5f9; color: #0f1729; }
.uc-a11y-close:focus-visible { outline: 3px solid #522092; outline-offset: 2px; }

.uc-a11y-body {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 16px 18px 24px;
  -webkit-overflow-scrolling: touch;
}
.uc-a11y-group + .uc-a11y-group { margin-top: 22px; }
.uc-a11y-group-title {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.03em;
  color: #64748b;
}
.uc-a11y-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

/* ---- toggle card ---- */
.uc-a11y-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 96px;
  padding: 14px 8px;
  background: #ffffff;
  border: 1.5px solid #e1e7ef;
  border-radius: 14px;
  color: #334155;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.25;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease;
}
.uc-a11y-card:hover { border-color: #b7a6e8; background: #faf8ff; }
.uc-a11y-card:focus-visible { outline: 3px solid #522092; outline-offset: 2px; }
.uc-a11y-card[aria-pressed="true"] {
  border-color: #522092;
  background: #f4eefb;
  color: #522092;
}
.uc-a11y-card-label { display: block; }
.uc-a11y-check {
  position: absolute;
  top: 6px;
  left: 6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #522092;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.5);
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.uc-a11y-card[aria-pressed="true"] .uc-a11y-check { opacity: 1; transform: scale(1); }

/* ---- stepper card ---- */
.uc-a11y-stepper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 96px;
  padding: 12px 8px;
  background: #ffffff;
  border: 1.5px solid #e1e7ef;
  border-radius: 14px;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.25;
  text-align: center;
}
.uc-a11y-stepper-value {
  font-size: 15px;
  font-weight: 800;
  color: #522092;
  font-variant-numeric: tabular-nums;
}
.uc-a11y-stepper-row { display: flex; align-items: center; gap: 6px; margin-top: 2px; }
.uc-a11y-mini {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: 1.5px solid #e1e7ef;
  background: #f8fafc;
  color: #334155;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}
.uc-a11y-mini:hover:not(:disabled) { background: #eef2f7; border-color: #b7a6e8; color: #522092; }
.uc-a11y-mini:disabled { opacity: 0.35; cursor: not-allowed; }
.uc-a11y-mini:focus-visible { outline: 3px solid #522092; outline-offset: 2px; }

/* ---- footer ---- */
.uc-a11y-foot {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-top: 1px solid #e1e7ef;
  background: #fbfcfe;
}
.uc-a11y-reset {
  flex: 1 1 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1.5px solid #e1e7ef;
  background: #ffffff;
  color: #334155;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
.uc-a11y-reset:hover { border-color: #b7a6e8; color: #522092; }
.uc-a11y-reset:focus-visible { outline: 3px solid #522092; outline-offset: 2px; }
.uc-a11y-link {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 14px;
  border-radius: 12px;
  background: #f4eefb;
  color: #522092;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}
.uc-a11y-link:hover { background: #e9dffa; }
.uc-a11y-link:focus-visible { outline: 3px solid #522092; outline-offset: 2px; }

/* icon sizes in px so text scaling cannot distort the panel */
.uc-a11y-panel svg { width: 24px !important; height: 24px !important; }
.uc-a11y-panel .uc-a11y-stepper svg { width: 22px !important; height: 22px !important; }
.uc-a11y-panel .uc-a11y-mini svg { width: 16px !important; height: 16px !important; }
.uc-a11y-panel .uc-a11y-close svg { width: 18px !important; height: 18px !important; }
.uc-a11y-panel .uc-a11y-check svg { width: 14px !important; height: 14px !important; }
.uc-a11y-panel .uc-a11y-reset svg { width: 17px !important; height: 17px !important; }

@media (max-width: 480px) {
  .uc-a11y-panel { width: 100%; max-width: 100%; border-radius: 0; }
}
`;