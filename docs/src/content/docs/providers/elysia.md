---
title: Elysia Data Provider
description: Type-safe data provider for Elysia backends
---

The `@svadmin/elysia` package provides a DataProvider that connects to [Elysia](https://elysiajs.com/) backends following CRUD conventions, with optional end-to-end type inference via Eden Treaty.

## Installation

```bash
bun add @svadmin/elysia
```

## Basic Usage

```typescript
import { createElysiaDataProvider } from '@svadmin/elysia';

const dataProvider = createElysiaDataProvider({
  apiUrl: 'http://localhost:3000',
});
```

## With Auth Headers

```typescript
const dataProvider = createElysiaDataProvider({
  apiUrl: 'http://localhost:3000',
  headers: () => ({
    Authorization: `Bearer ${getToken()}`,
  }),
});
```

## Expected Backend Routes

The provider expects standard RESTful routes:

| Operation | Method | Route | Request | Response |
|-----------|--------|-------|---------|----------|
| List | `GET` | `/resource?_page=1&_limit=10` | query params | `{ items: T[], total: number }` |
| Get one | `GET` | `/resource/:id` | — | `T` |
| Create | `POST` | `/resource` | JSON body | `T` |
| Update | `PATCH` | `/resource/:id` | JSON body | `T` |
| Delete | `DELETE` | `/resource/:id` | — | `T` |

### Query Parameters

| Param | Format | Example |
|-------|--------|---------|
| Pagination | `_page`, `_limit` | `?_page=1&_limit=10` |
| Sorting | `_sort`, `_order` | `?_sort=name&_order=asc` |
| Filtering | `field_operator` | `?status_eq=active&name_contains=foo` |

### Filter Operators

Filters are appended as query params using `field_operator=value` format:

```
?status_eq=active        → status = 'active'
?price_gte=100           → price >= 100
?name_contains=widget    → name LIKE '%widget%'
?category_in=1,2,3       → category IN (1, 2, 3)
```

## End-to-End Type Safety

The main advantage of `@svadmin/elysia` is auto-inferring `ResourceTypeMap` from your Elysia server:

### Server Side

```typescript
// server.ts
import { Elysia } from 'elysia';

const app = new Elysia()
  .get('/posts', () => db.posts.findMany())
  .get('/posts/:id', ({ params }) => db.posts.findUnique({ where: { id: params.id } }))
  .post('/posts', ({ body }) => db.posts.create({ data: body }))
  .patch('/posts/:id', ({ params, body }) => db.posts.update({ where: { id: params.id }, data: body }))
  .delete('/posts/:id', ({ params }) => db.posts.delete({ where: { id: params.id } }));

export type App = typeof app;
```

### Client Side

```typescript
// resource-types.d.ts
import type { InferResourceMap } from '@svadmin/elysia';
import type { App } from './server';

declare module '@svadmin/core' {
  interface ResourceTypeMap extends InferResourceMap<App> {}
}
```

Now all hooks automatically know your resource names and data shapes:

```typescript
// Resource name is constrained at compile time
useList({ resource: 'posts' });   // ✅
useList({ resource: 'postz' });   // ❌ TypeScript error

// Data types auto-inferred
const query = useOne({ resource: 'posts', id: 1 });
query.data?.data.title; // string ✓ — no manual type annotation needed
```

## Options Reference

```typescript
interface ElysiaDataProviderOptions {
  /** Base API URL, e.g. 'http://localhost:3000' */
  apiUrl: string;
  /** Static headers or a function returning headers */
  headers?: Record<string, string> | (() => Record<string, string>);
}
```

## Bulk Operations

The provider also supports batch operations:

- `getMany` — fetches multiple records by ID via `?ids=1,2,3`
- `createMany` — sequential POST calls
- `updateMany` — sequential PATCH calls
- `deleteMany` — sequential DELETE calls
- `custom` — arbitrary HTTP requests

## Comparison with Simple REST

| Feature | `@svadmin/simple-rest` | `@svadmin/elysia` |
|---------|----------------------|-------------------|
| Type inference | Manual | Auto via Eden Treaty |
| Response format | `{ data: T[] }` | `{ items: T[], total: number }` |
| Filter format | Header-based | Query param `field_operator` |
| Auth | JWT/Cookie built-in | Via `headers` option |
| Dependencies | Zero | Zero (Eden Treaty optional) |
