<script lang="ts">
	import { cn, type WithElementRef } from "../../../utils.js";
	import type { HTMLSelectAttributes } from "svelte/elements";

	type Props = WithElementRef<HTMLSelectAttributes> & {
		placeholder?: string;
	};

	let {
		ref = $bindable(null),
		value = $bindable(""),
		class: className,
		placeholder,
		children,
		...restProps
	}: Props = $props();
</script>

<select
	bind:this={ref}
	data-slot="select"
	class={cn(
		"dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 h-9 w-full appearance-none rounded-lg border bg-transparent px-3 py-1.5 text-base transition-colors focus-visible:ring-3 aria-invalid:ring-3 md:text-sm placeholder:text-muted-foreground outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-[length:16px] bg-[right_8px_center] bg-no-repeat",
		"bg-[url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")]",
		className
	)}
	bind:value
	{...restProps}
>
	{#if placeholder}
		<option value="" disabled selected>{placeholder}</option>
	{/if}
	{@render children?.()}
</select>
