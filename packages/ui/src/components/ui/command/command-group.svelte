<script lang="ts">
	import { Command as CommandPrimitive } from "bits-ui";
	import { cn } from "../../../utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		heading,
		value,
		alwaysRender,
		forceMount,
		...restProps
	}: CommandPrimitive.GroupProps & {
		heading?: string;
		alwaysRender?: boolean;
	} = $props();
</script>

<CommandPrimitive.Group
	bind:ref
	data-slot="command-group"
	data-cmdk-group=""
	class={cn("text-foreground overflow-hidden p-1", className)}
	value={value ?? heading}
	forceMount={alwaysRender ?? forceMount}
	{...restProps}
>
	{#if heading}
		<CommandPrimitive.GroupHeading
			data-slot="command-group-heading"
			data-cmdk-group-heading=""
			class="text-muted-foreground px-2 py-1.5 text-xs font-medium"
		>
			{heading}
		</CommandPrimitive.GroupHeading>
	{/if}
	<CommandPrimitive.GroupItems data-slot="command-group-items" data-cmdk-group-items="">
		{@render children?.()}
	</CommandPrimitive.GroupItems>
</CommandPrimitive.Group>
