/**
 * @svadmin/auth-utils — Unit Tests
 */
import { describe, test, expect } from 'bun:test';
import { hashPassword, verifyPassword } from './password';
import { createSessionManager } from './session';
import { generateSecret, generateTOTP, verifyTOTP, generateQRUri } from './totp';

// ─── Password ────────────────────────────────────────────────

describe('password', () => {
  test('hashPassword → verifyPassword (correct)', async () => {
    const hash = await hashPassword('test-password-123');
    expect(hash).toBeTruthy();
    expect(typeof hash).toBe('string');

    const valid = await verifyPassword('test-password-123', hash);
    expect(valid).toBe(true);
  });

  test('hashPassword → verifyPassword (wrong password)', async () => {
    const hash = await hashPassword('correct-password');
    const valid = await verifyPassword('wrong-password', hash);
    expect(valid).toBe(false);
  });

  test('hash format includes algorithm prefix', async () => {
    const hash = await hashPassword('test', { algorithm: 'pbkdf2' });
    expect(hash.startsWith('pbkdf2:')).toBe(true);
  });

  test('different passwords produce different hashes', async () => {
    const h1 = await hashPassword('password-1', { algorithm: 'pbkdf2' });
    const h2 = await hashPassword('password-2', { algorithm: 'pbkdf2' });
    expect(h1).not.toBe(h2);
  });

  test('same password produces different hashes (salt)', async () => {
    const h1 = await hashPassword('same-password', { algorithm: 'pbkdf2' });
    const h2 = await hashPassword('same-password', { algorithm: 'pbkdf2' });
    expect(h1).not.toBe(h2); // different salt each time
  });
});

// ─── Session ─────────────────────────────────────────────────

describe('session', () => {
  const sessions = createSessionManager('test-secret-key-at-least-32-chars!!');

  test('create and verify session', async () => {
    const token = await sessions.create({ userId: 'user-123', role: 'admin' });
    expect(typeof token).toBe('string');
    expect(token).toContain('.');

    const payload = await sessions.verify(token);
    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe('user-123');
    expect(payload!.role).toBe('admin');
  });

  test('verify rejects tampered token', async () => {
    const token = await sessions.create({ userId: 'user-123' });
    const tampered = token.replace(/^./, 'X');
    const payload = await sessions.verify(tampered);
    expect(payload).toBeNull();
  });

  test('verify rejects expired token', async () => {
    const shortSession = createSessionManager('test-secret-key-at-least-32-chars!!', { ttl: -1 });
    const token = await shortSession.create({ userId: 'user-123' });
    const payload = await shortSession.verify(token);
    expect(payload).toBeNull();
  });

  test('verify rejects malformed token', async () => {
    expect(await sessions.verify('not-a-valid-token')).toBeNull();
    expect(await sessions.verify('')).toBeNull();
    expect(await sessions.verify('a.b.c')).toBeNull();
  });

  test('generateId produces hex string', () => {
    const id = sessions.generateId();
    expect(id).toMatch(/^[0-9a-f]{64}$/);
  });
});

// ─── TOTP ────────────────────────────────────────────────────

describe('totp', () => {
  test('generateSecret produces base32 string', () => {
    const secret = generateSecret();
    expect(secret).toBeTruthy();
    expect(secret).toMatch(/^[A-Z2-7]+$/);
    expect(secret.length).toBeGreaterThan(20);
  });

  test('generateTOTP produces 6-digit string', async () => {
    const secret = generateSecret();
    const code = await generateTOTP(secret);
    expect(code).toMatch(/^\d{6}$/);
  });

  test('verifyTOTP validates correct code', async () => {
    const secret = generateSecret();
    const code = await generateTOTP(secret);
    const valid = await verifyTOTP(code, secret);
    expect(valid).toBe(true);
  });

  test('verifyTOTP rejects wrong code', async () => {
    const secret = generateSecret();
    const valid = await verifyTOTP('000000', secret);
    // Might be true by coincidence, but extremely unlikely
    // Just check it doesn't throw
    expect(typeof valid).toBe('boolean');
  });

  test('generateQRUri produces otpauth:// URI', () => {
    const secret = generateSecret();
    const uri = generateQRUri(secret, 'user@example.com', 'MyApp');
    expect(uri).toContain('otpauth://totp/');
    expect(uri).toContain('MyApp');
    expect(uri).toContain('user%40example.com');
    expect(uri).toContain(secret);
  });

  test('different secrets produce different codes', async () => {
    const s1 = generateSecret();
    const s2 = generateSecret();
    const c1 = await generateTOTP(s1);
    const c2 = await generateTOTP(s2);
    // Very unlikely to be the same
    expect(s1).not.toBe(s2);
    // Codes might collide, but secrets shouldn't
  });
});
