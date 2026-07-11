<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Tooltip as TooltipPrimitive } from 'bits-ui';
	import * as Tooltip from '../../src/components/ui/tooltip/index.js';

	type TetherPayload = {
		label: string;
		styleKind: 'object' | 'string' | 'null';
	};

	const tether = Tooltip.createTether<TetherPayload>();
	const objectStyle: TooltipPrimitive.ContentProps['style'] = {
		color: 'rgb(1, 2, 3)',
		'--tooltip-test-state': 'ready',
	};
	const contentDirection: TooltipPrimitive.ContentProps['dir'] = 'rtl';
	let completedStates = $state<boolean[]>([]);
</script>

<span id="existing-tether-first">Existing first description</span>
<span id="existing-tether-second">Existing second description</span>
<span id="existing-tether-third">Existing third description</span>

<Tooltip.Trigger
	id="tether-first"
	{tether}
	aria-describedby="existing-tether-first"
	payload={{ label: 'First payload', styleKind: 'object' }}
>
	{#snippet child({ props })}
		<button {...props} type="button">First detached trigger</button>
	{/snippet}
</Tooltip.Trigger>

<Tooltip.Trigger
	id="tether-second"
	{tether}
	aria-describedby="existing-tether-second"
	payload={{ label: 'Second payload', styleKind: 'null' }}
>
	{#snippet child({ props })}
		<button {...props} type="button">Second detached trigger</button>
	{/snippet}
</Tooltip.Trigger>

<Tooltip.Trigger
	id="tether-third"
	{tether}
	aria-describedby="existing-tether-third"
	payload={{ label: 'Third payload', styleKind: 'string' }}
>
	{#snippet child({ props })}
		<button {...props} type="button">Third detached trigger</button>
	{/snippet}
</Tooltip.Trigger>

<button type="button" data-testid="open-second-tether" onclick={() => tether.open('tether-second')}>
	Open second programmatically
</button>

<Tooltip.Root
	{tether}
	onOpenChangeComplete={(open) => (completedStates = [...completedStates, open])}
>
	{#snippet children({ payload, triggerId })}
		<Tooltip.Content
			dir={contentDirection}
			style={payload?.styleKind === 'object'
				? objectStyle
				: payload?.styleKind === 'string'
					? 'color: rgb(4, 5, 6)'
					: null}
		>
			{#snippet child({ props, open })}
				{@const elementProps = props as HTMLAttributes<HTMLDivElement>}
				<div {...elementProps} data-testid="tether-tooltip-content">
					{payload?.label}:{triggerId}:{open}
				</div>
			{/snippet}
		</Tooltip.Content>
	{/snippet}
</Tooltip.Root>

<output data-testid="tether-completed-states">{completedStates.join(',')}</output>
