<script lang="ts">
  import Toast from './Toast.svelte';

  let firstVisible = $state(true);
  let secondVisible = $state(true);
</script>

<button type="button" data-testid="remove-first-host" onclick={() => (firstVisible = false)}>
  Remove first host
</button>
<button type="button" data-testid="remove-second-host" onclick={() => (secondVisible = false)}>
  Remove second host
</button>

{#if firstVisible}
  <div data-testid="first-toast-host">
    <Toast />
  </div>
{/if}

{#if secondVisible}
  <div data-testid="second-toast-host">
    <Toast />
  </div>
{/if}
