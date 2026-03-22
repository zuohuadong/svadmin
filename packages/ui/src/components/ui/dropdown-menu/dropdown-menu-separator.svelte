<script lang="ts">
	import { cn } from "../../../utils.js";

	let { class: className }: { class?: string } = $props();
</script>

<div
	data-slot="dropdown-menu-separator"
	class={cn("-mx-1 my-1 h-px bg-border", className)}
></div>
