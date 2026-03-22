---
title: Form & Table Hooks
description: useForm and useTable — auto-derive from route, HttpError integration
---

## `useForm`

Full-featured form hook with auto-save, validation, and route auto-derivation.

### Basic Usage

```typescript
const form = useForm({ resource: 'posts', action: 'create' });
```

### Route Auto-Derivation

On page `/#/posts/edit/5`, simply call:

```typescript
const form = useForm();
// Automatically: resource='posts', action='edit', id='5'
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `resource` | `string?` | auto | Resource name (auto from route) |
| `action` | `'create' \| 'edit' \| 'clone'` | auto | Form action |
| `id` | `string \| number` | auto | Record ID for edit/clone |
| `redirect` | `'list' \| 'edit' \| 'show' \| false` | `'list'` | Where to go after submit |
| `validate` | `(values) => errors \| null` | — | Client-side validation |
| `autoSave` | `{ enabled, debounce? }` | — | Auto-save on change |
| `mutationMode` | `MutationMode` | `'pessimistic'` | Mutation strategy |
| `undoableTimeout` | `number` | `5000` | Undo timeout (ms) |

### Return Value

```typescript
const {
  query,          // TanStack query (edit/clone mode)
  formLoading,    // boolean (reactive getter)
  mutation,       // TanStack mutation
  onFinish,       // (values) => void — validates + submits
  errors,         // Record<string, string> (reactive getter)
  setFieldError,  // (field, message) => void
  clearErrors,    // () => void
  clearFieldError, // (field) => void
  triggerAutoSave, // (values) => void
  autoSaveStatus,  // 'idle' | 'saving' | 'saved' | 'error'
} = useForm();
```

### HttpError Integration

When your DataProvider throws `HttpError`, validation errors are automatically mapped to form fields:

```typescript
// In your DataProvider:
throw new HttpError('Validation Failed', 422, {
  email: ['Email is required'],
  name: 'Name is too short',
});
// → form.errors = { email: 'Email is required', name: 'Name is too short' }
```

## `useTable`

Table hook with pagination, sorting, filtering, and URL sync.

### Basic Usage

```typescript
const table = useTable({ resource: 'posts' });
```

### Route Auto-Derivation

```typescript
const table = useTable(); // auto-derives resource from route
```

### Options

| Option | Type | Default |
|--------|------|---------|
| `resource` | `string?` | auto |
| `pagination` | `Pagination` | `{ current: 1, pageSize: 10 }` |
| `sorters` | `Sort[]` | `[]` |
| `filters` | `Filter[]` | `[]` |
| `syncWithLocation` | `boolean` | `false` |

### Return Value

```typescript
const {
  query,         // TanStack query result
  pagination,    // { current, pageSize } — reactive $state
  sorters,       // Sort[] — reactive $state
  filters,       // Filter[] — reactive $state
  setCurrent,    // (page) => void
  setPageSize,   // (size) => void
  setSorters,    // (sorters) => void
  setFilters,    // (filters) => void
} = useTable();
```
