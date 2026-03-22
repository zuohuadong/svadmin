---
title: Data Hooks
description: TanStack Query-powered CRUD hooks
---

All data hooks are powered by TanStack Query v6 with automatic caching, background refetch, and optimistic updates.

## Query Hooks

All query hooks accept either static options or a **getter function** for reactive options:

```typescript
// Static
useList({ resource: 'posts', filters: [{ field: 'status', operator: 'eq', value: 'published' }] });

// Reactive getter — re-fetches when $state changes
useList(() => ({ resource: 'posts', pagination, sorters, filters }));
```

### `useList`

```typescript
const query = useList<Post>({ resource: 'posts', pagination: { current: 1, pageSize: 10 } });
// query.data → { data: Post[], total: number }
```

### `useOne`

```typescript
const query = useOne<Post>({ resource: 'posts', id: 1 });
// query.data → Post
```

### `useShow` (alias for useOne)

```typescript
const query = useShow<Post>({ resource: 'posts', id: 1 });
```

### `useMany`

```typescript
const query = useMany<Post>({ resource: 'posts', ids: [1, 2, 3] });
// query.data → Post[]
```

### `useSelect`

```typescript
const query = useSelect({ resource: 'categories', optionLabel: 'name', optionValue: 'id' });
// query.data → [{ label: 'Tech', value: '1' }, ...]
```

### `useInfiniteList`

```typescript
const query = useInfiniteList<Post>({ resource: 'posts', pageSize: 20 });
```

## Mutation Hooks

### `useCreate`

```typescript
const mutation = useCreate<Post>();
mutation.mutate({ resource: 'posts', variables: { title: 'Hello' } });
```

### `useUpdate`

```typescript
const mutation = useUpdate<Post>();
mutation.mutate({ resource: 'posts', id: 1, variables: { title: 'Updated' } });
```

### `useDelete`

```typescript
const mutation = useDelete();
mutation.mutate({ resource: 'posts', id: 1 });
```

### Bulk: `useCreateMany`, `useUpdateMany`, `useDeleteMany`

Same pattern with arrays of items.
