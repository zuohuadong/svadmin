<script lang="ts">
  import { getToasts, removeToast } from '@svadmin/core/toast';
  import { Button } from './ui/button/index.js';
  import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-svelte';
  import UndoableNotification from './UndoableNotification.svelte';

  const iconMap = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  };
  const colorMap = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
  };

  const toasts = $derived(getToasts());
</script>

{#if toasts.length > 0}
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
    {#each toasts as t (t.id)}
      {#if t.type === 'undoable'}
        <UndoableNotification
          message={t.message}
          duration={t.duration}
          onUndo={() => { t.onUndo?.(); removeToast(t.id); }}
          onTimeout={() => { t.onTimeout?.(); removeToast(t.id); }}
        />
      {:else}
        {@const Icon = iconMap[t.type]}
        <div
          class="flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg animate-slide-in {colorMap[t.type]}"
          role="alert"
        >
          <Icon class="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p class="flex-1 text-sm font-medium">{t.message}</p>
          <Button variant="ghost" size="icon-xs" onclick={() => removeToast(t.id)} class="flex-shrink-0 -mr-2 -mt-1">
            <X class="h-4 w-4" />
          </Button>
        </div>
      {/if}
    {/each}
  </div>
{/if}

<style>
  @keyframes slide-in {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  .animate-slide-in {
    animation: slide-in 0.2s ease-out;
  }
</style>
