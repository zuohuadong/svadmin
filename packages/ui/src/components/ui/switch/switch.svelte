<script lang="ts">
	import { cn, type WithElementRef } from "../../../utils.js";
	import type { HTMLButtonAttributes } from "svelte/elements";

	type Props = WithElementRef<HTMLButtonAttributes, HTMLButtonElement> & {
		checked?: boolean;
		disabled?: boolean;
		onCheckedChange?: (checked: boolean) => void;
	};

	let {
		ref = $bindable(null),
		checked = $bindable(false),
		disabled = false,
		onCheckedChange,
		class: className,
		...restProps
	}: Props = $props();

	function toggle() {
		if (disabled) return;
		checked = !checked;
		onCheckedChange?.(checked);
	}
</script>

<button
	bind:this={ref}
	type="button"
	role="switch"
	aria-checked={checked}
	data-state={checked ? "checked" : "unchecked"}
	data-slot="switch"
	{disabled}
	class={cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-transparent shadow-xs transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm",
		checked ? "bg-primary" : "bg-input dark:bg-input/80",
		className
	)}
	onclick={toggle}
	{...restProps}
>
	<span
		class={cn(
			"pointer-events-none block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
			checked ? "translate-x-4" : "translate-x-0"
		)}
	></span>
</button>
