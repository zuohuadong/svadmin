---
title: 数据 Provider
description: 将 svadmin 连接到任意后端 API
---

`DataProvider` 接口定义了 svadmin 与后端通信的方式。只需实现一次，所有 Hook 和组件就能自动工作。

## 接口

```typescript
import type { BaseRecord } from '@svadmin/core';

interface DataProvider {
  getList: <TData extends BaseRecord>(params: GetListParams) => Promise<GetListResult<TData>>;
  getOne: <TData extends BaseRecord>(params: GetOneParams) => Promise<GetOneResult<TData>>;
  create: <TData extends BaseRecord, TVariables>(params: CreateParams<TVariables>) => Promise<CreateResult<TData>>;
  update: <TData extends BaseRecord, TVariables>(params: UpdateParams<TVariables>) => Promise<UpdateResult<TData>>;
  deleteOne: <TData extends BaseRecord, TVariables>(params: DeleteParams<TVariables>) => Promise<DeleteResult<TData>>;
  getApiUrl: () => string;

  // 可选
  getMany?: <TData extends BaseRecord>(params: GetManyParams) => Promise<GetManyResult<TData>>;
  createMany?: <TData extends BaseRecord, TVariables>(params: CreateManyParams<TVariables>) => Promise<CreateManyResult<TData>>;
  updateMany?: <TData extends BaseRecord, TVariables>(params: UpdateManyParams<TVariables>) => Promise<UpdateManyResult<TData>>;
  deleteMany?: <TData extends BaseRecord, TVariables>(params: DeleteManyParams<TVariables>) => Promise<DeleteManyResult<TData>>;
  custom?: <TData, TVariables>(params: CustomParams<TVariables>) => Promise<CustomResult<TData>>;
}
```

> `BaseRecord = Record<string, unknown>` — 所有数据类型都继承自此基础类型。

## 内置 Provider

> 大部分 svadmin 数据源通过 [`@svadmin/refine-adapter`](/zh-cn/providers/refine-adapter) 桥接对应的 `@refinedev/*` 包。你也可以直接使用该适配器来桥接 svadmin 尚未提供专用包的 Refine 数据源。

### Simple REST

```typescript
import { createSimpleRestProvider } from '@svadmin/simple-rest';
const dataProvider = createSimpleRestProvider('https://api.example.com');
```

映射为：`GET /posts`、`GET /posts/1`、`POST /posts`、`PUT /posts/1`、`DELETE /posts/1`

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

支持排序、10+ 过滤操作符和批量操作（`getMany`、`deleteMany`）。

### PocketBase

```typescript
import PocketBase from 'pocketbase';
import { createPocketBaseDataProvider } from '@svadmin/pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');
const dataProvider = createPocketBaseDataProvider({ pb });
```

支持排序、过滤和批量操作。PocketBase 还提供 `createPocketBaseAuthProvider` 和 `createPocketBaseLiveProvider`。

### Elysia（类型安全）

```typescript
import { createElysiaDataProvider } from '@svadmin/elysia';
import type { InferResourceMap } from '@svadmin/elysia';
import type { App } from './server';  // 你的 Elysia 应用类型

// 从 Elysia 路由自动推断资源类型
declare module '@svadmin/core' {
  interface ResourceTypeMap extends InferResourceMap<App> {}
}

const dataProvider = createElysiaDataProvider<App>('http://localhost:3000');
```

`@svadmin/elysia` 包通过从 Elysia 后端路由直接推断 `ResourceTypeMap` 实现端到端类型安全。

### Drizzle ORM

```typescript
import { createDrizzleDataProvider } from '@svadmin/drizzle';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import * as schema from './schema';

const db = drizzle(new Database('./app.db'), { schema });
const dataProvider = await createDrizzleDataProvider({ connection: db, schema });
```

通过 Drizzle ORM 直接访问数据库 — 支持 SQLite、PostgreSQL、MySQL 和 Cloudflare D1。内置软删除、关联查询、事务、聚合查询和安全控制。详见 [Drizzle ORM 指南](/zh-cn/providers/drizzle)。

## 多数据 Provider

为不同资源使用不同后端：

```typescript
import { setDataProvider } from '@svadmin/core';

setDataProvider({
  default: restProvider,
  cms: graphqlProvider,
});
```

通过 `meta.dataProviderName` 标记资源的 Provider：

```typescript
const resources = [
  { name: 'posts', label: '文章', meta: { dataProviderName: 'cms' }, fields: [...] },
  { name: 'users', label: '用户', fields: [...] },  // 使用 'default'
];
```

## 过滤操作符

svadmin 支持 16 种过滤操作符：

| 操作符 | 说明 |
|--------|------|
| `eq`、`ne` | 等于、不等于 |
| `lt`、`gt`、`lte`、`gte` | 比较运算 |
| `contains`、`ncontains` | 包含 / 不包含 |
| `startswith`、`endswith` | 前缀 / 后缀匹配 |
| `in`、`nin` | 在数组中 / 不在数组中 |
| `null`、`nnull` | 为空 / 不为空 |
| `between`、`nbetween` | 范围内 / 范围外 |

### 逻辑过滤器

用 `or` / `and` 组合过滤器：

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

数据 Provider 应抛出 `HttpError` 以实现结构化错误处理：

```typescript
import { HttpError } from '@svadmin/core';

throw new HttpError('验证失败', 422, {
  email: ['邮箱为必填项'],
  name: '名称太短',
});
```

`useForm` 会自动将 `HttpError.errors` 映射到表单字段错误。
