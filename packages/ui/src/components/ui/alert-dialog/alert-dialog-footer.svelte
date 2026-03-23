<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "../../../utils.js";

	let { class: className, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div class={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...restProps}></div>
