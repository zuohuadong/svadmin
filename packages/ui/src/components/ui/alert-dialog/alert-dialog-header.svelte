<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "../../../utils.js";

	let { class: className, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div class={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...restProps}></div>
