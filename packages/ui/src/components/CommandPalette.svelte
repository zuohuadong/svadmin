<script lang="ts">
  import { getResources } from '@svadmin/core';
  import { navigate } from '@svadmin/core/router';
  import { t } from '@svadmin/core/i18n';
  import { toggleTheme } from '@svadmin/core';
  import { Command } from 'cmdk-sv';
  import * as Dialog from './ui/dialog/index.js';
  import { Search, LayoutDashboard, Plus, Sun, FileText } from 'lucide-svelte';

  let { open = $bindable(false) } = $props<{ open?: boolean }>();
  let searchValue = $state('');

  const resources = getResources();

  function close() {
    open = false;
    searchValue = '';
  }

  function act(fn: () => void) {
    fn();
    close();
  }

  const itemClass = 'relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50';
</script>

<Dialog.Dialog bind:open>
  <Dialog.DialogContent class="overflow-hidden p-0 sm:max-w-[560px]">
    <Command.Root class="flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground [&_[data-cmdk-group-heading]]:text-muted-foreground [&_[data-cmdk-group-heading]]:px-2 [&_[data-cmdk-group-heading]]:py-1.5 [&_[data-cmdk-group-heading]]:text-xs [&_[data-cmdk-group-heading]]:font-semibold [&_[data-cmdk-group-heading]]:uppercase [&_[data-cmdk-group-heading]]:tracking-wider">
      <div class="flex items-center border-b px-3" data-cmdk-input-wrapper="">
        <Search class="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <Command.Input
          bind:value={searchValue}
          placeholder={t('common.search')}
          class="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        />
        <kbd class="ml-2 text-[10px] font-mono font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">ESC</kbd>
      </div>
      <Command.List class="max-h-[320px] overflow-y-auto overflow-x-hidden p-1">
        <Command.Empty class="py-6 text-center text-sm text-muted-foreground">
          {t('common.noData')}
        </Command.Empty>

        <!-- Navigation -->
        <Command.Group heading={t('common.home')}>
          <Command.Item
            value="home"
            onSelect={() => act(() => navigate('/'))}
            class={itemClass}
          >
            <LayoutDashboard class="h-4 w-4 text-muted-foreground" />
            {t('common.home')}
          </Command.Item>
          {#each resources as r}
            <Command.Item
              value={r.name}
              onSelect={() => act(() => navigate(`/${r.name}`))}
              class={itemClass}
            >
              <FileText class="h-4 w-4 text-muted-foreground" />
              {r.label}
            </Command.Item>
          {/each}
        </Command.Group>

        <Command.Separator class="mx-1 my-1 h-px bg-border" />

        <!-- Actions -->
        <Command.Group heading={t('common.actions')}>
          {#each resources as r}
            <Command.Item
              value="create-{r.name}"
              onSelect={() => act(() => navigate(`/${r.name}/create`))}
              class={itemClass}
            >
              <Plus class="h-4 w-4 text-muted-foreground" />
              {t('common.create')} {r.label}
            </Command.Item>
          {/each}
          <Command.Item
            value="toggle-theme"
            onSelect={() => act(() => toggleTheme())}
            class={itemClass}
          >
            <Sun class="h-4 w-4 text-muted-foreground" />
            {t('common.toggleTheme')}
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Dialog.DialogContent>
</Dialog.Dialog>
