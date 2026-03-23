<script lang="ts">
  import { getResource } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';
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
        {mode === 'create' ? `${t('common.create')}${resource.label}` : `${t('common.edit')}${resource.label}`}
      </h2>
      <AutoForm {resourceName} {mode} {id} />
    </div>
  </Sheet>
{/if}
