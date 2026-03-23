<script lang="ts">
  import { useImport, t, type UseImportOptions } from '@svadmin/core';
  import { Button } from '../ui/button/index.js';
  import { Upload } from 'lucide-svelte';

  let { resource, hideText = false, onFinish, class: className = '' } = $props<{
    resource: string;
    hideText?: boolean;
    onFinish?: (result: { succeeded: unknown[]; errored: { request: unknown; error: unknown }[] }) => void;
    class?: string;
  }>();

  let fileInput: HTMLInputElement | undefined = $state();

  const importHook = useImport({
    get resource() { return resource; },
    onFinish: (result) => onFinish?.(result),
  });

  function triggerImport() {
    fileInput?.click();
  }

  function handleFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      importHook.handleChange({ file });
      input.value = ''; // reset for re-import
    }
  }
</script>

<input
  bind:this={fileInput}
  type="file"
  accept=".csv"
  style="display:none"
  onchange={handleFileChange}
/>
<Button
  variant="outline"
  size={hideText ? 'icon' : 'sm'}
  class={className}
  disabled={importHook.isLoading}
  onclick={triggerImport}
>
  <Upload class="h-4 w-4" />
  {#if !hideText}<span class="ml-1">{t('common.import')}</span>{/if}
</Button>
