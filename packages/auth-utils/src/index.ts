/**
 * @svadmin/auth-utils — Zero-dependency auth utility functions.
 *
 * Provides password hashing, session management, and TOTP for MFA.
 * Works on any runtime (Bun, Node.js, Deno, Cloudflare Workers) via Web Crypto API.
 *
 * @example
 * ```ts
 * import { hashPassword, verifyPassword, createSessionManager, generateSecret, verifyTOTP } from '@svadmin/auth-utils';
 * ```
 */

// Password
export { hashPassword, verifyPassword } from './password';
export type { PasswordOptions } from './password';

// Session
export { createSessionManager } from './session';
export type { SessionManager, SessionPayload, SessionOptions } from './session';

// TOTP
export { generateSecret, generateTOTP, verifyTOTP, generateQRUri } from './totp';
export type { TOTPOptions } from './totp';
