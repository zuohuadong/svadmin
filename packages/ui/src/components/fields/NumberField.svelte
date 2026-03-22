<script lang="ts">
  interface Props { value: number | string | null | undefined; locale?: string; options?: Intl.NumberFormatOptions }
  let { value, locale = 'en-US', options = {} }: Props = $props();
  const formatted = $derived(value != null ? new Intl.NumberFormat(locale, options).format(Number(value)) : '—');
</script>
<span class="field-number">{formatted}</span>
