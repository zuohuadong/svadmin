# @svadmin/lite

**Lightweight, SSR-compatible admin UI for [@svadmin](https://github.com/zuohuadong/svadmin).**

Core server-driven CRUD flows can run without hydration. An optional `enhance.js` asset adds progressive client-side conveniences.

The bundled CSS follows an IE11-oriented baseline, but Svelte 5, SvelteKit, Tailwind-based companion packages, and each consumer's transpilation target determine the final browser support. This package therefore does not make a blanket IE11 compatibility guarantee.

## Why?

The main `@svadmin/ui` package delivers a premium SPA experience using Svelte 5, Tailwind CSS v4, and TanStack. Those tools target modern browsers. Some enterprise/government environments instead prefer server-driven navigation, native forms, and a smaller client-side runtime.

`@svadmin/lite` provides a server-rendered fallback that **shares the same DataProvider, AuthProvider, and Resource definitions** — only the rendering layer is different.

## Features

| Feature | How it works |
|---------|-------------|
| **List page** | Server-rendered `<table>` with `<a>` sort links |
| **Detail page** | Key-value layout with type-aware formatting |
| **Create/Edit** | Native `<form method="POST">` with server-side validation |
| **Delete** | `<details>` confirmation, no JS needed |
| **Search** | `<form method="GET">` with `?q=` parameter |
| **Pagination** | Pure `<a>` page links |
| **Login/Logout** | Cookie-based auth via SvelteKit Form Actions |
| **Auth Guard** | Server hook redirects unauthenticated users |
| **UA Detection** | Optional legacy-browser detection hook redirects users to `/lite/` routes |
| **i18n** | Uses `@svadmin/core` `t()` translations |
| **Multi-level Menu** | Config-driven 2/3 level menus via `MenuItem[]` |
| **Print** | `@media print` optimized styles |

## Quick Start

### 1. Install

```bash
bun add @svadmin/lite
```

### 2. Create a list page

```typescript
// src/routes/lite/posts/+page.server.ts
import { createListLoader, createCrudActions } from '@svadmin/lite';
import { dataProvider, resources } from '$lib/admin';

const postsResource = resources.find(r => r.name === 'posts')!;

export const load = createListLoader(dataProvider, postsResource);
export const actions = createCrudActions(dataProvider, postsResource);
```

```typescript
// src/routes/lite/posts/+page.ts
export const csr = false;
```

```svelte
<!-- src/routes/lite/posts/+page.svelte -->
<script lang="ts">
  import { LiteLayout, LiteTable, LitePagination, LiteSearch, LiteAlert } from '@svadmin/lite';
  import '@svadmin/lite/lite.css';
  import { resources } from '$lib/admin';

  let { data, form } = $props();
</script>

<LiteLayout resources={resources} currentResource="posts" brandName="My Admin">
  <div class="lite-header">
    <h1>{data.resource.label}</h1>
    <a href="/lite/posts/create" class="lite-btn lite-btn-primary">+ Create</a>
  </div>

  {#if form?.success}
    <LiteAlert type="success" message="Operation completed!" />
  {/if}

  <LiteSearch value={data.search} />
  <LiteTable
    records={data.records}
    resource={data.resource}
    currentSort={data.sort}
    currentOrder={data.order}
  />
  <LitePagination page={data.page} totalPages={data.totalPages} />
</LiteLayout>
```

### 2b. Multi-level menu (optional)

Pass a `menu` prop to `LiteLayout` to replace the auto-generated flat resource list with a multi-level sidebar:

```svelte
<script lang="ts">
  import type { MenuItem } from '@svadmin/core';

  const menu: MenuItem[] = [
    { name: 'home', label: 'Dashboard', href: '/lite' },
    {
      name: 'content', label: 'Content',
      children: [
        { name: 'posts', label: 'Posts', href: '/lite/posts' },
        { name: 'categories', label: 'Categories', href: '/lite/categories' },
      ],
    },
    {
      name: 'system', label: 'System',
      children: [
        { name: 'users', label: 'Users', href: '/lite/users' },
        {
          name: 'settings', label: 'Settings',
          children: [
            { name: 'general', label: 'General', href: '/lite/settings/general' },
            { name: 'security', label: 'Security', href: '/lite/settings/security' },
          ],
        },
      ],
    },
    { name: 'docs', label: 'Documentation', href: 'https://docs.example.com', target: '_blank' },
  ];
</script>

<LiteLayout {resources} {menu} currentResource="posts" brandName="My Admin">
  <!-- ... -->
</LiteLayout>
```

### 3. Optionally route legacy browsers to Lite pages

```typescript
// src/hooks.server.ts
import { createLegacyRedirectHook } from '@svadmin/lite';

export const handle = createLegacyRedirectHook('/lite');
```

### 4. Optional legacy-browser metadata

```html
<!-- src/app.html -->
<head>
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <meta name="renderer" content="webkit">
  <meta charset="utf-8">
</head>
```

## Components

| Component | Description |
|-----------|-------------|
| `LiteLayout` | Sidebar + main area layout (supports `menu` prop for multi-level menus) |
| `LiteTable` | HTML table with sort links and delete confirmation |
| `LiteSearch` | GET-based search form |
| `LitePagination` | Page number links |
| `LiteForm` | Auto-generated form from `FieldDefinition[]` |
| `LiteShow` | Record detail/view page |
| `LiteLogin` | Login form |
| `LiteAlert` | Success/error notification banner |

## Server Utilities

| Function | Description |
|----------|-------------|
| `createListLoader(dp, resource)` | SvelteKit `load` function for list pages |
| `createDetailLoader(dp, resource)` | SvelteKit `load` function for detail pages |
| `createCrudActions(dp, resource)` | SvelteKit form actions for create/update/delete |
| `createAuthGuard(authProvider)` | Server hook for authentication |
| `createAuthActions(authProvider)` | Login/logout form actions |
| `createLegacyRedirectHook()` | Auto-redirect IE11 to `/lite/` |
| `fieldsToZodSchema(fields)` | Auto-generate Zod schema for superforms |

## CSS

Import `@svadmin/lite/lite.css` in your layout. It's fully self-contained:
- IE11-oriented CSS baseline (standard flexbox, no CSS variables)
- Custom-styled checkboxes, radios, and selects (no `appearance: none` needed)
- Indigo/Slate color system aligned with `@svadmin/ui`
- Modern focus rings (`box-shadow` based)
- Smooth transitions on all interactive elements
- Multi-layer translucent shadows
- Print-optimized styles
- ~500 lines, ~14KB unminified

This CSS baseline helps older browsers, but the generated Svelte/SvelteKit application and any Tailwind v4 UI used alongside Lite still require the browser targets configured by those tools (Tailwind v4 itself targets modern browsers).

## Optional: Progressive Enhancement

Copy the exported `@svadmin/lite/enhance.js` asset to your application's static folder. This ES5 script adds:
- Auto-close delete confirmation when clicking outside
- Auto-focus first form input
- Unsaved changes warning

The asset is optional for core server-rendered navigation and form submission; the conveniences listed above require it.

## License

MIT
