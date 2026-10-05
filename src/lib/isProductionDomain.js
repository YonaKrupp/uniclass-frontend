// Detects whether the app is being served from the production marketing
// domain (uniclass.co.il). Login buttons are disabled there.
export function isProductionDomain() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname || "";
  return host.includes("uniclass.co.il");
}