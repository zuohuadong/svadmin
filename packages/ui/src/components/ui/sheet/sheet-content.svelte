<script lang="ts">
	import { cn, type WithElementRef } from "../../../utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	type Props = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		side?: "left" | "right";
	};

	let {
		ref = $bindable(null),
		side = "right",
		class: className,
		children,
		...restProps
	}: Props = $props();
</script>

<div
	bind:this={ref}
	data-slot="sheet-content"
	class={cn(
		"flex flex-col gap-4 h-full",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
