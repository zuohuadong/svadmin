---
title: Auth Utilities
description: Password hashing, session management, and TOTP — zero dependencies
---

The `@svadmin/auth-utils` package provides server-side auth utilities using the Web Crypto API. Zero dependencies, works on Bun, Node.js, Deno, and Cloudflare Workers.

## Installation

```bash
bun add @svadmin/auth-utils
```

## Password Hashing

Uses Bun's native Argon2id when available, with PBKDF2-SHA256 fallback for other runtimes.

```typescript
import { hashPassword, verifyPassword } from '@svadmin/auth-utils';

// Hash a password
const hash = await hashPassword('my-password');
// → '$argon2id$v=19$m=...' (Bun) or 'pbkdf2:310000:salt:hash' (other runtimes)

// Verify
const valid = await verifyPassword('my-password', hash); // true
const wrong = await verifyPassword('wrong', hash);       // false
```

### Algorithm Selection

```typescript
// Force a specific algorithm
const hash = await hashPassword('password', { algorithm: 'argon2id' }); // Bun only
const hash = await hashPassword('password', { algorithm: 'bcrypt' });   // Bun only
const hash = await hashPassword('password', { algorithm: 'pbkdf2' });   // Works everywhere
const hash = await hashPassword('password', { algorithm: 'auto' });     // Best available (default)
```

## Session Management

HMAC-SHA256 signed session tokens — stateless, no database needed.

```typescript
import { createSessionManager } from '@svadmin/auth-utils';

const sessions = createSessionManager('your-secret-key-at-least-32-chars');

// Create a session token
const token = await sessions.create({ userId: '123', role: 'admin' });

// Verify and decode
const payload = await sessions.verify(token);
if (payload) {
  console.log(payload.sub);  // '123'
  console.log(payload.role); // 'admin'
  console.log(payload.exp);  // expiration timestamp
}

// Generate a random session ID
const id = sessions.generateId(); // 64-char hex string
```

### Options

```typescript
const sessions = createSessionManager('secret', {
  ttl: 3600,                  // 1 hour (default: 86400 = 24h)
  cookieName: 'my_session',   // default: 'svadmin_session'
});
```

### Using with Elysia

```typescript
import { Elysia } from 'elysia';
import { createSessionManager } from '@svadmin/auth-utils';

const sessions = createSessionManager(process.env.SESSION_SECRET!);

const app = new Elysia()
  .post('/login', async ({ body, set }) => {
    const user = await authenticate(body.email, body.password);
    const token = await sessions.create({ userId: user.id, role: user.role });
    set.headers['Set-Cookie'] = `session=${token}; HttpOnly; Path=/; SameSite=Lax`;
    return { success: true };
  })
  .get('/me', async ({ headers }) => {
    const token = headers.cookie?.split('session=')[1];
    const payload = token ? await sessions.verify(token) : null;
    if (!payload) throw new Error('Unauthorized');
    return { userId: payload.sub, role: payload.role };
  });
```

## TOTP (Multi-Factor Authentication)

RFC 6238 implementation — compatible with Google Authenticator, Authy, 1Password, etc.

```typescript
import { generateSecret, verifyTOTP, generateQRUri } from '@svadmin/auth-utils';

// 1. Generate a secret for the user (store in DB)
const secret = generateSecret();

// 2. Generate a QR code URI (show to user)
const qrUri = generateQRUri(secret, 'user@example.com', 'MyApp');
// → 'otpauth://totp/MyApp:user@example.com?secret=...&issuer=MyApp&...'

// 3. Verify the user's code
const valid = await verifyTOTP('123456', secret);
```

### TOTP Options

```typescript
const valid = await verifyTOTP('123456', secret, {
  digits: 6,          // Code length (default: 6)
  period: 30,         // Time step in seconds (default: 30)
  algorithm: 'SHA-1', // HMAC algorithm (default: 'SHA-1')
  window: 1,          // Check ±1 time steps (default: 1)
});
```

## Security Notes

- **Timing-safe comparison** — all token and TOTP verifications use constant-time comparison to prevent timing attacks
- **OWASP-recommended PBKDF2 iterations** — 310,000 iterations with SHA-256
- **Secure random generation** — uses `crypto.getRandomValues()` for all secrets and salts
