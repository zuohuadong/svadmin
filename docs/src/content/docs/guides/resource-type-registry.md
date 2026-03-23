---
title: Resource Type Registry
description: Compile-time type safety for resource names and data types
---

The **Resource Type Registry** is svadmin's mechanism for compile-time resource name checking and automatic data type inference. By extending a single TypeScript interface, you get typo-proof resource names and fully-typed data across all hooks.

## Quick Setup

### 1. Define your data types

```typescript
// types.ts
export interface Post {
  id: number;
  title: string;
  body: string;
  status: 'draft' | 'published';
}

export interface User {
  id: number;
  name: string;
  email: string;
}
```

### 2. Register in ResourceTypeMap

```typescript
// resource-types.d.ts (or any .ts file)
import type { Post, User } from './types';

declare module '@svadmin/core' {
  interface ResourceTypeMap {
    posts: Post;
    users: User;
  }
}
```

### 3. Enjoy type safety

```typescript
// ✅ Compiles — 'posts' is a KnownResources key
useList({ resource: 'posts' });

// ❌ Compile error — typo caught!
useList({ resource: 'postz' });

// ✅ Data is automatically Post[]
const query = useList({ resource: 'posts' });
query.data?.data[0].title; // string ✓
```

## How It Works

svadmin uses TypeScript [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) on an empty interface:

```typescript
// @svadmin/core exports:
export interface ResourceTypeMap {}                        // empty — users extend it
export type KnownResources = keyof ResourceTypeMap extends never
  ? string                                                 // no registrations → accept any string
  : Extract<keyof ResourceTypeMap, string>;                // registrations exist → constrain
export type InferData<R extends string> = R extends keyof ResourceTypeMap
  ? ResourceTypeMap[R]
  : Record<string, unknown>;                               // unknown resource → base type
```

**Key design**: When `ResourceTypeMap` is empty (no user registrations), `KnownResources` falls back to `string` — existing code without registration works unchanged.

## Utility Types

| Type | Purpose |
|------|---------|
| `ResourceTypeMap` | Extend to register resource → data type mappings |
| `KnownResources` | Union of registered resource names (falls back to `string`) |
| `InferData<R>` | Infer data type for resource `R` |
| `BaseRecord` | `Record<string, unknown>` — base for all data types |

## With Elysia (Auto-Registration)

The `@svadmin/elysia` package can auto-infer `ResourceTypeMap` from your Elysia backend:

```typescript
import type { InferResourceMap } from '@svadmin/elysia';
import type { App } from './server';

declare module '@svadmin/core' {
  interface ResourceTypeMap extends InferResourceMap<App> {}
}
```

No manual type registration needed — types are derived directly from your server routes.

## Best Practices

1. **Put registrations in a `.d.ts` file** — e.g. `resource-types.d.ts` at your project root
2. **Extend, don't replace** — always use `interface ResourceTypeMap { ... }`, never `type ResourceTypeMap =`
3. **One registration per project** — all resources go in a single `declare module` block
4. **Use with `InferData`** in custom hooks and components:

```typescript
function usePostList() {
  return useList<InferData<'posts'>>({ resource: 'posts' });
}
```
