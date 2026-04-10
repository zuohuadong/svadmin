---
title: Data Provider
description: Connect svadmin to any backend API
---

The `DataProvider` interface defines how svadmin talks to your backend. Implement it once, and all hooks and components work automatically.

## Interface

```typescript
import type { BaseRecord } from '@svadmin/core';

interface DataProvider {
  getList: <TData extends BaseRecord>(params: GetListParams) => Promise<GetListResult<TData>>;
  getOne: <TData extends BaseRecord>(params: GetOneParams) => Promise<GetOneResult<TData>>;
  create: <TData extends BaseRecord, TVariables>(params: CreateParams<TVariables>) => Promise<CreateResult<TData>>;
  update: <TData extends BaseRecord, TVariables>(params: UpdateParams<TVariables>) => Promise<UpdateResult<TData>>;
  deleteOne: <TData extends BaseRecord, TVariables>(params: DeleteParams<TVariables>) => Promise<DeleteResult<TData>>;
  getApiUrl: () => string;

  // Optional
  getMany?: <TData extends BaseRecord>(params: GetManyParams) => Promise<GetManyResult<TData>>;
  createMany?: <TData extends BaseRecord, TVariables>(params: CreateManyParams<TVariables>) => Promise<CreateManyResult<TData>>;
  updateMany?: <TData extends BaseRecord, TVariables>(params: UpdateManyParams<TVariables>) => Promise<UpdateManyResult<TData>>;
  deleteMany?: <TData extends BaseRecord, TVariables>(params: DeleteManyParams<TVariables>) => Promise<DeleteManyResult<TData>>;
  custom?: <TData, TVariables>(params: CustomParams<TVariables>) => Promise<CustomResult<TData>>;
}
```

> `BaseRecord = Record<string, unknown>` — all data types extend this base type.

## Built-in Providers

> Most svadmin data providers are powered by their corresponding `@refinedev/*` package via [`@svadmin/refine-adapter`](/providers/refine-adapter). You can also use the adapter directly to bridge any Refine provider that svadmin doesn't have a dedicated package for yet.

### Simple REST

```typescript
import { createSimpleRestProvider } from '@svadmin/simple-rest';
const dataProvider = createSimpleRestProvider('https://api.example.com');
```

Maps to: `GET /posts`, `GET /posts/1`, `POST /posts`, `PUT /posts/1`, `DELETE /posts/1`

### Supabase

```typescript
import { createSupabaseDataProvider } from '@svadmin/supabase';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);
const dataProvider = createSupabaseDataProvider(supabase);
```

### GraphQL

```typescript
import { createGraphQLDataProvider } from '@svadmin/graphql';
const dataProvider = createGraphQLDataProvider('https://api.example.com/graphql');
```

### Appwrite

```typescript
import { Client, Databases } from 'appwrite';
import { createAppwriteDataProvider } from '@svadmin/appwrite';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('PROJECT_ID');
const databases = new Databases(client);
const dataProvider = createAppwriteDataProvider({ databases, databaseId: 'main' });
```

Supports sorters, 10+ filter operators, and bulk operations (`getMany`, `deleteMany`).

### PocketBase

```typescript
import PocketBase from 'pocketbase';
import { createPocketBaseDataProvider } from '@svadmin/pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');
const dataProvider = createPocketBaseDataProvider({ pb });
```

Supports sorters, filters, and bulk operations. PocketBase also provides `createPocketBaseAuthProvider` and `createPocketBaseLiveProvider`.

### Elysia (Type-Safe)

```typescript
import { createElysiaDataProvider } from '@svadmin/elysia';
import type { InferResourceMap } from '@svadmin/elysia';
import type { App } from './server';  // your Elysia app type

// Auto-infer resource types from Elysia routes
declare module '@svadmin/core' {
  interface ResourceTypeMap extends InferResourceMap<App> {}
}

const dataProvider = createElysiaDataProvider<App>('http://localhost:3000');
```

The `@svadmin/elysia` package provides end-to-end type safety by inferring `ResourceTypeMap` directly from your Elysia backend routes.

### Drizzle ORM

```typescript
import { createDrizzleDataProvider } from '@svadmin/drizzle';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import * as schema from './schema';

const db = drizzle(new Database('./app.db'), { schema });
const dataProvider = await createDrizzleDataProvider({ connection: db, schema });
```

Direct database access via Drizzle ORM — supports SQLite, PostgreSQL, MySQL, and Cloudflare D1. Includes built-in soft delete, relations, transactions, aggregations, and security guard. See the [Drizzle ORM guide](/providers/drizzle) for full documentation.

## Multiple Data Providers

Use different backends for different resources:

```typescript
import { setDataProvider } from '@svadmin/core';

setDataProvider({
  default: restProvider,
  cms: graphqlProvider,
});
```

Tag resources with their provider via `meta.dataProviderName`:

```typescript
const resources = [
  { name: 'posts', label: 'Posts', meta: { dataProviderName: 'cms' }, fields: [...] },
  { name: 'users', label: 'Users', fields: [...] },  // uses 'default'
];
```

## Filter Operators

svadmin supports 16 filter operators:

| Operator | Description |
|----------|-------------|
| `eq`, `ne` | Equal, not equal |
| `lt`, `gt`, `lte`, `gte` | Comparisons |
| `contains`, `ncontains` | String contains / not contains |
| `startswith`, `endswith` | String prefix / suffix |
| `in`, `nin` | In array / not in array |
| `null`, `nnull` | Is null / not null |
| `between`, `nbetween` | Range / not in range |

### Logical Filters

Combine filters with `or` / `and`:

```typescript
const filters: LogicalFilter = {
  operator: 'or',
  value: [
    { field: 'status', operator: 'eq', value: 'published' },
    { field: 'status', operator: 'eq', value: 'draft' },
  ],
};
```

## HttpError

Data providers should throw `HttpError` for structured error handling:

```typescript
import { HttpError } from '@svadmin/core';

throw new HttpError('Validation Failed', 422, {
  email: ['Email is required'],
  name: 'Name is too short',
});
```

`useForm` automatically maps `HttpError.errors` to form field errors.
