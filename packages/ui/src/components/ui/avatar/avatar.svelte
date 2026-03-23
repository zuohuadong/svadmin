<script lang="ts">
	import { cn, type WithElementRef } from "../../../utils.js";
	import type { HTMLImgAttributes } from "svelte/elements";
	import { type VariantProps, tv } from "tailwind-variants";

	export const avatarVariants = tv({
		base: "relative flex shrink-0 overflow-hidden rounded-full",
		variants: {
			size: {
				default: "size-10",
				sm: "size-8",
				lg: "size-12",
				xl: "size-16",
			},
		},
		defaultVariants: { size: "default" },
	});

	// AvatarSize type is exported from the package index.ts
	type AvatarSize = VariantProps<typeof avatarVariants>["size"];

	type Props = WithElementRef<HTMLImgAttributes> & {
		size?: AvatarSize;
		fallback?: string;
	};

	let {
		ref = $bindable(null),
		src,
		alt = "",
		size = "default",
		fallback,
		class: className,
		...restProps
	}: Props = $props();

	let imgError = $state(false);
</script>

{#if src && !imgError}
	<span class={cn(avatarVariants({ size }), className)}>
		<img
			bind:this={ref}
			data-slot="avatar"
			{src}
			{alt}
			class="aspect-square h-full w-full object-cover"
			onerror={() => { imgError = true; }}
			{...restProps}
		/>
	</span>
{:else}
	<span
		data-slot="avatar-fallback"
		class={cn(
			avatarVariants({ size }),
			"flex items-center justify-center bg-muted text-muted-foreground font-medium text-sm",
			className
		)}
	>
		{fallback ?? alt?.charAt(0).toUpperCase() ?? "?"}
	</span>
{/if}
