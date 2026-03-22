# AdminApp

> One-stop admin entry component / 一站式管理后台入口组件

## Import

```typescript
import { AdminApp } from '@svadmin/ui';
```

## Usage / 用法

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

### With Auth / 带认证

```svelte
<AdminApp
  {dataProvider}
  authProvider={myAuthProvider}
  {resources}
  title="Secure Admin"
>
  {#snippet loginPage()}<MyLogin />{/snippet}
  {#snippet dashboard()}<MyDashboard />{/snippet}
</AdminApp>
```

## Props

| Prop | Type | Required | Default | Description / 描述 |
|------|------|----------|---------|-------------------|
| `dataProvider` | `DataProvider` | ✅ | — | Data source adapter / 数据源适配器 |
| `authProvider` | `AuthProvider` | — | — | Auth adapter / 认证适配器 |
| `resources` | `ResourceDefinition[]` | ✅ | — | Resource definitions / 资源定义 |
| `title` | `string` | — | `'Admin'` | App title (shown in sidebar) / 应用标题 |
| `defaultTheme` | `'light' \| 'dark' \| 'system'` | — | `'system'` | Initial theme / 初始主题 |
| `locale` | `string` | — | auto-detect | Override locale / 覆盖语言 |
| `dashboard` | `Snippet` | — | — | Custom dashboard page / 自定义仪表盘 |
| `loginPage` | `Snippet` | — | — | Custom login page / 自定义登录页 |

## Built-in Routing / 内置路由

AdminApp uses hash-based routing:

| Route | Page |
|-------|------|
| `#/` | Dashboard |
| `#/login` | Login |
| `#/:resource` | AutoTable (list) |
| `#/:resource/create` | AutoForm (create) |
| `#/:resource/edit/:id` | AutoForm (edit) |
| `#/:resource/show/:id` | ShowPage (detail) |
