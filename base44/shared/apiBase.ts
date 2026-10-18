// Shared API base resolver — determines whether to route C# API calls
// to the ngrok tunnel (Base44 builder/preview) or the production server (uniclass.co.il).

export const NGROK_BASE = 'https://hacking-frighten-dandy.ngrok-free.dev';
export const PRODUCTION_BASE = 'http://corewebapi-env.il-central-1.elasticbeanstalk.com';

/**
 * Resolves the C# API base URL from a known app/frontend URL string.
 * Routes to NGROK_BASE only when the caller is Base44 (builder/preview domain);
 * any other origin (uniclass.co.il or anywhere else) uses PRODUCTION_BASE.
 */
export function getApiBaseFromAppUrl(appUrl: string): string {
  if (appUrl && appUrl.includes('base44')) {
    return NGROK_BASE;
  }
  return PRODUCTION_BASE;
}

/**
 * Resolves the C# API base URL from the incoming request.
 *
 * The page the visitor is actually on decides:
 * 1. X-Client-Origin — the origin the frontend declares for itself on every call.
 * 2. The browser Origin / Referer.
 * 3. X-Base44-App-Url — the platform-injected header, which carries the app's
 *    Base44 address even when the page is served on the custom domain.
 *
 * A caller origin that is NOT Base44 therefore wins over the injected header —
 * otherwise a request from uniclass.co.il would be sent to the developer's tunnel.
 */
export function getApiBase(req: Request): string {
  const clientOrigin = req.headers.get('X-Client-Origin') || '';
  const origin = req.headers.get('Origin') || req.headers.get('origin') || '';
  const referer = req.headers.get('Referer') || req.headers.get('referer') || '';
  const appUrlHeader = req.headers.get('X-Base44-App-Url') || '';

  const callerOrigins = [clientOrigin, origin, referer].filter((value) => value.startsWith('http'));
  const nonBase44Origin = callerOrigins.find((value) => !value.includes('base44'));

  let base: string;
  if (nonBase44Origin) {
    base = getApiBaseFromAppUrl(nonBase44Origin);
  } else if (appUrlHeader) {
    base = getApiBaseFromAppUrl(appUrlHeader);
  } else if (callerOrigins.length > 0) {
    base = getApiBaseFromAppUrl(callerOrigins[0]);
  } else {
    // No signal at all must never send a real visitor's request to the developer's machine.
    base = PRODUCTION_BASE;
  }

  console.log('[apiBase] signals', JSON.stringify({ clientOrigin, origin, referer, appUrlHeader, base }));
  return base;
}

/**
 * Returns true when the resolved API base is the production server.
 */
export function isProductionBase(apiBase: string): boolean {
  return apiBase === PRODUCTION_BASE;
}