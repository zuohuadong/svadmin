<script lang="ts">
  import { Toaster } from 'svelte-sonner';
</script>

<Toaster
  position="top-right"
  richColors
  closeButton
  expand
  toastOptions={{
    classes: {
      toast: 'font-sans',
    },
  }}
/>
