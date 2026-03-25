<script lang="ts">
  import { Button } from './ui/button/index.js';
  import { Progress } from './ui/progress/index.js';
  import { t } from '@svadmin/core/i18n';
  import { slide } from 'svelte/transition';
  import { X, Undo2 } from 'lucide-svelte';

  let { message, duration = 5000, onUndo, onTimeout } = $props<{
    message: string;
    duration?: number;
    onUndo: () => void;
    onTimeout: () => void;
  }>();

  let remaining = $state(0);
  let dismissed = $state(false);

  // Initialize remaining from prop
  $effect.pre(() => {
    remaining = duration;
  });

  $effect(() => {
    const interval = setInterval(() => {
      remaining -= 100;
      if (remaining <= 0) {
        clearInterval(interval);
        if (!dismissed) {
          dismissed = true;
          onTimeout();
        }
      }
    }, 100);
    return () => clearInterval(interval);
  });

  function handleUndo() {
    dismissed = true;
    onUndo();
  }

  function handleDismiss() {
    dismissed = true;
    onTimeout();
  }

  const progressValue = $derived(remaining / duration * 100);
</script>

{#if !dismissed}
  <div
    class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] min-w-80 max-w-lg rounded-xl border bg-card shadow-2xl overflow-hidden"
    transition:slide={{ duration: 250 }}
  >
    <div class="flex items-center justify-between px-4 py-3 gap-3">
      <p class="text-sm text-foreground">{message}</p>
      <div class="flex items-center gap-1 flex-shrink-0">
        <Button variant="ghost" size="sm" onclick={handleUndo} class="font-semibold text-primary">
          <Undo2 class="h-3.5 w-3.5 mr-1" />
          {t('common.undo')}
        </Button>
        <Button variant="ghost" size="icon" class="h-7 w-7" onclick={handleDismiss}>
          <X class="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
    <Progress value={progressValue} class="h-1 rounded-none" />
  </div>
{/if}
