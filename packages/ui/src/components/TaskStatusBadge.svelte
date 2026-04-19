<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import { Clock3, Loader2, CheckCircle2, AlertTriangle, CircleDashed } from '@lucide/svelte';
  import { Badge } from './ui/badge/index.js';

  let {
    status = 'pending',
    showIcon = true,
    class: className = '',
  } = $props<{
    status?: string;
    showIcon?: boolean;
    class?: string;
  }>();

  const normalizedStatus = $derived(String(status || 'pending').toLowerCase());

  function translateStatus(value: string) {
    const key = `task.status.${value}`;
    const translated = t(key);
    if (translated !== key) return translated;
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  const config = $derived.by(() => {
    switch (normalizedStatus) {
      case 'running':
      case 'processing':
        return {
          label: translateStatus(normalizedStatus),
          variant: 'default' as const,
          icon: Loader2,
          iconClass: 'animate-spin',
        };
      case 'completed':
      case 'success':
      case 'done':
        return {
          label: translateStatus(normalizedStatus),
          variant: 'secondary' as const,
          icon: CheckCircle2,
          iconClass: 'text-green-600 dark:text-green-400',
        };
      case 'failed':
      case 'error':
        return {
          label: translateStatus(normalizedStatus),
          variant: 'destructive' as const,
          icon: AlertTriangle,
          iconClass: '',
        };
      case 'queued':
        return {
          label: t('task.status.queued'),
          variant: 'outline' as const,
          icon: CircleDashed,
          iconClass: '',
        };
      case 'pending':
      default:
        return {
          label: translateStatus(normalizedStatus),
          variant: 'outline' as const,
          icon: Clock3,
          iconClass: '',
        };
    }
  });

  const Icon = $derived(config.icon);
</script>

<Badge variant={config.variant} class={`gap-1.5 ${className}`.trim()}>
  {#if showIcon}
    <Icon class={`h-3.5 w-3.5 ${config.iconClass}`.trim()} />
  {/if}
  <span>{config.label}</span>
</Badge>
