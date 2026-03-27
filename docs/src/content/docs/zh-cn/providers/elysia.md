---
title: Elysia 数据 Provider
description: 面向 Elysia 后端的类型安全数据 Provider
---

`@svadmin/elysia` 包提供了连接 [Elysia](https://elysiajs.com/) 后端的 DataProvider，遵循 CRUD 约定，并可通过 Eden Treaty 实现端到端类型推断。

## 安装

```bash
bun add @svadmin/elysia
```

## 基本用法

```typescript
import { createElysiaDataProvider } from '@svadmin/elysia';

const dataProvider = createElysiaDataProvider({
  apiUrl: 'http://localhost:3000',
});
```

## 带认证头

```typescript
const dataProvider = createElysiaDataProvider({
  apiUrl: 'http://localhost:3000',
  headers: () => ({
    Authorization: `Bearer ${getToken()}`,
  }),
});
```

## 预期后端路由

Provider 期望标准的 RESTful 路由：

| 操作 | 方法 | 路由 | 请求 | 响应 |
|------|------|------|------|------|
| 列表 | `GET` | `/resource?_page=1&_limit=10` | 查询参数 | `{ items: T[], total: number }` / `{ data: T[], total: number }` / `T[]` |
| 获取单条 | `GET` | `/resource/:id` | — | `T` |
| 创建 | `POST` | `/resource` | JSON 请求体 | `T` |
| 更新 | `PATCH` | `/resource/:id` | JSON 请求体 | `T` |
| 删除 | `DELETE` | `/resource/:id` | — | `T` |

### 查询参数

| 参数 | 格式 | 示例 |
|------|------|------|
| 分页 | `_page`、`_limit` | `?_page=1&_limit=10` |
| 排序 | `_sort`、`_order` | `?_sort=name&_order=asc` |
| 过滤 | `字段_操作符` | `?status_eq=active&name_contains=foo` |

### 过滤操作符

过滤器以 `字段_操作符=值` 格式作为查询参数追加：

```
?status_eq=active        → status = 'active'
?price_gte=100           → price >= 100
?name_contains=widget    → name LIKE '%widget%'
?category_in=1,2,3       → category IN (1, 2, 3)
```

## 端到端类型安全

`@svadmin/elysia` 的主要优势是从 Elysia 服务端自动推断 `ResourceTypeMap`：

### 服务端

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

### 客户端

```typescript
// resource-types.d.ts
import type { InferResourceMap } from '@svadmin/elysia';
import type { App } from './server';

declare module '@svadmin/core' {
  interface ResourceTypeMap extends InferResourceMap<App> {}
}
```

现在所有 Hook 自动知道你的资源名称和数据结构：

```typescript
// 资源名称在编译时受约束
useList({ resource: 'posts' });   // ✅
useList({ resource: 'postz' });   // ❌ TypeScript 错误

// 数据类型自动推断
const query = useOne({ resource: 'posts', id: 1 });
query.data?.data.title; // string ✓ — 无需手动类型标注
```

## 配置项参考

```typescript
interface ElysiaDataProviderOptions {
  /** 基础 API URL，例如 'http://localhost:3000' */
  apiUrl: string;
  /** 静态请求头或返回请求头的函数 */
  headers?: Record<string, string> | (() => Record<string, string>);
  /** 更新操作使用的 HTTP 方法 ('PATCH' 或 'PUT') @default 'PATCH' */
  updateMethod?: 'PATCH' | 'PUT';
  /** 是否在请求中包含凭证 (如 cookies) @default false */
  withCredentials?: boolean;
  /** 自定义资源名到 URL 段的映射 */
  resourceUrlMap?: Record<string, string>;
  /** 列表端点的自定义响应解析器 */
  parseListResponse?: <T>(json: unknown, resource: string) => { data: T[]; total: number };
}
```

## 批量操作

Provider 还支持批量操作：

- `getMany` — 通过 `?ids=1,2,3` 获取多条记录
- `createMany` — 顺序 POST 调用
- `updateMany` — 顺序 PATCH 调用
- `deleteMany` — 顺序 DELETE 调用
- `custom` — 任意 HTTP 请求

## 与 Simple REST 对比

| 特性 | `@svadmin/simple-rest` | `@svadmin/elysia` |
|------|----------------------|-------------------|
| 类型推断 | 手动 | 通过 Eden Treaty 自动推断 |
| 响应格式 | `{ data: T[] }` | `{ items: T[], total: number }` / `{ data: T[], total: number }` / `T[]` |
| 过滤格式 | 基于 Header | 查询参数 `字段_操作符` |
| 认证 | JWT/Cookie 内置 | 通过 `headers` 选项 |
| 依赖 | 零 | 零（Eden Treaty 可选） |
