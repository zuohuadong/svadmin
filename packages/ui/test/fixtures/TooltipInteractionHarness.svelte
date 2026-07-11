<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import * as Tooltip from '../../src/components/ui/tooltip/index.js';

	let changedStates = $state<boolean[]>([]);
	let completedStates = $state<boolean[]>([]);
</script>

<span id="existing-interaction-description">Existing interaction description</span>

<Tooltip.Root
	disableHoverableContent={false}
	onOpenChange={(open) => (changedStates = [...changedStates, open])}
	onOpenChangeComplete={(open) => (completedStates = [...completedStates, open])}
>
	<Tooltip.Trigger aria-describedby="existing-interaction-description">
		{#snippet child({ props })}
			<button {...props} type="button">Hover target</button>
		{/snippet}
	</Tooltip.Trigger>
	<Tooltip.Content>
		{#snippet child({ props, open })}
			{@const elementProps = props as HTMLAttributes<HTMLDivElement>}
			<div {...elementProps} data-testid="custom-tooltip-content">{open ? 'Hover content' : ''}</div>
		{/snippet}
	</Tooltip.Content>
</Tooltip.Root>

<output data-testid="tooltip-changed-states">{changedStates.join(',')}</output>
<output data-testid="tooltip-completed-states">{completedStates.join(',')}</output>
