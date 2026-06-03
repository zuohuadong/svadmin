<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
  import { Toaster, toast as sonner } from 'sonner-svelte';
  import { getResolvedTheme, getToastQueue, consumeToastQueue, getPromiseQueue, consumePromiseQueue } from '@svadmin/core';

  const theme = $derived(getResolvedTheme() === 'dark' ? 'dark' : 'light');

  $effect(() => {
    const queue = getToastQueue();
    if (queue.length > 0) {
      for (const t of queue) {
        switch (t.type) {
          case 'success': sonner.success(t.message, { duration: t.duration }); break;
          case 'error': sonner.error(t.message, { duration: t.duration }); break;
          case 'warning': sonner.warning(t.message, { duration: t.duration }); break;
          case 'info': sonner.info(t.message, { duration: t.duration }); break;
        }
      }
      consumeToastQueue();
    }
  });

  $effect(() => {
    const pQueue = getPromiseQueue();
    if (pQueue.length > 0) {
      for (const p of pQueue) {
        sonner.promise(p.promise, p.opts);
      }
      consumePromiseQueue();
    }
  });

  const toasterProps = $derived({
    position: "top-right",
    richColors: true,
    closeButton: true,
    expand: true,
    theme,
    toastOptions: {
      classes: {
        toast: 'font-sans',
      },
    }
  } as any);
</script>

<Toaster {...toasterProps} />
