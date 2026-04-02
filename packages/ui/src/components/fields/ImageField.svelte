<script lang="ts">
  interface Props { value: string | null | undefined; alt?: string; width?: number; height?: number }
  let { value, alt = '', width = 80, height = 80 }: Props = $props();
</script>
{#if value}
  <img src={value} {alt} {width} {height} class="rounded-lg object-cover shadow-sm" />
{:else}
  <span class="inline-flex items-center justify-center w-20 h-20 bg-muted rounded-lg text-muted-foreground">—</span>
{/if}
