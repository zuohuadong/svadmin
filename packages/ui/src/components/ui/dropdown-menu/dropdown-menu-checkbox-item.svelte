<script lang="ts">
	import { cn, type WithElementRef } from "../../../utils.js";
	import type { HTMLButtonAttributes } from "svelte/elements";

	type Props = WithElementRef<HTMLButtonAttributes, HTMLButtonElement> & {
		checked?: boolean;
		onCheckedChange?: (checked: boolean) => void;
	};

	let {
		ref = $bindable(null),
		class: className,
		checked = false,
		onCheckedChange,
		children,
		...restProps
	}: Props = $props();

	function handleClick() {
		const next = !checked;
		onCheckedChange?.(next);
	}
</script>

<button
	bind:this={ref}
	role="menuitemcheckbox"
	aria-checked={checked}
	data-slot="dropdown-menu-checkbox-item"
	class={cn(
		"relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
		className
	)}
	onclick={handleClick}
	{...restProps}
>
	<span class="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
		{#if checked}
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
		{/if}
	</span>
	{@render children?.()}
</button>
