<script lang="ts">
  import { cn } from '../../../utils.js';
  import type { Snippet } from 'svelte';
  import type { HTMLOlAttributes } from 'svelte/elements';

  let { class: className, children, ...restProps }: HTMLOlAttributes & { children?: Snippet } = $props();
</script>

<ol
  data-slot="breadcrumb-list"
  class={cn("text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm wrap-break-word sm:gap-2.5", className)}
  {...restProps}
>
  {@render children?.()}
</ol>
