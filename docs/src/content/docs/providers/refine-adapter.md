---
title: Refine Adapter
description: Use any @refinedev/* data provider with svadmin
---

The `@svadmin/refine-adapter` package provides a universal bridge that wraps any official [Refine](https://refine.dev/) data provider so it can be used as a svadmin `DataProvider`.

## Why?

Refine has a mature ecosystem of 10+ production-grade data providers for backends like Supabase, Hasura, Strapi, Appwrite, GraphQL, REST, and more. Rather than re-implementing these integrations from scratch, svadmin can leverage them directly via this adapter.

## Installation

```bash
bun add @svadmin/refine-adapter @svadmin/core
# Plus the Refine provider you want:
bun add @refinedev/supabase
```

## Usage

```typescript
import { createRefineAdapter } from '@svadmin/refine-adapter';
import { dataProvider as createRefineSupabase } from '@refinedev/supabase';
import { createClient } from '@supabase/supabase-js';

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
const refineProvider = createRefineSupabase(supabaseClient);

// Wrap the Refine provider for svadmin
const dataProvider = createRefineAdapter(refineProvider);
```

Then pass `dataProvider` to `<AdminApp>` or `setDataProvider()`:

```svelte
<AdminApp {dataProvider} {resources} title="My Admin" />
```

## How It Works

Refine's `DataProvider` interface closely mirrors svadmin's `DataProvider`. The adapter:

1. Binds the 5 required methods (`getList`, `getOne`, `create`, `update`, `deleteOne`, `getApiUrl`).
2. Conditionally attaches optional methods (`getMany`, `createMany`, `updateMany`, `deleteMany`, `custom`) only if the underlying Refine provider implements them.

This means you get the full feature set of whatever Refine provider you choose — including its sorting, filtering, pagination, and bulk operation support.

## Built-in Usage

You don't need to use this package directly if you're already using one of the `@svadmin/*` provider packages. The following packages internally use `@svadmin/refine-adapter`:

| svadmin Package | Bridges | Refine Package |
|-----------------|---------|---------------|
| `@svadmin/supabase` | Supabase data/auth/live | `@refinedev/supabase` |
| `@svadmin/appwrite` | Appwrite data/auth/live | `@refinedev/appwrite` |
| `@svadmin/strapi` | Strapi CMS | `@refinedev/strapi-v4` |
| `@svadmin/hasura` | Hasura GraphQL | `@refinedev/hasura` |
| `@svadmin/graphql` | Generic GraphQL | `@refinedev/graphql` |
| `@svadmin/airtable` | Airtable | `@refinedev/airtable` |
| `@svadmin/medusa` | Medusa Commerce | `@refinedev/medusa` |
| `@svadmin/nestjs-query` | NestJS GraphQL | `@refinedev/nestjs-query` |
| `@svadmin/nestjsx-crud` | NestJS CRUD | `@refinedev/nestjsx-crud` |
| `@svadmin/simple-rest` | REST API | `@refinedev/simple-rest` |

## Direct Usage

Use `createRefineAdapter` directly when you want to use a Refine provider that svadmin doesn't have a dedicated package for yet:

```typescript
import { createRefineAdapter } from '@svadmin/refine-adapter';
import { dataProvider as createRefineDirectus } from '@tspvivek/refine-directus';

const directusProvider = createRefineDirectus('https://my-directus.example.com');
const dataProvider = createRefineAdapter(directusProvider);
```

## Providers Not Using This Adapter

Some svadmin providers connect directly without Refine, because they use non-Refine backends or offer deeper integration:

| Package | Reason |
|---------|--------|
| `@svadmin/drizzle` | Direct database access via Drizzle ORM (no HTTP API) |
| `@svadmin/elysia` | Type-safe via Eden Treaty, infers `ResourceTypeMap` from Elysia routes |
| `@svadmin/pocketbase` | Direct PocketBase SDK integration with auth + live |
| `@svadmin/firebase` | Direct Firebase SDK with Firestore serialization |
