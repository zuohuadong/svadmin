/**
 * Password hashing and verification utilities.
 *
 * Uses Bun's native `Bun.password` API when available (Argon2id by default),
 * with a Web Crypto API fallback using PBKDF2-SHA256 for non-Bun runtimes.
 *
 * @example
 * ```ts
 * import { hashPassword, verifyPassword } from '@svadmin/auth-utils/password';
 *
 * const hash = await hashPassword('my-password');
 * const valid = await verifyPassword('my-password', hash);
 * ```
 */

// ─── Types ────────────────────────────────────────────────────

export interface PasswordOptions {
  /**
   * Algorithm to use. Default: 'auto' (uses Bun.password if available, else PBKDF2).
   * - 'argon2id' — requires Bun runtime
   * - 'bcrypt' — requires Bun runtime
   * - 'pbkdf2' — Web Crypto API, works everywhere
   * - 'auto' — best available
   */
  algorithm?: 'argon2id' | 'bcrypt' | 'pbkdf2' | 'auto';
}

// ─── Bun detection ────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isBun = typeof (globalThis as any).Bun !== 'undefined';

// ─── PBKDF2 fallback (Web Crypto API) ─────────────────────────

const PBKDF2_ITERATIONS = 310_000; // OWASP recommended
const PBKDF2_SALT_LENGTH = 32;
const PBKDF2_KEY_LENGTH = 64;

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), b => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

async function pbkdf2Hash(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(PBKDF2_SALT_LENGTH));
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as unknown as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    PBKDF2_KEY_LENGTH * 8,
  );
  return `pbkdf2:${PBKDF2_ITERATIONS}:${toHex(salt.buffer)}:${toHex(derived)}`;
}

async function pbkdf2Verify(password: string, stored: string): Promise<boolean> {
  const [, iterStr, saltHex, hashHex] = stored.split(':');
  const iterations = parseInt(iterStr, 10);
  const salt = fromHex(saltHex);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as unknown as BufferSource, iterations, hash: 'SHA-256' },
    key,
    PBKDF2_KEY_LENGTH * 8,
  );
  return toHex(derived) === hashHex;
}

// ─── Public API ───────────────────────────────────────────────

/**
 * Hash a password using the best available algorithm.
 *
 * @returns A string containing the algorithm prefix + hash, safe to store in DB.
 */
export async function hashPassword(
  password: string,
  opts?: PasswordOptions,
): Promise<string> {
  const algo = opts?.algorithm ?? 'auto';

  if ((algo === 'auto' || algo === 'argon2id' || algo === 'bcrypt') && isBun) {
    // Use Bun's native password API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const BunPassword = (globalThis as any).Bun as { password: { hash: (p: string, opts?: { algorithm: string }) => Promise<string> } };
    const bunAlgo = algo === 'auto' ? 'argon2id' : algo;
    return BunPassword.password.hash(password, { algorithm: bunAlgo });
  }

  // Fallback to PBKDF2
  return pbkdf2Hash(password);
}

/**
 * Verify a password against a stored hash.
 *
 * @returns `true` if the password matches, `false` otherwise.
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  // Auto-detect algorithm from hash format
  if (hash.startsWith('pbkdf2:')) {
    return pbkdf2Verify(password, hash);
  }

  // Argon2 / bcrypt hashes — use Bun.password.verify
  if (isBun) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const BunPassword = (globalThis as any).Bun as { password: { verify: (p: string, h: string) => Promise<boolean> } };
    return BunPassword.password.verify(password, hash);
  }

  throw new Error(
    `[auth-utils] Cannot verify hash format "${hash.substring(0, 10)}...". ` +
    'Argon2/bcrypt hashes require the Bun runtime.',
  );
}
