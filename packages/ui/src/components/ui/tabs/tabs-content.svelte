<script lang="ts">
	import { cn, type WithElementRef } from "../../../utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	type Props = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		value: string;
		active?: boolean;
	};

	let {
		ref = $bindable(null),
		value,
		active = false,
		class: className,
		children,
		...restProps
	}: Props = $props();
</script>

{#if active}
	<div
		bind:this={ref}
		data-slot="tabs-content"
		role="tabpanel"
		class={cn("flex-1 outline-none", className)}
		{...restProps}
	>
		{@render children?.()}
	</div>
{/if}
