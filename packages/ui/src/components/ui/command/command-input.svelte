<script lang="ts">
	import { Command as CommandPrimitive } from "bits-ui";
	import { cn } from "../../../utils.js";

	let {
		ref = $bindable(null),
		value = $bindable(""),
		class: className,
		...restProps
	}: CommandPrimitive.InputProps = $props();
</script>

<CommandPrimitive.Input
	bind:ref
	bind:value
	data-slot="command-input"
	data-cmdk-input=""
	class={cn(
		"w-full bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50",
		className
	)}
	{...restProps}
/>
