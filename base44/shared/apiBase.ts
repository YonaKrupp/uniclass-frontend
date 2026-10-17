// Shared API base resolver — all C# API calls go to the production server.
// (The app is served from a base44.app domain, so routing by origin sent live
// traffic to a development tunnel that is no longer running.)

const PRODUCTION_BASE = 'http://corewebapi-env.il-central-1.elasticbeanstalk.com';

/**
 * Returns the C# API base URL. Always the production server.
 */
export function getApiBaseFromAppUrl(_appUrl: string): string {
  return PRODUCTION_BASE;
}

/**
 * Returns the C# API base URL for the incoming request. Always the production server.
 */
export function getApiBase(_req: Request): string {
  return PRODUCTION_BASE;
}

/**
 * Returns true when the resolved API base is the production server.
 */
export function isProductionBase(apiBase: string): boolean {
  return apiBase === PRODUCTION_BASE;
}