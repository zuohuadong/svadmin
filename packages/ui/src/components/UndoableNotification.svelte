<script lang="ts">
  import { Button } from './ui/button/index.js';
  import { X, Undo2 } from 'lucide-svelte';

  let { message, duration = 5000, onUndo, onTimeout } = $props<{
    message: string;
    duration?: number;
    onUndo: () => void;
    onTimeout: () => void;
  }>();

  let remaining = $state(duration);
  let dismissed = $state(false);

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

  function handleUndo() {
    clearInterval(interval);
    dismissed = true;
    onUndo();
  }

  function handleDismiss() {
    clearInterval(interval);
    dismissed = true;
    onTimeout();
  }

  const progress = $derived(remaining / duration * 100);
</script>

{#if !dismissed}
  <div class="undoable-notification">
    <div class="undoable-content">
      <p class="undoable-message">{message}</p>
      <div class="undoable-actions">
        <Button variant="ghost" size="sm" onclick={handleUndo} class="undoable-undo-btn">
          <Undo2 class="h-3.5 w-3.5 mr-1" />
          Undo
        </Button>
        <button class="undoable-close" onclick={handleDismiss}>
          <X class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
    <div class="undoable-progress">
      <div class="undoable-progress-bar" style="width: {progress}%"></div>
    </div>
  </div>
{/if}

<style>
  .undoable-notification {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    min-width: 320px;
    max-width: 480px;
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    border-radius: 0.75rem;
    box-shadow: 0 8px 32px hsl(0 0% 0% / 0.15);
    overflow: hidden;
    animation: slideUp 0.3s ease;
  }

  .undoable-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    gap: 0.75rem;
  }

  .undoable-message {
    font-size: 0.875rem;
    color: hsl(var(--foreground));
    margin: 0;
  }

  .undoable-actions {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  :global(.undoable-undo-btn) {
    font-weight: 600;
    color: hsl(var(--primary)) !important;
  }

  .undoable-close {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    color: hsl(var(--muted-foreground));
    border-radius: 0.25rem;
  }
  .undoable-close:hover {
    color: hsl(var(--foreground));
    background: hsl(var(--muted));
  }

  .undoable-progress {
    height: 3px;
    background: hsl(var(--muted));
  }

  .undoable-progress-bar {
    height: 100%;
    background: hsl(var(--primary));
    transition: width 100ms linear;
  }

  @keyframes slideUp {
    from { transform: translateX(-50%) translateY(100%); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
</style>
