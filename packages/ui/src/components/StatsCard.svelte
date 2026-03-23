<script lang="ts">
  import { Skeleton } from './ui/skeleton/index.js';
  import type { Snippet } from 'svelte';

  type ColorVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info';
  type StyleVariant = 'default' | 'outline' | 'filled';

  const colorMap: Record<ColorVariant, string> = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    danger: 'bg-red-500/10 text-red-600 dark:text-red-400',
    info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  };

  const variantMap: Record<StyleVariant, string> = {
    default: 'border border-border bg-card shadow-sm',
    outline: 'border-2 border-border bg-transparent',
    filled: 'border-0 bg-muted/50 shadow-sm',
  };

  interface Props {
    label: string;
    value: string | number;
    icon?: import('svelte').Component<{ class?: string }>;
    trend?: { value: number; label?: string };
    loading?: boolean;
    color?: ColorVariant;
    variant?: StyleVariant;
    /** Optional footer snippet for additional content below the value */
    footer?: Snippet;
    class?: string;
  }

  let {
    label,
    value,
    icon: Icon,
    trend,
    loading = false,
    color = 'primary',
    variant = 'default',
    footer,
    class: className = '',
  }: Props = $props();
</script>

<div class="flex items-center gap-4 rounded-xl p-5 {variantMap[variant]} {className}">
  {#if Icon}
    <div class="flex h-12 w-12 items-center justify-center rounded-xl {colorMap[color]}">
      <Icon class="h-6 w-6" />
    </div>
  {/if}
  <div class="flex-1 min-w-0">
    <p class="text-sm text-muted-foreground">{label}</p>
    {#if loading}
      <Skeleton class="mt-1 h-7 w-20" />
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
    {#if footer}
      <div class="mt-2">
        {@render footer()}
      </div>
    {/if}
  </div>
</div>
