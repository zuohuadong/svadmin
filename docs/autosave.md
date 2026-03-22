# Auto Save

`useForm` supports automatic saving with debounce.

## Usage

```typescript
const form = useForm({
  resource: 'posts',
  action: 'edit',
  id: 42,
  autoSave: {
    enabled: true,
    debounce: 1000,        // ms, default 1000
    onFinish: 'pessimistic' // 'optimistic' | 'pessimistic'
  },
});

// form.autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error'
// form.triggerAutoSave(values) — manually trigger
```

## How It Works

1. When `autoSave.enabled` is `true`, form watches for value changes
2. After the debounce period, it automatically calls the mutation
3. `autoSaveStatus` updates reactively: `idle` → `saving` → `saved`
4. Errors set status to `'error'` and show a toast

## AutoForm Integration

When using `AutoForm` with an `autoSave`-enabled `useForm`, a status indicator appears automatically showing "Saving..." or "Saved".

## Example

```svelte
<script lang="ts">
  import { useForm } from '@svadmin/core';
  import { AutoForm } from '@svadmin/ui';

  const form = useForm({
    resource: 'posts',
    action: 'edit',
    id: 42,
    autoSave: { enabled: true, debounce: 800 },
  });
</script>

<AutoForm {form} resource="posts" />
<!-- Changes auto-save after 800ms of inactivity -->
```
