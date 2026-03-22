<script lang="ts">
	import { cn, type WithElementRef } from "../../../utils.js";
	import type { HTMLButtonAttributes } from "svelte/elements";

	type Props = WithElementRef<HTMLButtonAttributes> & {
		inset?: boolean;
		destructive?: boolean;
	};

	let {
		ref = $bindable(null),
		inset = false,
		destructive = false,
		class: className,
		children,
		...restProps
	}: Props = $props();
</script>

<button
	bind:this={ref}
	type="button"
	data-slot="dropdown-menu-item"
	class={cn(
		"relative flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors [&_svg]:size-4 [&_svg]:shrink-0",
		destructive
			? "text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
			: "hover:bg-accent focus:bg-accent focus:text-accent-foreground",
		"disabled:pointer-events-none disabled:opacity-50",
		inset && "pl-8",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</button>
