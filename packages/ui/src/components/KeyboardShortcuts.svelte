<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import * as Dialog from './ui/dialog/index.js';

  let { open = $bindable(false) }: { open?: boolean } = $props();

  interface Shortcut {
    keys: string[];
    label: string;
  }

  const shortcuts: { group: string; items: Shortcut[] }[] = [
    {
      group: 'Navigation',
      items: [
        { keys: ['⌘', 'K'], label: 'Open command palette' },
        { keys: ['?'], label: 'Show keyboard shortcuts' },
      ],
    },
    {
      group: 'Table',
      items: [
        { keys: ['⌘', 'F'], label: 'Focus search' },
        { keys: ['Esc'], label: 'Close dialog / cancel' },
      ],
    },
    {
      group: 'Theme',
      items: [
        { keys: ['⌘', 'D'], label: 'Toggle dark mode' },
      ],
    },
  ];
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="max-w-md">
    <Dialog.Header>
      <Dialog.Title>{t('common.keyboardShortcuts') || 'Keyboard Shortcuts'}</Dialog.Title>
    </Dialog.Header>
    <div class="space-y-4 py-2">
      {#each shortcuts as group}
        <div>
          <h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{group.group}</h4>
          <div class="space-y-1.5">
            {#each group.items as shortcut}
              <div class="flex items-center justify-between py-1">
                <span class="text-sm text-foreground">{shortcut.label}</span>
                <div class="flex items-center gap-1">
                  {#each shortcut.keys as key}
                    <kbd class="inline-flex h-5 min-w-5 items-center justify-center rounded bg-muted px-1.5 text-[10px] font-medium font-mono text-muted-foreground shadow-sm">{key}</kbd>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </Dialog.Content>
</Dialog.Root>
