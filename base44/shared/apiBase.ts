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

/**
 * Resolves the C# API base URL from the incoming request.
 * Checks the platform-injected X-Base44-App-Url header first,
 * then the browser Referer, then the Origin header.
 * Defaults to ngrok (Base44 builder/preview environment).
 */
export function getApiBase(req: Request): string {
  const appUrlHeader = req.headers.get('X-Base44-App-Url') || '';
  if (appUrlHeader) return getApiBaseFromAppUrl(appUrlHeader);

  const referer = req.headers.get('Referer') || req.headers.get('referer') || '';
  if (referer) return getApiBaseFromAppUrl(referer);

  const origin = req.headers.get('Origin') || req.headers.get('origin') || '';
  if (origin) return getApiBaseFromAppUrl(origin);

  return NGROK_BASE;
}

/**
 * Returns true when the resolved API base is the production server.
 */
export function isProductionBase(apiBase: string): boolean {
  return apiBase === PRODUCTION_BASE;
}