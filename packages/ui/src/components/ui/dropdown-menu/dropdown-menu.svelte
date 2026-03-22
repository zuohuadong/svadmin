<script lang="ts">
	import { cn, type WithElementRef } from "../../../utils.js";
	import type { HTMLAttributes, HTMLButtonAttributes } from "svelte/elements";

	type Props = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	};

	let {
		ref = $bindable(null),
		open = $bindable(false),
		onOpenChange,
		class: className,
		children,
		...restProps
	}: Props = $props();

	function handleClickOutside(e: MouseEvent) {
		if (ref && !ref.contains(e.target as Node)) {
			open = false;
			onOpenChange?.(false);
		}
	}

	$effect(() => {
		if (open) {
			document.addEventListener('click', handleClickOutside, true);
			return () => document.removeEventListener('click', handleClickOutside, true);
		}
	});
</script>

<div
	bind:this={ref}
	data-slot="dropdown-menu"
	class={cn("relative inline-block", className)}
	{...restProps}
>
	{@render children?.()}
</div>
