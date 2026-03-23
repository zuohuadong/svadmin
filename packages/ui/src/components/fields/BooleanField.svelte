<script lang="ts">
  interface Props { value: boolean | null | undefined; trueIcon?: string; falseIcon?: string }
  let { value, trueIcon = '✓', falseIcon = '✗' }: Props = $props();
</script>
<span class="field-boolean" class:is-true={!!value} class:is-false={!value}>
  {value ? trueIcon : falseIcon}
</span>

<style>
  .field-boolean { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; font-size: 14px; }
  .is-true { background: var(--color-success-bg, #dcfce7); color: var(--color-success, #16a34a); }
  .is-false { background: var(--color-error-bg, #fef2f2); color: var(--color-error, #dc2626); }
</style>
