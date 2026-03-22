---
title: Auto Save
description: Automatic form saving with debounce
---

`useForm` supports automatic saving for edit forms with configurable debounce.

## Setup

```typescript
const form = useForm({
  resource: 'posts',
  action: 'edit',
  id: 42,
  autoSave: {
    enabled: true,
    debounce: 1000,  // ms (default: 1000)
    onFinish: (values) => {
      // Optional: transform values before save
      return { ...values, updatedAt: new Date().toISOString() };
    },
  },
});
```

## Triggering Auto Save

Call `triggerAutoSave` whenever form values change:

```svelte
<input
  value={title}
  oninput={(e) => {
    title = e.target.value;
    form.triggerAutoSave({ title });
  }}
/>
```

## Status Indicator

```svelte
{#if form.autoSaveStatus === 'saving'}
  <span>Saving...</span>
{:else if form.autoSaveStatus === 'saved'}
  <span>✓ Saved</span>
{:else if form.autoSaveStatus === 'error'}
  <span>Save failed</span>
{/if}
```

## Notes

- Auto save only works in **edit** mode (skipped for create)
- Changes are **debounced** — rapid edits don't trigger multiple saves
- Status resets to `idle` after 2 seconds
