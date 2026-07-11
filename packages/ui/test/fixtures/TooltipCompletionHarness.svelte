<script lang="ts">
	import * as Tooltip from '../../src/components/ui/tooltip/index.js';

	let open = $state(false);
	let forceMount = $state(false);
	let completedStates = $state<boolean[]>([]);
</script>

<button type="button" data-testid="completion-open" onclick={() => (open = true)}>Open tooltip</button>
<button type="button" data-testid="completion-close" onclick={() => (open = false)}>Close tooltip</button>
<button type="button" data-testid="completion-reopen" onclick={() => (open = true)}>Reopen tooltip</button>
<button type="button" data-testid="completion-force-mount" onclick={() => (forceMount = !forceMount)}>
	Toggle force mount
</button>

<Tooltip.Root bind:open onOpenChangeComplete={(value) => (completedStates = [...completedStates, value])}>
	<Tooltip.Trigger>
		{#snippet child({ props })}
			<button {...props} type="button">Completion trigger</button>
		{/snippet}
	</Tooltip.Trigger>
	<Tooltip.Content {forceMount}>Completion content</Tooltip.Content>
</Tooltip.Root>

<output data-testid="completion-open-state">{open}</output>
<output data-testid="completion-states">{completedStates.join(',')}</output>
