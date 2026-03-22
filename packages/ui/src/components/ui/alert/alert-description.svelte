<script lang="ts">
	import { cn, type WithElementRef } from "../../../utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	type Props = WithElementRef<HTMLAttributes<HTMLDivElement>>;

	let { ref = $bindable(null), class: className, children, ...restProps }: Props = $props();
</script>

<div
	bind:this={ref}
	data-slot="alert-description"
	class={cn("col-start-2 text-sm [&_p]:leading-relaxed text-muted-foreground", className)}
	{...restProps}
>
	{@render children?.()}
</div>
