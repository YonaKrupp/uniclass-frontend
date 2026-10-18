// Shared API base resolver — decides which C# API a request talks to.
//
// The tunnel points at the developer's own machine, so it is used ONLY when the
// page itself runs on a local development address. Every deployed address — the
// Base44 domain (builder preview and published app) and the custom domain —
// talks to the production server.

export const NGROK_BASE = 'https://hacking-frighten-dandy.ngrok-free.dev';
export const PRODUCTION_BASE = 'http://corewebapi-env.il-central-1.elasticbeanstalk.com';

const LOCAL_DEV_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '192.168.'];

/**
 * True only for a page running on the developer's own machine.
 */
export function isLocalDevUrl(appUrl: string): boolean {
  if (!appUrl) return false;
  const host = appUrl.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
  return LOCAL_DEV_HOSTS.some((local) => host.startsWith(local));
}

/**
 * Resolves the C# API base URL from a known app/frontend URL string.
 * Only a local development address uses the tunnel; every deployed address
 * (base44.app, the custom domain, anything else) uses PRODUCTION_BASE.
 */
export function getApiBaseFromAppUrl(appUrl: string): string {
  return isLocalDevUrl(appUrl) ? NGROK_BASE : PRODUCTION_BASE;
}

const isHttpUrl = (value: string): boolean => value.startsWith('http');

/**
 * Resolves the C# API base URL from the incoming request.
 *
 * The caller's OWN origin decides: a request coming from the production site
 * (uniclass.co.il) must reach the production API, while one coming from Base44
 * (builder / preview) keeps using the ngrok tunnel.
 *
 * The browser Origin / Referer is therefore checked BEFORE the platform-injected
 * X-Base44-App-Url header, because that header carries the app's Base44 URL even
 * when the page is served on the custom domain.
 *
 * Defaults to the production server: a missing signal must never send a real
 * visitor's request to the developer's machine.
 */
export function getApiBase(req: Request, clientOrigin?: string): string {
  const origin = req.headers.get('Origin') || req.headers.get('origin') || '';
  const referer = req.headers.get('Referer') || req.headers.get('referer') || '';
  const appUrlHeader = req.headers.get('X-Base44-App-Url') || '';
  const headerOrigin = req.headers.get('X-Client-Origin') || '';
  const callerOrigins = [origin, referer].filter(isHttpUrl);

  // 0) The page the user is actually on is the most reliable signal: the platform
  //    gateway does not forward the browser's Origin/Referer to the function, so the
  //    frontend sends its own origin explicitly (body.clientOrigin / X-Client-Origin).
  const declaredOrigin = clientOrigin || headerOrigin;
  if (declaredOrigin && isHttpUrl(declaredOrigin)) {
    return getApiBaseFromAppUrl(declaredOrigin);
  }

  // 1) A non-Base44 caller origin wins — the real site always talks to production.
  const nonBase44Origin = callerOrigins.find((value) => !value.includes('base44'));
  if (nonBase44Origin) return getApiBaseFromAppUrl(nonBase44Origin);

  // 2) Base44 builder / preview — platform header, then the Base44 caller origin.
  if (appUrlHeader) return getApiBaseFromAppUrl(appUrlHeader);
  if (callerOrigins.length > 0) return getApiBaseFromAppUrl(callerOrigins[0]);

  return PRODUCTION_BASE;
}

/**
 * Returns true when the resolved API base is the production server.
 */
export function isProductionBase(apiBase: string): boolean {
  return apiBase === PRODUCTION_BASE;
}

/**
 * True when the given value is one of the two API bases we own. The frontend
 * resolves the base itself (so the request always matches the address shown on
 * screen) and sends it along — anything else is ignored.
 */
export function isKnownApiBase(value?: string): boolean {
  return value === NGROK_BASE || value === PRODUCTION_BASE;
}