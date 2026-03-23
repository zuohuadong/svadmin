<script lang="ts">
  import * as Dialog from './ui/dialog/index.js';
  import { Button } from './ui/button/index.js';
  import { t } from '@svadmin/core/i18n';

  let { open = false, title, message = '',
    confirmText, cancelText, variant = 'danger',
    onconfirm, oncancel } = $props<{
    open: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onconfirm: () => void;
    oncancel: () => void;
  }>();

  const variantMap = {
    danger: 'destructive' as const,
    warning: 'destructive' as const,
    info: 'default' as const,
  };

  const resolvedTitle = $derived(title ?? t('common.confirmAction'));
  const resolvedConfirmText = $derived(confirmText ?? t('common.confirm'));
  const resolvedCancelText = $derived(cancelText ?? t('common.cancel'));
</script>

<Dialog.Root bind:open onOpenChange={(v: boolean) => { if (!v) oncancel(); }}>
  <Dialog.Content showCloseButton={false} class="sm:max-w-md">
    <Dialog.Header>
      <Dialog.Title>{resolvedTitle}</Dialog.Title>
      <Dialog.Description>{message}</Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Button variant="outline" onclick={oncancel}>
        {resolvedCancelText}
      </Button>
      <Button variant={variantMap[variant as keyof typeof variantMap]} onclick={onconfirm}>
        {resolvedConfirmText}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
