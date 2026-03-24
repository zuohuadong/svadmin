/**
 * Session token management — generate, validate, and parse session tokens.
 *
 * Uses HMAC-SHA256 signatures for stateless session cookies.
 * The token format is: `base64url(payload).base64url(signature)`
 *
 * @example
 * ```ts
 * import { createSessionManager } from '@svadmin/auth-utils/session';
 *
 * const sessions = createSessionManager('your-secret-key');
 *
 * // Generate a session token
 * const token = await sessions.create({ userId: '123', role: 'admin' });
 *
 * // Validate and parse
 * const payload = await sessions.verify(token);
 * if (payload) console.log(payload.userId);
 * ```
 */

// ─── Types ────────────────────────────────────────────────────

export interface SessionPayload {
  /** User ID */
  sub: string;
  /** Issued at (unix seconds) */
  iat: number;
  /** Expiration (unix seconds) */
  exp: number;
  /** Custom data */
  [key: string]: unknown;
}

export interface SessionOptions {
  /** Session TTL in seconds. Default: 86400 (24 hours) */
  ttl?: number;
  /** Cookie name. Default: 'svadmin_session' */
  cookieName?: string;
}

export interface SessionManager {
  /** Create a new signed session token */
  create: (data: Record<string, unknown>) => Promise<string>;
  /** Verify and decode a session token. Returns null if invalid/expired. */
  verify: (token: string) => Promise<SessionPayload | null>;
  /** Generate a random session ID (32 bytes, hex) */
  generateId: () => string;
}

// ─── Base64url helpers ────────────────────────────────────────

function base64urlEncode(data: string): string {
  return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(str: string): string {
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
  return atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
}

// ─── Factory ──────────────────────────────────────────────────

/**
 * Create a session manager with HMAC-SHA256 signed tokens.
 *
 * @param secret - Secret key for signing (minimum 32 characters recommended)
 * @param options - Configuration options
 */
export function createSessionManager(
  secret: string,
  options?: SessionOptions,
): SessionManager {
  const ttl = options?.ttl ?? 86400;
  let cryptoKey: CryptoKey | null = null;

  async function getKey(): Promise<CryptoKey> {
    if (cryptoKey) return cryptoKey;
    cryptoKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify'],
    );
    return cryptoKey;
  }

  function toHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer), b => b.toString(16).padStart(2, '0')).join('');
  }

  async function sign(payload: string): Promise<string> {
    const key = await getKey();
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    return toHex(sig);
  }

  return {
    async create(data: Record<string, unknown>): Promise<string> {
      const now = Math.floor(Date.now() / 1000);
      const payload: SessionPayload = {
        sub: (data.userId as string) ?? (data.sub as string) ?? '',
        iat: now,
        exp: now + ttl,
        ...data,
      };
      const payloadStr = base64urlEncode(JSON.stringify(payload));
      const signature = await sign(payloadStr);
      return `${payloadStr}.${signature}`;
    },

    async verify(token: string): Promise<SessionPayload | null> {
      const parts = token.split('.');
      if (parts.length !== 2) return null;

      const [payloadStr, signature] = parts;

      // Verify signature
      const expectedSig = await sign(payloadStr);
      if (signature !== expectedSig) return null;

      // Decode and check expiry
      try {
        const payload = JSON.parse(base64urlDecode(payloadStr)) as SessionPayload;
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) return null;
        return payload;
      } catch {
        return null;
      }
    },

    generateId(): string {
      const bytes = crypto.getRandomValues(new Uint8Array(32));
      return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    },
  };
}
