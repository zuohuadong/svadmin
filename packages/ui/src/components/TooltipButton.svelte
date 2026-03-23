<script lang="ts">
  import * as Tooltip from './ui/tooltip/index.js';
  import { Button } from './ui/button/index.js';
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface Props {
    tooltip: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm';
    side?: 'top' | 'right' | 'bottom' | 'left';
    class?: string;
    onclick?: (e: MouseEvent) => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    tabindex?: number;
    children: Snippet;
  }

  let {
    tooltip,
    variant = 'ghost',
    size = 'icon',
    side = 'top',
    class: className = '',
    onclick,
    disabled = false,
    type = 'button',
    tabindex,
    children,
  }: Props = $props();
</script>

<Tooltip.Root>
  <Tooltip.Trigger>
    {#snippet child({ props })}
      <Button
        {...props}
        {variant}
        {size}
        {type}
        class={className}
        {onclick}
        {disabled}
        {tabindex}
      >
        {@render children()}
      </Button>
    {/snippet}
  </Tooltip.Trigger>
  <Tooltip.Content {side}>{tooltip}</Tooltip.Content>
</Tooltip.Root>
