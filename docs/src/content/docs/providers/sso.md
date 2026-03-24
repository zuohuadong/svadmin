---
title: SSO Provider
description: OIDC/OAuth2 SSO authentication — Okta, Azure AD, Cognito, Keycloak, Google
---

The `@svadmin/sso` package provides an AuthProvider that implements OIDC Authorization Code Flow with PKCE — no client secret needed in the browser.

## Installation

```bash
bun add @svadmin/sso
```

## Supported Identity Providers

Any OIDC-compliant provider works out of the box:

| Provider | Issuer URL Example |
|----------|------------------|
| Okta | `https://your-tenant.okta.com` |
| Azure AD / Entra ID | `https://login.microsoftonline.com/{tenant}/v2.0` |
| Amazon Cognito | `https://cognito-idp.{region}.amazonaws.com/{userPoolId}` |
| Keycloak | `https://your-keycloak.com/realms/{realm}` |
| Google | `https://accounts.google.com` |
| Auth0 | `https://your-tenant.auth0.com` |

## Basic Usage

```typescript
import { createSSOAuthProvider } from '@svadmin/sso';
import { setAuthProvider } from '@svadmin/core';

const authProvider = createSSOAuthProvider({
  issuer: 'https://your-tenant.okta.com',
  clientId: 'your-client-id',
  redirectUri: window.location.origin + '/callback',
});

setAuthProvider(authProvider);
```

## Configuration

```typescript
interface SSOConfig {
  /** OIDC Issuer URL */
  issuer: string;
  /** OAuth2 Client ID */
  clientId: string;
  /** Redirect URI after login */
  redirectUri: string;
  /** OAuth2 scopes. Default: ['openid', 'profile', 'email'] */
  scopes?: string[];
  /** Redirect after logout */
  postLogoutRedirectUri?: string;
  /** Token storage. Default: 'local' (localStorage) */
  storage?: 'local' | 'session' | TokenStorage;
  /** Custom identity mapper */
  mapIdentity?: (userinfo: Record<string, unknown>) => Identity;
  /** Auto-refresh tokens. Default: true */
  autoRefresh?: boolean;
  /** Seconds before expiry to refresh. Default: 60 */
  refreshBuffer?: number;
}
```

## Features

### PKCE Flow

All auth flows use the Authorization Code Flow with PKCE (Proof Key for Code Exchange) — the recommended approach for browser-based apps. No client secret is stored in the frontend.

### Auto Discovery

The provider automatically fetches your IdP's configuration from `/.well-known/openid-configuration`. No need to manually specify endpoints.

### Token Refresh

When `autoRefresh: true` (default), the provider schedules automatic token refresh before the access token expires. If refresh fails, the user is logged out.

### Custom Identity Mapping

```typescript
const authProvider = createSSOAuthProvider({
  issuer: 'https://your-tenant.okta.com',
  clientId: 'abc',
  redirectUri: '/callback',
  mapIdentity: (userinfo) => ({
    id: userinfo.sub as string,
    name: userinfo.preferred_username as string,
    avatar: userinfo.picture as string,
    email: userinfo.email as string,
  }),
});
```

### Permissions from ID Token

The provider automatically extracts `roles`, `groups`, or `permissions` claims from the ID token via `getPermissions()`.

```typescript
const permissions = await authProvider.getPermissions();
// → ['admin', 'editor'] (from ID token claims)
```

## Callback Page

Create a callback page at your `redirectUri` path:

```svelte
<!-- /callback/+page.svelte -->
<script>
  import { useIsAuthenticated } from '@svadmin/core';
  const { isLoading } = useIsAuthenticated();
</script>

{#if isLoading}
  <p>Authenticating...</p>
{/if}
```

The `check()` method automatically detects the callback URL, exchanges the authorization code for tokens, and cleans up the URL.
