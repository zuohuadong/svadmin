---
title: CRUD Pages
description: Pre-built page wrappers for list, create, edit, and show
---

CRUD page wrappers compose PageHeader, Breadcrumbs, AutoTable/AutoForm, and action buttons for zero-boilerplate admin pages.

## ListPage

```svelte
<script>
  import { ListPage } from '@svadmin/ui';
</script>

<ListPage resourceName="posts" />
```

Includes: PageHeader + Breadcrumbs + AutoTable + Create button.

### Props

| Prop | Type | Default |
|------|------|---------|
| `resourceName` | `string` | required |
| `title` | `string?` | resource label |
| `canCreate` | `boolean?` | from resource def |
| `headerActions` | `Snippet?` | extra buttons |

## CreatePage

```svelte
<CreatePage resourceName="posts" />
```

Includes: PageHeader + Breadcrumbs + AutoForm (create mode) + Back button.

## EditPage

```svelte
<EditPage resourceName="posts" id={42} />
```

Includes: PageHeader + Breadcrumbs + AutoForm (edit mode) + Back button + Delete button.

### Props

| Prop | Type | Default |
|------|------|---------|
| `resourceName` | `string` | required |
| `id` | `string \| number` | required |
| `canDelete` | `boolean?` | from resource def |

## ShowPage

```svelte
<ShowPage resourceName="posts" id={42} />
```

Detail view with formatted fields, edit button, and back navigation.

## Breadcrumbs

Auto-generated from current route and resource definitions:

```
Home / Posts / Edit #42
```

Supports: list, create, edit, and show routes.
