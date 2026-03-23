<script lang="ts">
  import { getResource } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';
  import * as Sheet from './ui/sheet/index.js';
  import AutoForm from './AutoForm.svelte';

  let { resourceName, mode = 'create', id, open = $bindable(false), side = 'right', onSuccess } = $props<{
    resourceName: string;
    mode?: 'create' | 'edit';
    id?: string | number;
    open: boolean;
    side?: 'left' | 'right';
    onSuccess?: () => void;
  }>();

  const resource = $derived(getResource(resourceName));

  function handleClose() {
    open = false;
    onSuccess?.();
  }
</script>

<Sheet.Root bind:open {side}>
  <Sheet.Content>
    <Sheet.Header>
      <Sheet.Title>
        {mode === 'create' ? `${t('common.create')}${resource.label}` : `${t('common.edit')}${resource.label}`}
      </Sheet.Title>
    </Sheet.Header>
    <div class="flex-1 overflow-y-auto">
      <AutoForm {resourceName} {mode} {id} />
    </div>
  </Sheet.Content>
</Sheet.Root>
