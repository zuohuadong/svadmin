<script lang="ts">
  import { getResource } from '@svadmin/core';
  import { Sheet } from './ui/sheet/index.js';
  import AutoForm from './AutoForm.svelte';

  let { resourceName, mode = 'create', id, open = $bindable(false), side = 'right' } = $props<{
    resourceName: string;
    mode?: 'create' | 'edit';
    id?: string | number;
    open: boolean;
    side?: 'left' | 'right';
  }>();

  const resource = $derived(getResource(resourceName));
</script>

{#if open}
  <Sheet bind:open {side}>
    <div class="p-6 space-y-4">
      <h2 class="text-lg font-semibold text-foreground">
        {mode === 'create' ? `Create ${resource.label}` : `Edit ${resource.label}`}
      </h2>
      <AutoForm {resourceName} {mode} {id} />
    </div>
  </Sheet>
{/if}
