<script lang="ts">
  import { cn, type WithElementRef } from '../../../utils.js';
  import type { HTMLLabelAttributes } from 'svelte/elements';

  let { ref = $bindable(null), class: className, children, ...restProps }: WithElementRef<HTMLLabelAttributes, HTMLLabelElement> = $props();
</script>

<label
  bind:this={ref}
  data-slot="label"
  class={cn(
    "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
    className
  )}
  {...restProps}
>
  {@render children?.()}
</label>
