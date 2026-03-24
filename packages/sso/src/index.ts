/**
 * @svadmin/sso — OIDC/OAuth2 SSO AuthProvider plugin
 *
 * Usage:
 * ```ts
 * import { createSSOAuthProvider, createGoogleAuth } from '@svadmin/sso';
 * ```
 */

export { createSSOAuthProvider } from './auth-provider';
export type { SSOConfig, TokenStorage } from './auth-provider';

// Social login presets
export {
  createGoogleAuth,
  createMicrosoftAuth,
  createGitHubAuth,
  createGitLabAuth,
  createKeycloakAuth,
  createAuth0Auth,
} from './presets';
export type { PresetOptions } from './presets';
