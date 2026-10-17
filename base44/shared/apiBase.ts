// Shared API base resolver.
//
// The app talks to the production C# API from every environment — the live
// site (uniclass.co.il), the published app domain and the builder preview.
// There is no development tunnel anymore: nothing in the app may reach a
// staging/ngrok server, so no request can depend on which domain it came from.

export const PRODUCTION_BASE = 'http://corewebapi-env.il-central-1.elasticbeanstalk.com';

/**
 * Resolves the C# API base URL from a known app/frontend URL string.
 * Kept so existing callers keep working — the production server always wins.
 */
export function getApiBaseFromAppUrl(_appUrl?: string): string {
  return PRODUCTION_BASE;
}

/**
 * Resolves the C# API base URL from the incoming request.
 */
export function getApiBase(_req?: Request): string {
  return PRODUCTION_BASE;
}

/**
 * Returns true when the resolved API base is the production server.
 */
export function isProductionBase(apiBase: string): boolean {
  return apiBase === PRODUCTION_BASE;
}