<script lang="ts">
	import { cn, type WithElementRef } from "../../../utils.js";
	import type { HTMLButtonAttributes } from "svelte/elements";

	type Props = WithElementRef<HTMLButtonAttributes, HTMLButtonElement> & {
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

<button
	bind:this={ref}
	type="button"
	role="tab"
	data-slot="tabs-trigger"
	data-state={active ? "active" : "inactive"}
	aria-selected={active}
	class={cn(
		"inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
		active
			? "bg-background text-foreground shadow-sm"
			: "text-muted-foreground hover:text-foreground",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</button>
