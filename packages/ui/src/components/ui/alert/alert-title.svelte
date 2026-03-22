<script lang="ts">
	import { cn, type WithElementRef } from "../../../utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	type Props = WithElementRef<HTMLAttributes<HTMLHeadingElement>>;

	let { ref = $bindable(null), class: className, children, ...restProps }: Props = $props();
</script>

<h5
	bind:this={ref}
	data-slot="alert-title"
	class={cn("col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight", className)}
	{...restProps}
>
	{@render children?.()}
</h5>
