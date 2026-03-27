<script lang="ts">
  /**
   * LiteAlert — Success/error feedback banner for form actions.
   * Renders from SvelteKit form action results.
   */
  interface Props {
    type: 'success' | 'error' | 'info';
    message: string;
  }

  let { type, message }: Props = $props();
</script>

{#if message}
  <div class="lite-alert {type === 'success' ? 'lite-alert-success' : type === 'error' ? 'lite-alert-error' : ''}">
    {#if type === 'success'}✓{:else if type === 'error'}✗{:else}ℹ{/if}
    {message}
  </div>
{/if}
