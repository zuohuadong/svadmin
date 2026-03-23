# svadmin 项目规范

## 类型安全架构（必须遵守）

### Resource Type Registry

所有 hook 的 `resource` 参数必须使用 `KnownResources` 类型（而非 `string`），以启用编译时资源名检查。

**核心类型定义**（位于 `packages/core/src/types.ts`）：

```typescript
export interface ResourceTypeMap {}  // 用户通过 declaration merging 扩展
export type KnownResources = keyof ResourceTypeMap extends never ? string : Extract<keyof ResourceTypeMap, string>
export type InferData<R extends string> = R extends keyof ResourceTypeMap ? ResourceTypeMap[R] : Record<string, unknown>
```

**规则**：
- 新增或修改 hook 时，`resource` 字段类型必须为 `KnownResources`，**禁止**回退为 `string`
- hook 的数据泛型使用 Refine 风格：`<TData extends BaseRecord = BaseRecord, TError = HttpError, TVariables = Record<string, unknown>>`
- `DataProvider` 接口的方法签名必须使用 `<TData extends BaseRecord, TVariables = unknown>`
- `BaseRecord = Record<string, unknown>` 是所有数据类型的基类
- 这三个类型（`ResourceTypeMap`, `KnownResources`, `InferData`）必须从 `@svadmin/core` 导出

### 模块化 Hook 文件结构

hooks 已拆分为以下模块，**禁止**合并回单文件：

| 文件 | 内容 |
|------|------|
| `query-hooks.svelte.ts` | `useList`, `useOne`, `useShow`, `useMany`, `useApiUrl` |
| `mutation-hooks.svelte.ts` | `useCreate`, `useUpdate`, `useDelete` |
| `form-hooks.svelte.ts` | `useForm` |
| `table-hooks.svelte.ts` | `useTable` |
| `routing-hooks.svelte.ts` | `useGo`, `useBack`, `useNavigation`, `useGetToPath`, `useLink`, `useResource` |
| `utility-hooks.svelte.ts` | `useModalForm`, `useDrawerForm`, `useMenu`, `useBreadcrumb`, `useRelation`, `useNotification` |
| `hooks.svelte.ts` | barrel 重导出 + 剩余 hooks（`useInfiniteList`, `useSelect`, `useCustom`, bulk mutations 等） |

### @svadmin/elysia 包

`packages/elysia/` 提供 Elysia 后端集成：
- `createElysiaDataProvider()` — 遵循 CRUD 路由约定的 DataProvider
- `InferResourceMap<App>` — 从 Elysia App 类型自动推导 ResourceTypeMap
