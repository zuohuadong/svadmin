<script lang="ts">
	import { cn, type WithElementRef } from "../../../utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	type Props = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		open?: boolean;
		side?: "left" | "right";
		onClose?: () => void;
	};

	let {
		ref = $bindable(null),
		open = $bindable(false),
		side = "right",
		onClose,
		class: className,
		children,
		...restProps
	}: Props = $props();

	function close() {
		open = false;
		onClose?.();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Escape") close();
	}

	$effect(() => {
		if (open) {
			document.addEventListener("keydown", handleKeydown);
			document.body.style.overflow = "hidden";
			return () => {
				document.removeEventListener("keydown", handleKeydown);
				document.body.style.overflow = "";
			};
		}
	});
</script>

{#if open}
	<!-- Overlay -->
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 bg-black/80 animate-in fade-in-0"
		onclick={close}
	></div>

	<!-- Sheet panel -->
	<div
		bind:this={ref}
		data-slot="sheet"
		class={cn(
			"fixed z-50 flex flex-col gap-4 bg-background p-6 shadow-lg transition-transform",
			side === "right"
				? "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l animate-in slide-in-from-right"
				: "inset-y-0 left-0 h-full w-3/4 max-w-sm border-r animate-in slide-in-from-left",
			className
		)}
		{...restProps}
	>
		{@render children?.()}

		<!-- Close button -->
		<button
			type="button"
			class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
			onclick={close}
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M18 6 6 18"/><path d="m6 6 12 12"/>
			</svg>
			<span class="sr-only">Close</span>
		</button>
	</div>
{/if}
