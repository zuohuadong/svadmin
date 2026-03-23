<script lang="ts">
  import { getResources } from '@svadmin/core';
  import { getTheme, getColorTheme } from '@svadmin/core';
  import { getLocale } from '@svadmin/core/i18n';
  import { currentPath } from '@svadmin/core/router';
  import { Button } from './ui/button/index.js';
  import { X, Bug, ChevronDown, ChevronUp, Wand2 } from 'lucide-svelte';
  import InferencerPanel from './InferencerPanel.svelte';

  let visible = $state(false);
  let collapsed = $state(false);
  let activeTab = $state<'state' | 'inferencer'>('state');

  function toggle() {
    visible = !visible;
  }

  // Keyboard shortcut: Ctrl+Shift+D
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggle();
      }
    });
  }

  const resources = $derived((() => { try { return getResources(); } catch { return []; } })());
  const path = $derived(currentPath());
  const theme = $derived(getTheme());
  const colorTheme = $derived(getColorTheme());
  const locale = $derived(getLocale());
</script>

{#if import.meta.env.DEV}
  {#if visible}
    <div class="devtools-panel" class:collapsed>
      <div class="devtools-header">
        <div class="devtools-title">
          <Bug class="h-4 w-4" />
          <span>svadmin DevTools</span>
        </div>
        <div class="devtools-header-actions">
          <button onclick={() => collapsed = !collapsed} class="devtools-btn">
            {#if collapsed}
              <ChevronUp class="h-3.5 w-3.5" />
            {:else}
              <ChevronDown class="h-3.5 w-3.5" />
            {/if}
          </button>
          <button onclick={toggle} class="devtools-btn">
            <X class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {#if !collapsed}
        <div class="devtools-tabs">
          <button class="devtools-tab" class:active={activeTab === 'state'} onclick={() => activeTab = 'state'}>
            State
          </button>
          <button class="devtools-tab" class:active={activeTab === 'inferencer'} onclick={() => activeTab = 'inferencer'}>
            <Wand2 class="h-3 w-3" /> Inferencer
          </button>
        </div>

        <div class="devtools-body">
          {#if activeTab === 'state'}
            <div class="devtools-section">
              <h4>Router</h4>
              <div class="devtools-row">
                <span class="devtools-label">Path</span>
                <code class="devtools-value">{path}</code>
              </div>
            </div>

            <div class="devtools-section">
              <h4>Theme</h4>
              <div class="devtools-row">
                <span class="devtools-label">Mode</span>
                <code class="devtools-value">{theme}</code>
              </div>
              <div class="devtools-row">
                <span class="devtools-label">Color</span>
                <code class="devtools-value">{colorTheme}</code>
              </div>
            </div>

            <div class="devtools-section">
              <h4>i18n</h4>
              <div class="devtools-row">
                <span class="devtools-label">Locale</span>
                <code class="devtools-value">{locale}</code>
              </div>
            </div>

            <div class="devtools-section">
              <h4>Resources ({resources.length})</h4>
              {#each resources as r}
                <div class="devtools-row">
                  <span class="devtools-label">{r.name}</span>
                  <code class="devtools-value">{r.fields.length} fields</code>
                </div>
              {/each}
            </div>
          {:else}
            <InferencerPanel />
          {/if}
        </div>
      {/if}
    </div>
  {:else}
    <button class="devtools-fab" onclick={toggle} title="DevTools (Ctrl+Shift+D)">
      <Bug class="h-4 w-4" />
    </button>
  {/if}
{/if}

<style>
  .devtools-panel {
    position: fixed;
    bottom: 0;
    right: 1rem;
    z-index: 9999;
    width: 420px;
    max-width: 95vw;
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    border-bottom: none;
    border-radius: 0.75rem 0.75rem 0 0;
    box-shadow: 0 -4px 24px hsl(0 0% 0% / 0.12);
    font-size: 0.8125rem;
    overflow: hidden;
  }

  .devtools-panel.collapsed {
    width: auto;
    min-width: 200px;
  }

  .devtools-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    background: hsl(var(--muted));
    border-bottom: 1px solid hsl(var(--border));
  }

  .devtools-title {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-weight: 600;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: hsl(var(--foreground));
  }

  .devtools-header-actions {
    display: flex;
    gap: 0.25rem;
  }

  .devtools-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    color: hsl(var(--muted-foreground));
    border-radius: 0.25rem;
  }
  .devtools-btn:hover {
    background: hsl(var(--accent));
    color: hsl(var(--foreground));
  }

  .devtools-body {
    max-height: 400px;
    overflow-y: auto;
    padding: 0.5rem;
  }

  .devtools-section {
    padding: 0.375rem 0;
  }

  .devtools-section h4 {
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: hsl(var(--muted-foreground));
    margin: 0 0 0.25rem;
    padding: 0 0.25rem;
  }

  .devtools-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.1875rem 0.25rem;
    border-radius: 0.25rem;
  }
  .devtools-row:hover {
    background: hsl(var(--muted) / 0.5);
  }

  .devtools-label {
    color: hsl(var(--foreground));
    font-size: 0.75rem;
  }

  .devtools-value {
    font-size: 0.6875rem;
    color: hsl(var(--primary));
    background: hsl(var(--primary) / 0.1);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-family: monospace;
  }

  .devtools-fab {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    z-index: 9999;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px hsl(var(--primary) / 0.3);
    transition: all 0.2s;
    opacity: 0.6;
  }
  .devtools-fab:hover {
    opacity: 1;
    transform: scale(1.1);
  }
  .devtools-tabs {
    display: flex;
    border-bottom: 1px solid hsl(var(--border));
  }

  .devtools-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    padding: 0.375rem 0.5rem;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: none;
    border: none;
    cursor: pointer;
    color: hsl(var(--muted-foreground));
    border-bottom: 2px solid transparent;
    transition: all 0.15s;
  }

  .devtools-tab:hover {
    color: hsl(var(--foreground));
    background: hsl(var(--muted) / 0.3);
  }

  .devtools-tab.active {
    color: hsl(var(--primary));
    border-bottom-color: hsl(var(--primary));
  }
</style>
