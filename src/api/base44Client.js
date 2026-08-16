import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, functionsVersion, appBaseUrl } = appParams;

// Clear any stale Base44 tokens BEFORE creating the client — if we have a custom C# auth token,
// the SDK must not find a Base44 token and auto-call User/me (causes 401 in console)
// BUT: don't clear if we just returned from Google OAuth (appParams.token is set)
if (typeof window !== 'undefined' && localStorage.getItem('authToken') && !appParams.token) {
  localStorage.removeItem('base44_access_token');
  localStorage.removeItem('base44_token');
}

// Create client with dynamic token from localStorage
// Never pass a token at module load time — it happens before custom auth is available
// The SDK will work without auth for function calls; pages guard themselves with ProtectedRoute
// serverUrl is pinned to the Base44 platform so auth/entity/function calls always resolve
// to Base44 regardless of which domain serves the frontend (custom domain, new address, etc.)
// Pin serverUrl + appId to the Base44 platform so auth/entity/function calls always
// resolve correctly regardless of which domain serves the frontend (custom domain,
// new address, etc.). appBaseUrl uses the current origin so Google OAuth redirects
// back to the domain the user started on.
const BASE44_SERVER_URL = 'https://learn-le-connect.base44.app';
const BASE44_APP_ID = '6a37f1517bf59551c5f4b6f9';
// appBaseUrl = the domain the user is currently on, so Google OAuth redirects
// back to that same domain (custom domain like uniclass.co.il, or the Base44
// builder/preview). serverUrl stays pinned to Base44 for SDK API calls.
const CURRENT_ORIGIN = typeof window !== 'undefined' ? window.location.origin : BASE44_SERVER_URL;
const base44 = createClient({
  appId: BASE44_APP_ID,
  functionsVersion,
  serverUrl: BASE44_SERVER_URL,
  requiresAuth: false,
  appBaseUrl: CURRENT_ORIGIN,
  token: '',  // Always empty — no automatic auth attempts
  skipServiceRole: true
});

// Suppress 401 errors from attempted base44.auth.me() calls when using custom auth
if (typeof window !== 'undefined') {
  // Note: The SDK may call /entities/User/me internally and get a 401 when using custom C# auth.
  // This is harmless — it doesn't block the app. No fetch interception needed.
}

export { base44 };