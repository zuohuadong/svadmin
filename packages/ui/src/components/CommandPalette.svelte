<script lang="ts">
  import { getResources } from '@svadmin/core';
  import { navigate } from '@svadmin/core/router';
  import { t } from '@svadmin/core/i18n';
  import { toggleTheme } from '@svadmin/core';
  import { Search, LayoutDashboard, Plus, Sun, Moon, Settings, FileText } from 'lucide-svelte';

  let { open = $bindable(false) } = $props<{ open?: boolean }>();
  let searchValue = $state('');
  let selectedIndex = $state(0);

  const resources = getResources();

  interface CommandItem {
    id: string;
    label: string;
    icon: typeof Search;
    group: string;
    action: () => void;
  }

  const allItems = $derived<CommandItem[]>([
    // Navigation
    { id: 'home', label: t('common.home'), icon: LayoutDashboard, group: t('common.home'), action: () => { navigate('/'); close(); } },
    ...resources.map(r => ({
      id: `nav-${r.name}`,
      label: r.label,
      icon: FileText,
      group: t('common.home'),
      action: () => { navigate(`/${r.name}`); close(); },
    })),
    // Actions
    ...resources.map(r => ({
      id: `create-${r.name}`,
      label: `${t('common.create')} ${r.label}`,
      icon: Plus,
      group: t('common.actions'),
      action: () => { navigate(`/${r.name}/create`); close(); },
    })),
    // Settings
    { id: 'toggle-theme', label: t('common.toggleTheme'), icon: Sun, group: t('common.actions'), action: () => { toggleTheme(); close(); } },
  ]);

  const filtered = $derived(
    searchValue.trim()
      ? allItems.filter(item =>
          item.label.toLowerCase().includes(searchValue.toLowerCase())
        )
      : allItems
  );

  const groups = $derived(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of filtered) {
      const list = map.get(item.group) ?? [];
      list.push(item);
      map.set(item.group, list);
    }
    return map;
  });

  function close() {
    open = false;
    searchValue = '';
    selectedIndex = 0;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, filtered.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
    } else if (e.key === 'Escape') {
      close();
    }
  }

  $effect(() => {
    if (searchValue) selectedIndex = 0;
  });
</script>

{#if open}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="command-backdrop"
    onclick={close}
  ></div>

  <!-- Dialog -->
  <div class="command-dialog" role="dialog" aria-modal="true">
    <div class="command-input-wrapper">
      <Search class="command-search-icon" />
      <!-- svelte-ignore a11y_autofocus -->
      <input
        class="command-input"
        placeholder={t('common.search')}
        bind:value={searchValue}
        onkeydown={handleKeydown}
        autofocus
      />
      <kbd class="command-kbd">ESC</kbd>
    </div>

    <div class="command-list">
      {#each [...groups().entries()] as [groupName, items]}
        <div class="command-group">
          <div class="command-group-heading">{groupName}</div>
          {#each items as item, i}
            {@const globalIndex = filtered.indexOf(item)}
            <button
              class="command-item"
              class:selected={globalIndex === selectedIndex}
              onclick={item.action}
              onpointerenter={() => selectedIndex = globalIndex}
            >
              <item.icon class="command-item-icon" />
              <span>{item.label}</span>
            </button>
          {/each}
        </div>
      {/each}

      {#if filtered.length === 0}
        <div class="command-empty">
          {t('common.noData')}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .command-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9998;
    background: hsl(0 0% 0% / 0.5);
    backdrop-filter: blur(4px);
    animation: fade-in 0.15s ease-out;
  }

  .command-dialog {
    position: fixed;
    top: 20%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    width: 560px;
    max-width: 90vw;
    background: hsl(var(--popover));
    color: hsl(var(--popover-foreground));
    border: 1px solid hsl(var(--border));
    border-radius: 0.75rem;
    box-shadow: 0 16px 48px hsl(0 0% 0% / 0.2);
    overflow: hidden;
    animation: scale-in 0.15s ease-out;
  }

  .command-input-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid hsl(var(--border));
  }

  :global(.command-search-icon) {
    width: 1rem;
    height: 1rem;
    color: hsl(var(--muted-foreground));
    flex-shrink: 0;
  }

  .command-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: 0.875rem;
    color: hsl(var(--foreground));
  }
  .command-input::placeholder {
    color: hsl(var(--muted-foreground));
  }

  .command-kbd {
    font-size: 0.625rem;
    font-family: inherit;
    background: hsl(var(--muted));
    color: hsl(var(--muted-foreground));
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    border: 1px solid hsl(var(--border));
  }

  .command-list {
    max-height: 320px;
    overflow-y: auto;
    padding: 0.25rem;
  }

  .command-group {
    padding: 0.25rem 0;
  }

  .command-group-heading {
    padding: 0.375rem 0.5rem;
    font-size: 0.6875rem;
    font-weight: 600;
    color: hsl(var(--muted-foreground));
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .command-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem 0.5rem;
    font-size: 0.8125rem;
    border: none;
    background: none;
    color: hsl(var(--foreground));
    border-radius: 0.375rem;
    cursor: pointer;
    text-align: left;
    transition: background 0.1s;
  }

  .command-item:hover,
  .command-item.selected {
    background: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
  }

  :global(.command-item-icon) {
    width: 0.875rem;
    height: 0.875rem;
    color: hsl(var(--muted-foreground));
    flex-shrink: 0;
  }

  .command-empty {
    padding: 2rem 1rem;
    text-align: center;
    font-size: 0.8125rem;
    color: hsl(var(--muted-foreground));
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scale-in {
    from { opacity: 0; transform: translateX(-50%) scale(0.96); }
    to { opacity: 1; transform: translateX(-50%) scale(1); }
  }
</style>
