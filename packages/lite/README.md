# @svadmin/lite

**Lightweight, SSR-compatible admin UI for [@svadmin](https://github.com/zuohuadong/svadmin).**

Zero client-side JavaScript required. Works in IE11 and legacy browsers.

## Why?

The main `@svadmin/ui` package delivers a premium SPA experience using Svelte 5, Tailwind CSS v4, and TanStack.  
However, some enterprise/government environments require IE11 compatibility.

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
| **UA Detection** | Auto-redirect IE11 users to `/lite/` routes |
| **i18n** | Uses `@svadmin/core` `t()` translations |
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

```svelte
<!-- src/routes/lite/posts/+page.svelte -->
<script lang="ts">
  export const csr = false; // ← Critical: disable client-side rendering

  import { LiteLayout, LiteTable, LitePagination, LiteSearch, LiteAlert } from '@svadmin/lite';
  import '@svadmin/lite/src/lite.css';
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

### 3. Auto-redirect legacy browsers

```typescript
// src/hooks.server.ts
import { createLegacyRedirectHook } from '@svadmin/lite';

export const handle = createLegacyRedirectHook('/lite');
```

### 4. Add the `<meta>` tags for dual-core browsers

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
| `LiteLayout` | Sidebar + main area layout |
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

Import `@svadmin/lite/src/lite.css` in your layout. It's fully self-contained:
- No CSS variables
- No modern CSS features
- Vendor-prefixed flexbox for IE11
- Print-optimized styles
- 350 lines, ~10KB unminified

## Optional: Progressive Enhancement

Copy `packages/lite/static/enhance.js` to your static folder. This ES5 script adds:
- Auto-close delete confirmation when clicking outside
- Auto-focus first form input
- Unsaved changes warning

**100% optional** — everything works without it.

## License

MIT
