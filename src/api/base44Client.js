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
const base44 = createClient({
  appId,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl,
  token: '',  // Always empty — no automatic auth attempts
  skipServiceRole: true
});

// Suppress 401 errors from attempted base44.auth.me() calls when using custom auth
if (typeof window !== 'undefined') {
  // Note: The SDK may call /entities/User/me internally and get a 401 when using custom C# auth.
  // This is harmless — it doesn't block the app. No fetch interception needed.
}

export { base44 };