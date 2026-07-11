<script lang="ts">
	import { Command as CommandPrimitive } from "bits-ui";
	import { cn } from "../../../utils.js";

	let {
		ref = $bindable(null),
		class: className,
		alwaysRender,
		forceMount,
		...restProps
	}: CommandPrimitive.SeparatorProps & {
		alwaysRender?: boolean;
	} = $props();
</script>

<CommandPrimitive.Separator
	bind:ref
	data-slot="command-separator"
	data-cmdk-separator=""
	class={cn("bg-border -mx-1 h-px", className)}
	forceMount={alwaysRender ?? forceMount}
	{...restProps}
/>
