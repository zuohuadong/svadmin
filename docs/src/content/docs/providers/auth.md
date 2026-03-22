---
title: Auth Provider
description: Authentication, identity management, and permissions
---

svadmin provides a complete authentication system through `AuthProvider` and 9 reactive hooks.

## AuthProvider Interface

```typescript
interface AuthProvider {
  login: (params: Record<string, unknown>) => Promise<AuthActionResult>;
  logout: (params?: Record<string, unknown>) => Promise<AuthActionResult>;
  check: (params?: Record<string, unknown>) => Promise<CheckResult>;
  getIdentity: () => Promise<Identity | null>;
  getPermissions?: (params?: Record<string, unknown>) => Promise<unknown>;
  register?: (params: Record<string, unknown>) => Promise<AuthActionResult>;
  forgotPassword?: (params: Record<string, unknown>) => Promise<AuthActionResult>;
  updatePassword?: (params: Record<string, unknown>) => Promise<AuthActionResult>;
  onError?: (error: unknown) => Promise<{ redirectTo?: string; logout?: boolean }>;
}
```

## Auth Hooks

| Hook | Purpose |
|------|---------|
| `useLogin()` | Login mutation |
| `useLogout()` | Logout mutation |
| `useRegister()` | Registration mutation |
| `useForgotPassword()` | Password reset request |
| `useUpdatePassword()` | Password update |
| `useGetIdentity()` | Get current user info |
| `useIsAuthenticated()` | Check auth status |
| `useOnError()` | Handle API errors (401→logout) |
| `usePermissions()` | Get user permissions |

### Usage

```typescript
const { mutate: login, isLoading } = useLogin();
await login({ email: 'user@example.com', password: 'secret' });
```

## Auth Pages

Built-in glassmorphism auth pages included:
- `LoginPage` — Email/password login
- `RegisterPage` — User registration
- `ForgotPasswordPage` — Password reset request
- `UpdatePasswordPage` — Set new password

Routes: `/#/login`, `/#/register`, `/#/forgot-password`, `/#/update-password`

## `<Authenticated>` Component

```svelte
<Authenticated>
  {#snippet children()}<p>Protected content</p>{/snippet}
  {#snippet fallback()}<p>Please log in</p>{/snippet}
  {#snippet loading()}<p>Checking auth...</p>{/snippet}
</Authenticated>
```

## Mock AuthProvider

```typescript
export const mockAuthProvider: AuthProvider = {
  login: async ({ email, password }) => {
    if (password === 'demo') {
      localStorage.setItem('auth', JSON.stringify({ email }));
      return { success: true, redirectTo: '/' };
    }
    return { success: false, error: { message: 'Use password "demo"' } };
  },
  logout: async () => {
    localStorage.removeItem('auth');
    return { success: true, redirectTo: '/login' };
  },
  check: async () => ({ authenticated: !!localStorage.getItem('auth') }),
  getIdentity: async () => {
    const auth = localStorage.getItem('auth');
    return auth ? { id: '1', name: 'Admin' } : null;
  },
};
```
