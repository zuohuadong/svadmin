# svadmin

> Headless admin framework for Svelte 5 — bring your own backend
>
> 面向 Svelte 5 的 Headless 管理后台框架 — 自带后端适配

[English](#-features) | [中文](#-特性)

---

## ✨ Features

- 🎯 **Headless Architecture** — DataProvider / AuthProvider interfaces, swap backends freely
- ⚡ **18 Reactive Hooks** — `useList`, `useOne`, `useCreate`, `useUpdate`, `useDelete`, `useTable`, `useForm`, etc.
- 🧩 **Pre-built UI** — AdminApp, AutoTable, AutoForm, ShowPage, Sidebar, Layout with shadcn-svelte
- 🌍 **i18n** — Built-in zh-CN/en with browser auto-detection, extensible
- 🔐 **Auth & RBAC** — AuthProvider + permission system with resource-level access control
- 🌓 **Dark Mode** — Light / Dark / System with one-click toggle, persisted to localStorage
- 📡 **Real-time** — LiveProvider interface for real-time subscriptions
- 📋 **Audit Logging** — Pluggable audit handler for tracking admin operations
- 🎨 **OKLCH Theming** — Semantic color tokens, fully customizable

## ✨ 特性

- 🎯 **Headless 架构** — DataProvider / AuthProvider 接口，自由切换后端
- ⚡ **18 个响应式 Hook** — `useList`、`useOne`、`useCreate`、`useUpdate`、`useDelete`、`useTable`、`useForm` 等
- 🧩 **开箱即用 UI** — AdminApp、AutoTable、AutoForm、ShowPage、Sidebar、Layout（基于 shadcn-svelte）
- 🌍 **国际化** — 内置中英文，浏览器自动检测语言，可扩展
- 🔐 **认证与权限** — AuthProvider + 资源级权限控制
- 🌓 **暗色模式** — 亮色 / 暗色 / 跟随系统，一键切换，持久化到 localStorage
- 📡 **实时订阅** — LiveProvider 接口支持实时数据
- 📋 **审计日志** — 可插拔的审计处理器
- 🎨 **OKLCH 主题** — 语义化颜色 Token，完全可定制

## 📦 Packages / 包

| Package | Description / 描述 |
|---------|-------------------|
| `@svadmin/core` | Core SDK — types, hooks, context, router, i18n, permissions, theme |
| `@svadmin/ui` | Pre-built admin components / 预构建管理组件（shadcn-svelte） |
| `@svadmin/simple-rest` | REST DataProvider + JWT/Cookie AuthProvider（零依赖） |
| `@svadmin/supabase` | Supabase DataProvider, AuthProvider, LiveProvider |

## 🚀 Quick Start / 快速开始

```bash
# Install
bun add @svadmin/core @svadmin/ui @svadmin/simple-rest
```

### One-Line Setup / 一行配置

```svelte
<script lang="ts">
  import { AdminApp } from '@svadmin/ui';
  import { createSimpleRestDataProvider } from '@svadmin/simple-rest';
  import { resources } from './resources';

  const dataProvider = createSimpleRestDataProvider({
    apiUrl: 'https://jsonplaceholder.typicode.com',
  });
</script>

<AdminApp {dataProvider} {resources} title="My Admin" defaultTheme="system" />
```

### Define Resources / 定义资源

```typescript
import type { ResourceDefinition } from '@svadmin/core';

export const resources: ResourceDefinition[] = [
  {
    name: 'products',
    label: 'Products',
    fields: [
      { key: 'id', label: 'ID', type: 'number', showInForm: false },
      { key: 'name', label: 'Name', type: 'text', required: true, searchable: true },
      { key: 'price', label: 'Price', type: 'number', required: true },
      { key: 'status', label: 'Status', type: 'select', options: [
        { label: 'Active', value: 'active' },
        { label: 'Draft', value: 'draft' },
      ]},
    ],
  },
];
```

### With Supabase / 使用 Supabase

```svelte
<script lang="ts">
  import { AdminApp } from '@svadmin/ui';
  import { createSupabaseDataProvider, createSupabaseAuthProvider } from '@svadmin/supabase';
  import { createClient } from '@supabase/supabase-js';
  import { resources } from './resources';
  import Login from './pages/Login.svelte';

  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
</script>

<AdminApp
  dataProvider={createSupabaseDataProvider(supabase)}
  authProvider={createSupabaseAuthProvider(supabase)}
  {resources}
  title="My App"
>
  {#snippet loginPage()}<Login />{/snippet}
</AdminApp>
```

## 🏗️ `<AdminApp>` Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `dataProvider` | `DataProvider` | ✅ | — | Data source adapter / 数据源适配器 |
| `authProvider` | `AuthProvider` | — | — | Auth adapter / 认证适配器 |
| `resources` | `ResourceDefinition[]` | ✅ | — | Resource definitions / 资源定义 |
| `title` | `string` | — | `'Admin'` | App title / 应用标题 |
| `defaultTheme` | `'light' \| 'dark' \| 'system'` | — | `'system'` | Initial theme / 初始主题 |
| `locale` | `string` | — | auto-detect | Override locale / 覆盖语言 |
| `dashboard` | `Snippet` | — | — | Custom dashboard / 自定义仪表盘 |
| `loginPage` | `Snippet` | — | — | Custom login page / 自定义登录页 |

## 🌓 Dark Mode / 暗色模式

Dark mode works out of the box. Use `defaultTheme` prop or the Sidebar toggle:

暗色模式开箱即用。使用 `defaultTheme` prop 或侧边栏切换按钮：

```svelte
<!-- Follow system / 跟随系统 -->
<AdminApp {dataProvider} {resources} defaultTheme="system" />

<!-- Always dark / 始终暗色 -->
<AdminApp {dataProvider} {resources} defaultTheme="dark" />
```

Programmatic control / 编程式控制:

```typescript
import { setTheme, toggleTheme, getTheme, getResolvedTheme } from '@svadmin/core';

setTheme('dark');     // 'light' | 'dark' | 'system'
toggleTheme();        // toggle between light/dark
getTheme();           // current setting
getResolvedTheme();   // resolved to 'light' or 'dark'
```

## 🔌 Custom DataProvider / 自定义数据源

Implement the `DataProvider` interface to connect any backend:

实现 `DataProvider` 接口即可接入任意后端：

```typescript
import type { DataProvider } from '@svadmin/core';

const myProvider: DataProvider = {
  getApiUrl: () => 'https://api.example.com',
  getList: async ({ resource, pagination, sorters, filters }) => { /* ... */ },
  getOne: async ({ resource, id }) => { /* ... */ },
  create: async ({ resource, variables }) => { /* ... */ },
  update: async ({ resource, id, variables }) => { /* ... */ },
  deleteOne: async ({ resource, id }) => { /* ... */ },
};
```

## 🏗️ Architecture / 架构

```
┌──────────────────────────────────────┐
│            Your App / 你的应用         │
│  (resources, pages, providers)       │
├──────────────────────────────────────┤
│          @svadmin/ui                 │
│  AdminApp · AutoTable · AutoForm     │
│  ShowPage · Layout · shadcn-svelte   │
├──────────────────────────────────────┤
│          @svadmin/core               │
│  Hooks · Context · Router · i18n     │
│  Permissions · Audit · Theme         │
├──────────┬───────────┬───────────────┤
│ /supabase│/simple-rest│ Your Provider │
└──────────┴───────────┴───────────────┘
```

## 🤝 Contributing / 贡献

Contributions are welcome! 欢迎贡献！

1. Fork the repo
2. Create your branch (`git checkout -b feat/amazing-feature`)
3. Commit (`git commit -m 'feat: add amazing feature'`)
4. Push (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT
