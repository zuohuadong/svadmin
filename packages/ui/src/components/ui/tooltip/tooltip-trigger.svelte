<script lang="ts" generics="Payload = never">
	import { Tooltip as TooltipPrimitive } from "bits-ui";
	import {
		getTooltipTetherBridge,
		tryGetTooltipLayerContext,
	} from "./tooltip-context.svelte.js";

	type PointerHandler = NonNullable<TooltipPrimitive.TriggerProps["onpointerenter"]>;
	type TriggerPointerEvent = Parameters<PointerHandler>[0];

	const uid = $props.id();
	let {
		ref = $bindable(null),
		id = `tooltip-trigger-${uid}`,
		"aria-describedby": ariaDescribedBy,
		onpointerenter,
		onpointerleave,
		tether,
		...restProps
	}: TooltipPrimitive.TriggerProps<Payload> = $props();

	const localTooltip = tryGetTooltipLayerContext();
	const tetherBridge = $derived(tether ? getTooltipTetherBridge(tether) : undefined);
	const tooltip = $derived(tether ? tetherBridge?.layer : localTooltip);

	$effect(() => {
		const currentBridge = tetherBridge;
		if (currentBridge) return currentBridge.registerTrigger(id, () => ref);
		if (!localTooltip) return;
		return localTooltip.registerTrigger(id, () => ref);
	});

	const describedBy = $derived.by(() => {
		const ids = [ariaDescribedBy, tooltip?.isActiveTrigger(id) ? tooltip.contentId : undefined]
			.flatMap((value) => value?.split(/\s+/) ?? [])
			.filter(Boolean);
		return [...new Set(ids)].join(" ") || undefined;
	});

	function handlePointerEnter(event: TriggerPointerEvent) {
		tooltip?.cancelScheduledClose();
		onpointerenter?.(event);
	}

	function handlePointerLeave(event: TriggerPointerEvent) {
		onpointerleave?.(event);
		if (!event.defaultPrevented) tooltip?.scheduleClose();
	}
</script>

<TooltipPrimitive.Trigger
	bind:ref
	{...restProps}
	{id}
	{tether}
	aria-describedby={describedBy}
	data-slot="tooltip-trigger"
	onpointerenter={handlePointerEnter}
	onpointerleave={handlePointerLeave}
/>
