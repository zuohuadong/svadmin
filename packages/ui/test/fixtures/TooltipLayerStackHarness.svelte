<script lang="ts">
	import * as Tooltip from '../../src/components/ui/tooltip/index.js';

	type LayerBehavior =
		| 'close'
		| 'defer-otherwise-close'
		| 'defer-otherwise-ignore'
		| 'ignore';

	let {
		outerInteract = 'close',
		innerInteract = 'defer-otherwise-close',
		outerEscape = 'close',
		innerEscape = 'defer-otherwise-close',
	}: {
		outerInteract?: LayerBehavior;
		innerInteract?: LayerBehavior;
		outerEscape?: LayerBehavior;
		innerEscape?: LayerBehavior;
	} = $props();

	let outerOpen = $state(false);
	let innerOpen = $state(false);
	let events = $state<string[]>([]);

	function openStack() {
		outerOpen = true;
		innerOpen = true;
	}

	function record(event: string) {
		events = [...events, event];
	}
</script>

<button type="button" data-testid="layer-open" onclick={openStack}>Open layer stack</button>
<button type="button" data-testid="layer-outside">Outside target</button>

<Tooltip.Root bind:open={outerOpen}>
	<Tooltip.Trigger>
		{#snippet child({ props })}
			<button {...props} type="button">Outer trigger</button>
		{/snippet}
	</Tooltip.Trigger>
	<Tooltip.Content
		data-testid="outer-tooltip-layer"
		interactOutsideBehavior={outerInteract}
		escapeKeydownBehavior={outerEscape}
		onInteractOutside={() => record('outer-pointer')}
		onFocusOutside={() => record('outer-focus')}
		onEscapeKeydown={() => record('outer-escape')}
	>
		Outer layer
		<Tooltip.Root bind:open={innerOpen}>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<button {...props} type="button">Inner trigger</button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content
				data-testid="inner-tooltip-layer"
				interactOutsideBehavior={innerInteract}
				escapeKeydownBehavior={innerEscape}
				onInteractOutside={() => record('inner-pointer')}
				onFocusOutside={() => record('inner-focus')}
				onEscapeKeydown={() => record('inner-escape')}
			>
				Inner layer
			</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Content>
</Tooltip.Root>

<output data-testid="layer-open-states">{outerOpen},{innerOpen}</output>
<output data-testid="layer-events">{events.join(',')}</output>
