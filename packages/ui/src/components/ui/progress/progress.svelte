<script lang="ts">
	import { cn } from "../../../utils.js";

	let { value = 0, max = 100, class: className, ...restProps }:
		{ value?: number; max?: number; class?: string } & Record<string, unknown> = $props();

	const percentage = $derived(Math.min(100, Math.max(0, (value / max) * 100)));
</script>

<div
	class={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)}
	role="progressbar"
	aria-valuenow={value}
	aria-valuemin={0}
	aria-valuemax={max}
	{...restProps}
>
	<div
		class="h-full w-full flex-1 bg-primary transition-all duration-200"
		style="transform: translateX(-{100 - percentage}%)"
	></div>
</div>
