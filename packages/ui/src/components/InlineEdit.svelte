<script lang="ts">
  import { useUpdate } from '@svadmin/core';
  import type { FieldDefinition } from '@svadmin/core';

  interface Props {
    resourceName: string;
    recordId: string | number;
    field: FieldDefinition;
    value: unknown;
    /** Callback after successful save */
    onSave?: (newValue: unknown) => void;
  }

  let { resourceName, recordId, field, value, onSave }: Props = $props();

  let editing = $state(false);
  let editValue = $state('');
  let inputRef = $state<HTMLInputElement | null>(null);
  let saving = $state(false);
  const displayValue = $derived(String(value ?? ''));

  const { mutation } = useUpdate({ get resource() { return resourceName; } });

  function startEdit() {
    if (field.type === 'number' || field.type === 'text' || field.type === 'url' || field.type === 'email') {
      editing = true;
      editValue = displayValue;
      // Focus input on next tick
      setTimeout(() => inputRef?.focus(), 0);
    }
  }

  async function save() {
    if (!editing || saving) return;
    const newValue = field.type === 'number' ? Number(editValue) : editValue;
    if (newValue === value) {
      editing = false;
      return;
    }
    saving = true;
    try {
      await mutation.mutateAsync({
        id: recordId,
        resource: resourceName,
        variables: { [field.key]: newValue },
      });
      editing = false;
      onSave?.(newValue);
    } catch {
      // Keep editing on error
    } finally {
      saving = false;
    }
  }

  function cancel() {
    editing = false;
    editValue = displayValue;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') cancel();
  }
</script>

{#if editing}
  <input
    bind:this={inputRef}
    type={field.type === 'number' ? 'number' : 'text'}
    bind:value={editValue}
    onkeydown={handleKeydown}
    onblur={save}
    disabled={saving}
    class="h-7 w-full rounded border bg-background px-2 text-sm outline-none ring-1 ring-primary/50 focus:ring-2 focus:ring-primary transition-all"
  />
{:else}
  <span
    class="inline-block cursor-pointer rounded px-1 py-0.5 -mx-1 hover:bg-accent/50 transition-colors"
    ondblclick={startEdit}
    title="Double-click to edit"
    role="button"
    tabindex="0"
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === 'F2') startEdit(); }}
  >
    {value ?? '—'}
  </span>
{/if}
