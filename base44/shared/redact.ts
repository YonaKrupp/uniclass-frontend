// Removes personally sensitive identifiers (national ID / ת"ז, passport, stored
// credentials, raw documents) from an API payload before it leaves the server.
// Used for every response that a non-owner can read.

const SENSITIVE_KEYS = new Set([
  'tzid',
  'tz',
  't_z',
  'idnumber',
  'id_number',
  'identitynumber',
  'identity_number',
  'nationalid',
  'national_id',
  'teudat_zehut',
  'teudatzehut',
  'passport',
  'passportnumber',
  'password',
  'passwordhash',
  'password_hash',
  'salt',
  'documentbase64',
  'documentdata',
  'document_data',
  'verified_document',
  'verifieddocument',
  'authToken'.toLowerCase(),
]);

function isSensitiveKey(key: string): boolean {
  const normalized = key.replace(/[\s-]/g, '_').toLowerCase();
  if (SENSITIVE_KEYS.has(normalized)) return true;
  return /(^|_)(tzid|tz|teudat|passport|idnumber|id_number|national_id|nationalid|password_hash|passwordhash|document_base64)($|_)/.test(
    normalized,
  );
}

/** Returns a deep copy of `value` with sensitive fields removed. */
export function stripSensitiveFields<T>(value: T, depth = 0): T {
  if (depth > 6 || value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map((item) => stripSensitiveFields(item, depth + 1)) as unknown as T;
  }
  if (typeof value !== 'object') return value;

  const source = value as Record<string, unknown>;
  const output: Record<string, unknown> = {};
  for (const key of Object.keys(source)) {
    if (isSensitiveKey(key)) continue;
    output[key] = stripSensitiveFields(source[key], depth + 1);
  }
  return output as unknown as T;
}