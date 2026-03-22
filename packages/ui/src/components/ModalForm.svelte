<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { FieldDefinition } from '@svadmin/core';
  import { getResource, useForm } from '@svadmin/core';
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

  function handleClose() {
    open = false;
  }
</script>

{#if open}
  <Dialog.Dialog bind:open>
    <Dialog.DialogContent class="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
      <Dialog.DialogHeader>
        <Dialog.DialogTitle>
          {mode === 'create' ? `Create ${resource.label}` : `Edit ${resource.label}`}
        </Dialog.DialogTitle>
      </Dialog.DialogHeader>
      <AutoForm {resourceName} {mode} {id} />
    </Dialog.DialogContent>
  </Dialog.Dialog>
{/if}
