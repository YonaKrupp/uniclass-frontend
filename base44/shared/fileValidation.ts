// Server-side validation for client-supplied files (profile pictures, teacher
// certificates). Type is decided by the file's magic bytes, never by the name the
// client sent, and SVG / anything unrecognised is rejected.

export type DetectedType = 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf';

export interface FileCheck {
  ok: true;
  mime: DetectedType;
  base64: string;
  bytes: Uint8Array;
}

export interface FileRejection {
  ok: false;
  error: string;
}

const IMAGE_MAX_BYTES = 3 * 1024 * 1024;
const DOCUMENT_MAX_BYTES = 5 * 1024 * 1024;

function base64ToBytes(base64: string): Uint8Array | null {
  try {
    const binary = atob(base64);
    return Uint8Array.from(binary, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

function startsWith(bytes: Uint8Array, signature: number[]): boolean {
  if (bytes.length < signature.length) return false;
  return signature.every((value, index) => bytes[index] === value);
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}

export function detectType(bytes: Uint8Array): DetectedType | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return 'image/webp';
  if (ascii(bytes, 0, 4) === '%PDF') return 'application/pdf';
  return null;
}

/** Splits an optional data URL and returns clean base64. */
function cleanBase64(value: unknown): string {
  const raw = String(value ?? '').trim();
  const match = raw.match(/^data:[^;]+;base64,(.+)$/);
  return (match ? match[1] : raw).replace(/\s/g, '');
}

function validate(value: unknown, allowPdf: boolean): FileCheck | FileRejection {
  const base64 = cleanBase64(value);
  if (!base64) return { ok: false, error: 'לא נשלח קובץ' };

  const bytes = base64ToBytes(base64);
  if (!bytes || bytes.length === 0) return { ok: false, error: 'הקובץ אינו תקין' };

  const maxBytes = allowPdf ? DOCUMENT_MAX_BYTES : IMAGE_MAX_BYTES;
  if (bytes.length > maxBytes) {
    return {
      ok: false,
      error: `הקובץ גדול מדי (מקסימום ${Math.round(maxBytes / (1024 * 1024))}MB)`,
    };
  }

  const mime = detectType(bytes);
  if (!mime) {
    return { ok: false, error: 'סוג קובץ לא נתמך. ניתן להעלות JPG, PNG, WEBP או PDF בלבד' };
  }
  if (!allowPdf && mime === 'application/pdf') {
    return { ok: false, error: 'ניתן להעלות תמונת JPG, PNG או WEBP בלבד' };
  }
  return { ok: true, mime, base64, bytes };
}

/** Profile pictures: JPG / PNG / WEBP up to 3MB. */
export function validateImage(value: unknown): FileCheck | FileRejection {
  return validate(value, false);
}

/** Teacher certificates: JPG / PNG / WEBP / PDF up to 5MB. */
export function validateDocument(value: unknown): FileCheck | FileRejection {
  return validate(value, true);
}