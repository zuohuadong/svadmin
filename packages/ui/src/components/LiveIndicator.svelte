<script lang="ts">
  import { Wifi, WifiOff, Loader2 } from 'lucide-svelte';

  let {
    status = 'disconnected',
    resource = '',
    lastEvent = null,
    showDetails = false,
  } = $props<{
    status: 'connecting' | 'connected' | 'disconnected';
    resource?: string;
    lastEvent?: { type: string; timestamp?: number } | null;
    showDetails?: boolean;
  }>();

  const statusConfigs = {
    connected: { color: 'var(--live-connected, #22c55e)', label: 'Live', icon: Wifi },
    connecting: { color: 'var(--live-connecting, #f59e0b)', label: 'Connecting...', icon: Loader2 as typeof Wifi },
    disconnected: { color: 'var(--live-disconnected, #ef4444)', label: 'Offline', icon: WifiOff },
  } as const;
  type StatusKey = 'connected' | 'connecting' | 'disconnected';
  const statusConfig = $derived(statusConfigs[status as StatusKey]);

  const timeSinceEvent = $derived(
    lastEvent?.timestamp
      ? Math.floor((Date.now() - lastEvent.timestamp) / 1000)
      : null
  );
</script>

<div class="live-indicator" title={statusConfig.label}>
  <span class="live-dot" style="--dot-color: {statusConfig.color}">
    {#if status === 'connected'}
      <span class="live-pulse"></span>
    {/if}
  </span>
  <span class="live-label" style="color: {statusConfig.color}">
    {statusConfig.label}
  </span>

  {#if showDetails && resource}
    <span class="live-resource">{resource}</span>
  {/if}

  {#if showDetails && lastEvent}
    <span class="live-event">
      {lastEvent.type}
      {#if timeSinceEvent !== null && timeSinceEvent < 60}
        <span class="live-time">{timeSinceEvent}s ago</span>
      {/if}
    </span>
  {/if}
</div>

<style>
  .live-indicator {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    background: hsl(var(--muted) / 0.3);
    user-select: none;
  }

  .live-dot {
    position: relative;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--dot-color);
    flex-shrink: 0;
  }

  .live-pulse {
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: var(--dot-color);
    opacity: 0.4;
    animation: live-pulse 2s ease-in-out infinite;
  }

  @keyframes live-pulse {
    0%, 100% { transform: scale(1); opacity: 0.4; }
    50% { transform: scale(1.8); opacity: 0; }
  }

  .live-label {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .live-resource {
    font-size: 0.625rem;
    color: hsl(var(--muted-foreground));
    font-family: monospace;
  }

  .live-event {
    font-size: 0.625rem;
    color: hsl(var(--muted-foreground));
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .live-time {
    opacity: 0.6;
  }
</style>
