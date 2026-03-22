---
title: Auth Hooks
description: Reactive authentication hooks
---

All auth hooks use TanStack Query mutations/queries for automatic loading states and error handling.

## Hooks Reference

### `useLogin()`

```typescript
const { mutate, isPending } = useLogin();
mutate({ email: 'admin@example.com', password: 'secret' });
```

### `useLogout()`

```typescript
const { mutate } = useLogout();
mutate(); // Redirects to /login
```

### `useGetIdentity()`

```typescript
const query = useGetIdentity();
// query.data → { id: '1', name: 'Admin', avatar: '...' } | null
```

### `useIsAuthenticated()`

```typescript
const { isAuthenticated, isLoading } = useIsAuthenticated();
```

### `usePermissions<T>()`

```typescript
const { data } = usePermissions<string[]>();
// data → ['admin', 'editor']
```

### `useOnError()`

```typescript
const { mutate } = useOnError();
mutate(error); // Calls authProvider.onError → may logout or redirect
```

### `useRegister()`, `useForgotPassword()`, `useUpdatePassword()`

Same mutation pattern as `useLogin()`.
