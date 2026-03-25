<script lang="ts">
  import * as AlertDialog from './ui/alert-dialog/index.js';
  import { Button } from './ui/button/index.js';
  import { t } from '@svadmin/core/i18n';

  let { open = $bindable(false), title, message = '',
    confirmText, cancelText, variant = 'danger',
    onconfirm, oncancel } = $props<{
    open?: boolean;
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

<AlertDialog.Root bind:open onOpenChange={(v: boolean) => { if (!v) oncancel(); }}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>{resolvedTitle}</AlertDialog.Title>
      <AlertDialog.Description>{message}</AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>
        {#snippet child({ props })}
          <Button variant="outline" {...props} onclick={oncancel}>
            {resolvedCancelText}
          </Button>
        {/snippet}
      </AlertDialog.Cancel>
      <AlertDialog.Action>
        {#snippet child({ props })}
          <Button variant={variantMap[variant as keyof typeof variantMap]} {...props} onclick={onconfirm}>
            {resolvedConfirmText}
          </Button>
        {/snippet}
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
