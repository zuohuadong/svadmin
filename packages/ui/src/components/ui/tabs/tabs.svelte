<script lang="ts">
	import { cn, type WithElementRef } from "../../../utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	type Props = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		value?: string;
		onValueChange?: (value: string) => void;
	};

	let {
		ref = $bindable(null),
		value = $bindable(""),
		onValueChange,
		class: className,
		children,
		...restProps
	}: Props = $props();
</script>

<div
	bind:this={ref}
	data-slot="tabs"
	class={cn("flex flex-col gap-2", className)}
	{...restProps}
>
	{@render children?.()}
</div>
