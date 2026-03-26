<script lang="ts">
	import { cn, type WithElementRef } from "../../../utils.js";
	import type { HTMLButtonAttributes } from "svelte/elements";

	type Props = WithElementRef<HTMLButtonAttributes, HTMLButtonElement>;

	let {
		ref = $bindable(null),
		class: className,
		children,
		child,
		...restProps
	}: Props & { child?: import("svelte").Snippet<[{ props: Record<string, unknown> }]> } = $props();
</script>

{#if child}
	{@render child({ props: { ...restProps, class: cn(className), "data-slot": "dropdown-menu-trigger" } })}
{:else}
	<button
		bind:this={ref}
		data-slot="dropdown-menu-trigger"
		class={cn(className)}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
