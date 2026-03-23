<script lang="ts">
  import { Badge } from '../ui/badge/index.js';

  let { value, options } = $props<{
    value: string | number | null | undefined;
    options?: { label: string; value: string | number }[];
  }>();

  const label = $derived(
    options?.find(o => o.value === value)?.label ?? (value != null ? String(value) : '—')
  );
</script>

<Badge variant="outline">{label}</Badge>
