<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
  import * as Tooltip from './ui/tooltip/index.js';
  import { Button } from './ui/button/index.js';
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface Props extends Omit<HTMLButtonAttributes, 'class' | 'children'> {
    tooltip: string;
    href?: string;
    target?: string;
    rel?: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm';
    side?: 'top' | 'right' | 'bottom' | 'left';
    class?: string;
    onclick?: (e: MouseEvent) => void;
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
    href,
    target,
    rel,
    children,
    ...restProps
  }: Props = $props();
</script>

<Tooltip.Root>
  <Tooltip.Trigger>
    {#snippet child({ props })}
      {@const buttonProps = { ...props, ...restProps, href, target, rel, variant, size, type, class: className, 'aria-label': restProps['aria-label'] ?? tooltip, onclick, disabled, tabindex } as any}
      <Button {...buttonProps}>
        {@render children()}
      </Button>
    {/snippet}
  </Tooltip.Trigger>
  <Tooltip.Content {side}>{tooltip}</Tooltip.Content>
</Tooltip.Root>
