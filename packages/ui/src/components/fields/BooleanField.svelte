<script lang="ts">
  interface Props { value: boolean | null | undefined; trueIcon?: string; falseIcon?: string }
  let { value, trueIcon = '✓', falseIcon = '✗' }: Props = $props();
</script>
{#if value}
  <span class="inline-flex items-center justify-center w-6 h-6 rounded-full text-sm bg-success/10 text-success">
    {trueIcon}
  </span>
{:else}
  <span class="inline-flex items-center justify-center w-6 h-6 rounded-full text-sm bg-destructive/10 text-destructive">
    {falseIcon}
  </span>
{/if}
