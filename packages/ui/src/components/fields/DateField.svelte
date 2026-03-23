<script lang="ts">
  interface Props { value: string | number | Date | null | undefined; locale?: string; options?: Intl.DateTimeFormatOptions }
  let { value, locale = 'en-US', options = { dateStyle: 'medium' } }: Props = $props();
  const formatted = $derived(value != null ? new Intl.DateTimeFormat(locale, options).format(new Date(value as string | number | Date)) : '—');
</script>
<span class="field-date">{formatted}</span>
