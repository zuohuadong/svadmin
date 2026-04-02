<script lang="ts">
	import { cn, type WithElementRef } from "../../../utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import { getContext } from "svelte";

	type Props = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		align?: "start" | "center" | "end";
	};

	let {
		ref = $bindable(null),
		align = "end",
		class: className,
		children,
		...restProps
	}: Props = $props();

	let isOpen = $derived(getContext<() => boolean>("svadmin-dropdown-open")?.() ?? true);
</script>

{#if isOpen}
<div
	bind:this={ref}
	data-slot="dropdown-menu-content"
	class={cn("bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-lg p-1 shadow-lg",
		"absolute mt-1 animate-in fade-in-0 zoom-in-95",
		align === "end" ? "right-0" : align === "start" ? "left-0" : "left-1/2 -translate-x-1/2",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
{/if}
