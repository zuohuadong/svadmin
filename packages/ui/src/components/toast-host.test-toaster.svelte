<script lang="ts">
  let { theme }: { theme?: string } = $props();
</script>

<div data-testid="sonner-toaster" data-theme={theme}></div>
