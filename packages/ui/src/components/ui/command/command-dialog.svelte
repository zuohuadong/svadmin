<script lang="ts">
  import { Command as CommandPrimitive, Dialog as DialogPrimitive } from 'bits-ui';
  import Root from './command.svelte';
  import * as Dialog from '../dialog/index.js';
  import { cn } from '../../../utils.js';
  import type { Snippet } from 'svelte';

  type Props = Omit<CommandPrimitive.RootProps, 'children' | 'value'> &
    Omit<DialogPrimitive.RootProps, 'children' | 'open'> & {
      open?: boolean;
      value?: string;
      class?: string;
      children?: Snippet;
    };

  let {
    open = $bindable(false),
    value = $bindable(''),
    onOpenChange,
    onOpenChangeComplete,
    class: className,
    children,
    ...commandProps
  }: Props = $props();
</script>

<Dialog.Dialog bind:open {onOpenChange} {onOpenChangeComplete}>
  <Dialog.DialogContent
    data-cmdk-dialog=""
    class="overflow-hidden p-0"
  >
    <Dialog.DialogHeader class="sr-only">
      <Dialog.DialogTitle>{commandProps.label || 'Command menu'}</Dialog.DialogTitle>
      <Dialog.DialogDescription>Search for a command to run.</Dialog.DialogDescription>
    </Dialog.DialogHeader>
    <Root
      bind:value
      {...commandProps}
      class={cn(
        "[&_[data-command-group-heading]]:text-muted-foreground flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground [&_[data-command-group-heading]]:px-2 [&_[data-command-group-heading]]:font-medium [&_[data-command-group]:not([hidden])_~[data-command-group]]:pt-0 [&_[data-cmdk-input-wrapper]_svg]:h-5 [&_[data-cmdk-input-wrapper]_svg]:w-5 [&_[data-command-input]]:h-12 [&_[data-command-item]]:px-2 [&_[data-command-item]]:py-3",
        className
      )}
    >
      {@render children?.()}
    </Root>
  </Dialog.DialogContent>
</Dialog.Dialog>
