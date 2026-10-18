// Shared API base resolver — determines whether to route C# API calls
// to the ngrok tunnel (Base44 builder/preview) or the production server (uniclass.co.il).

const NGROK_BASE = 'https://hacking-frighten-dandy.ngrok-free.dev';
const PRODUCTION_BASE = 'http://corewebapi-env.il-central-1.elasticbeanstalk.com';

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
 * Defaults to ngrok (Base44 builder/preview environment).
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

  return NGROK_BASE;
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