<script lang="ts">
  import { Toaster } from 'svelte-sonner';
  import { getResolvedTheme } from '@svadmin/core';

  const theme = $derived(getResolvedTheme() === 'dark' ? 'dark' : 'light');
</script>

<Toaster
  position="top-right"
  richColors
  closeButton
  expand
  {theme}
  toastOptions={{
    classes: {
      toast: 'font-sans',
    },
  }}
/>
