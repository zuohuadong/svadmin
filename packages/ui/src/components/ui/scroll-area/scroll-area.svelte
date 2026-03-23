<script lang="ts">
	import type { Snippet } from "svelte";
	import { cn } from "../../../utils.js";

	let { class: className, children, orientation = 'vertical', ...restProps }:
		{ class?: string; children: Snippet; orientation?: 'vertical' | 'horizontal' } & Record<string, unknown> = $props();
</script>

<div
	class={cn("relative overflow-hidden", className)}
	{...restProps}
>
	<div class={cn(
		"h-full w-full overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground/50",
		orientation === 'horizontal' ? 'overflow-x-auto overflow-y-hidden' : 'overflow-y-auto overflow-x-hidden'
	)}>
		{@render children()}
	</div>
</div>

<style>
	/* Custom scrollbar styling */
	:global(.scrollbar-thin) {
		scrollbar-width: thin;
		scrollbar-color: hsl(var(--border)) transparent;
	}
	:global(.scrollbar-thin:hover) {
		scrollbar-color: hsl(var(--muted-foreground) / 0.5) transparent;
	}
	:global(.scrollbar-thin::-webkit-scrollbar) {
		width: 8px;
		height: 8px;
	}
	:global(.scrollbar-thin::-webkit-scrollbar-track) {
		background: transparent;
	}
	:global(.scrollbar-thin::-webkit-scrollbar-thumb) {
		background-color: hsl(var(--border));
		border-radius: 9999px;
		border: 2px solid transparent;
		background-clip: content-box;
	}
	:global(.scrollbar-thin::-webkit-scrollbar-thumb:hover) {
		background-color: hsl(var(--muted-foreground) / 0.5);
	}
</style>
