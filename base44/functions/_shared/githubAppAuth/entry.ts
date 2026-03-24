/**
 * githubAppAuth.ts
 *
 * Shared helpers for GitHub App authentication.
 *
 * Implements:
 * - createAppJWT(appId, privateKey)      — creates a short-lived JWT for app-level API calls
 * - getInstallationAccessToken(installationId) — exchanges that JWT for an installation access token
 *
 * Environment variables:
 * - GITHUB_APP_ID           — numeric GitHub App ID
 * - GITHUB_APP_PRIVATE_KEY  — PEM-encoded RSA private key (PKCS#1 or PKCS#8)
 *
 * No third-party dependencies — uses Deno's built-in Web Crypto API.
 */

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Concatenate multiple Uint8Arrays into one. */
function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

/**
 * DER-encode a tag + length + content triple.
 * Supports lengths up to 65 535 bytes.
 */
function derEncode(tag: number, content: Uint8Array): Uint8Array {
  const len = content.length;
  let lenBytes: Uint8Array;
  if (len < 128) {
    lenBytes = new Uint8Array([len]);
  } else if (len < 256) {
    lenBytes = new Uint8Array([0x81, len]);
  } else {
    lenBytes = new Uint8Array([0x82, (len >> 8) & 0xff, len & 0xff]);
  }
  return concatBytes(new Uint8Array([tag]), lenBytes, content);
}

/**
 * Wrap a PKCS#1 RSA private key in a PKCS#8 envelope so it can be imported
 * via Web Crypto's 'pkcs8' format.
 *
 * PKCS#8 PrivateKeyInfo structure:
 *   SEQUENCE {
 *     INTEGER 0                        -- version
 *     SEQUENCE { OID rsaEncryption, NULL }  -- algorithm
 *     OCTET STRING { <PKCS#1 bytes> }  -- privateKey
 *   }
 */
function wrapRsaKeyAsPkcs8(pkcs1: Uint8Array): Uint8Array {
  // AlgorithmIdentifier: OID 1.2.840.113549.1.1.1 (rsaEncryption) + NULL
  const oid = new Uint8Array([0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01]);
  const algId = derEncode(0x30, concatBytes(oid, new Uint8Array([0x05, 0x00])));

  const version = new Uint8Array([0x02, 0x01, 0x00]); // INTEGER 0
  const keyOctet = derEncode(0x04, pkcs1);            // OCTET STRING

  return derEncode(0x30, concatBytes(version, algId, keyOctet));
}

/**
 * Base64url-encode bytes (Uint8Array) or a UTF-8 string.
 * Chunks input to avoid call-stack overflow on large keys.
 */
function base64url(data: Uint8Array | string): string {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Import a PEM-encoded RSA private key.
 * Supports both PKCS#1 (-----BEGIN RSA PRIVATE KEY-----) and
 * PKCS#8 (-----BEGIN PRIVATE KEY-----) formats.
 * Also handles environment variables where newlines are stored as literal \n.
 */
async function importPrivateKey(pem: string): Promise<CryptoKey> {
  // Normalize literal \n sequences that may appear in env var values
  const normalized = pem.replace(/\\n/g, '\n').trim();

  const isPkcs1 = normalized.includes('BEGIN RSA PRIVATE KEY');
  const isPkcs8 = normalized.includes('BEGIN PRIVATE KEY');

  if (!isPkcs1 && !isPkcs8) {
    throw new Error(
      'GITHUB_APP_PRIVATE_KEY must be in PEM format (PKCS#1 "RSA PRIVATE KEY" or PKCS#8 "PRIVATE KEY")',
    );
  }

  const b64 = normalized
    .replace(/-----BEGIN (RSA )?PRIVATE KEY-----/g, '')
    .replace(/-----END (RSA )?PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '');

  const keyBytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const pkcs8Bytes = isPkcs1 ? wrapRsaKeyAsPkcs8(keyBytes) : keyBytes;

  return crypto.subtle.importKey(
    'pkcs8',
    pkcs8Bytes,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a short-lived RS256 JWT for authenticating as a GitHub App.
 * Valid for 10 minutes (GitHub maximum). Issued 60 s in the past to allow
 * for minor clock skew between servers.
 *
 * @param appId      The numeric GitHub App ID (string or number).
 * @param privateKey PEM-encoded RSA private key (PKCS#1 or PKCS#8).
 */
export async function createAppJWT(appId: string | number, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: String(appId),
    iat: now - 60,
    exp: now + 600,
  };

  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await importPrivateKey(privateKey);
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(signingInput),
  );

  const sigB64 = base64url(new Uint8Array(signature));
  return `${signingInput}.${sigB64}`;
}

/**
 * Exchange a GitHub App JWT for an installation access token.
 * Tokens are valid for 1 hour.
 *
 * Reads GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY from environment variables.
 *
 * @param installationId The GitHub App installation ID.
 * @returns The installation access token string.
 */
export async function getInstallationAccessToken(installationId: string | number): Promise<string> {
  const appId = Deno.env.get('GITHUB_APP_ID');
  const privateKey = Deno.env.get('GITHUB_APP_PRIVATE_KEY');

  if (!appId || !privateKey) {
    throw new Error(
      'GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY environment variables must be set',
    );
  }

  const jwt = await createAppJWT(appId, privateKey);

  const res = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to get installation access token for installation ${installationId}: ${err.message ?? `HTTP ${res.status}`}`,
    );
  }

  const data = await res.json();
  return data.token as string;
}

/**
 * Return true if the GitHub App environment variables are configured.
 * Used to decide whether to use App auth or fall back to a connector token.
 */
export function isGithubAppConfigured(): boolean {
  return !!(Deno.env.get('GITHUB_APP_ID') && Deno.env.get('GITHUB_APP_PRIVATE_KEY'));
}
