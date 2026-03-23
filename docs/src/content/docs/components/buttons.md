---
title: CRUD Buttons
description: 10 pre-built action buttons for admin operations
---

svadmin includes 10 action buttons that integrate with data hooks and routing.

## Available Buttons

| Button | Description | Key Action |
|--------|-------------|------------|
| `CreateButton` | Navigate to create form | `navigate('/{resource}/create')` |
| `EditButton` | Navigate to edit form | `navigate('/{resource}/edit/{id}')` |
| `DeleteButton` | Delete with confirmation | `useDelete().mutate()` |
| `ShowButton` | Navigate to detail view | `navigate('/{resource}/show/{id}')` |
| `ListButton` | Navigate to list | `navigate('/{resource}')` |
| `RefreshButton` | Invalidate queries | `queryClient.invalidateQueries()` |
| `ExportButton` | Export data as CSV | `useExport()` |
| `ImportButton` | Import from CSV | `useImport()` |
| `SaveButton` | Submit form | Triggers `onFinish()` |
| `CloneButton` | Clone existing record | `navigate('/{resource}/create?clone={id}')` |

## Usage

```svelte
<script>
  import { EditButton, DeleteButton } from '@svadmin/ui';
</script>

<EditButton resource="posts" id={record.id} />
<DeleteButton resource="posts" id={record.id} onSuccess={() => refetch()} />
```
