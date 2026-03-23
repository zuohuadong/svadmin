<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { FieldDefinition } from '@svadmin/core';
  import { getResource, useForm } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';
  import * as Dialog from './ui/dialog/index.js';
  import AutoForm from './AutoForm.svelte';

  let { resourceName, mode = 'create', id, open = $bindable(false), onSuccess } = $props<{
    resourceName: string;
    mode?: 'create' | 'edit';
    id?: string | number;
    open: boolean;
    onSuccess?: () => void;
  }>();

  const resource = $derived(getResource(resourceName));
  const fieldCount = $derived(resource.fields.filter(f => f.showInForm !== false).length);
  const dialogWidth = $derived(fieldCount > 8 ? 'sm:max-w-3xl' : fieldCount > 5 ? 'sm:max-w-2xl' : 'sm:max-w-lg');

  function handleClose() {
    open = false;
    onSuccess?.();
  }
</script>

{#if open}
  <Dialog.Dialog bind:open>
    <Dialog.DialogContent class="{dialogWidth} max-h-[85vh] overflow-y-auto">
      <Dialog.DialogHeader>
        <Dialog.DialogTitle>
          {mode === 'create' ? `${t('common.create')}${resource.label}` : `${t('common.edit')}${resource.label}`}
        </Dialog.DialogTitle>
      </Dialog.DialogHeader>
      <AutoForm {resourceName} {mode} {id} />
    </Dialog.DialogContent>
  </Dialog.Dialog>
{/if}
