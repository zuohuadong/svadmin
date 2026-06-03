/**
 * @svadmin/sso — OIDC/OAuth2 SSO AuthProvider plugin
 *
 * Usage:
 * ```ts
 * import { createSSOAuthProvider, createGoogleAuth } from '@svadmin/sso';
 * ```
 */

export { createSSOAuthProvider } from './auth-provider';
export type { SSOAuthProvider, SSOConfig, TokenStorage } from './auth-provider';

// Social login presets
export {
  createGoogleAuth,
  createMicrosoftAuth,
  createGitHubAuth,
  createGitLabAuth,
  createKeycloakAuth,
  createAuth0Auth,
  createSupauthAuth,
} from './presets';
export type { PresetOptions } from './presets';

// Auth helpers (PKCE, OIDC discovery, redirect validation)
export {
  generateState,
  generateVerifier,
  generateChallenge,
  isValidReturnTo,
  getForwardedOrigin,
  resolveAuthorizeUrl,
  resolveTokenUrl,
} from './auth-helpers';
