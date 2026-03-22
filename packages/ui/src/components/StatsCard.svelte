<script lang="ts">
  import { Loader2 } from 'lucide-svelte';

  interface Props {
    label: string;
    value: string | number;
    icon?: typeof Loader2;
    trend?: { value: number; label?: string };
    loading?: boolean;
    class?: string;
  }

  let {
    label,
    value,
    icon: Icon,
    trend,
    loading = false,
    class: className = '',
  }: Props = $props();
</script>

<div class="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm {className}">
  {#if Icon}
    <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <Icon class="h-6 w-6" />
    </div>
  {/if}
  <div class="flex-1 min-w-0">
    <p class="text-sm text-muted-foreground">{label}</p>
    {#if loading}
      <Loader2 class="mt-1 h-5 w-5 animate-spin text-muted-foreground" />
    {:else}
      <div class="flex items-baseline gap-2">
        <p class="text-2xl font-bold text-foreground">{value}</p>
        {#if trend}
          <span
            class="text-xs font-medium {trend.value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}"
          >
            {trend.value >= 0 ? '↑' : '↓'}{Math.abs(trend.value)}%
            {#if trend.label}
              <span class="text-muted-foreground">{trend.label}</span>
            {/if}
          </span>
        {/if}
      </div>
    {/if}
  </div>
</div>
