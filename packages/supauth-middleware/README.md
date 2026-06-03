# @svadmin/supauth-middleware

Supauth/OIDC identity, RBAC and audit context middleware for svadmin server-side apps.

## Features

- JWT verification (RS256 via JWKS, HS256 symmetric signing)
- OIDC Discovery auto-resolution
- Claims-to-user mapping with GoTrue `app_metadata` support
- Role-based access control (RBAC) with hierarchical permissions
- Audit event generation

## Install

```bash
bun add @svadmin/supauth-middleware
```

## Usage

```ts
import { SupauthAuthMiddleware } from '@svadmin/supauth-middleware';

const auth = new SupauthAuthMiddleware({
  issuer: 'https://auth.example.com',
  clientId: 'my-app',
  callbackUrl: 'https://app.example.com/auth/callback',
  jwtSecret: process.env.JWT_SECRET, // for HS256
});

// Express / Bun.serve middleware
const user = await auth.authenticate(request);
auth.requirePermission('projects:write')(user);
auth.requireMinRole('manager')(user);
```

## RBAC

```ts
import { hasPermission, hasMinRole, mapClaimsToUser } from '@svadmin/supauth-middleware';

const user = mapClaimsToUser(jwtClaims);
hasPermission(user, 'code:execute'); // boolean
hasMinRole(user, 'admin'); // boolean
```
