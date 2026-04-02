<script lang="ts">
	import type { HTMLTextareaAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "../../../utils.js";

	type Props = WithElementRef<HTMLTextareaAttributes, HTMLTextAreaElement>;

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		...restProps
	}: Props = $props();
</script>

<textarea
	bind:this={ref}
	data-slot="textarea"
	class={cn("dark:bg-input/30 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:ring-2 aria-invalid:ring-destructive/40 disabled:bg-input/50 dark:disabled:bg-input/80 w-full rounded-lg bg-transparent px-3 py-2 text-base transition-colors focus-visible:ring-3 aria-invalid:ring-3 md:text-sm placeholder:text-muted-foreground min-h-[80px] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 resize-y shadow-sm",
		className
	)}
	bind:value
	{...restProps}
></textarea>
