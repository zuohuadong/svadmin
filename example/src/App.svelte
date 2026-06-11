<script lang="ts">
  import { setChatProvider } from '@svadmin/core';
  import { AdminApp, setRichTextEditor } from '@svadmin/ui';
  import { Editor } from '@svadmin/editor';
  import '@svadmin/ui/app.css';
  import { inMemoryDataProvider } from './providers/inMemoryDb';
  import { createInventoryChatProvider } from './providers/inventoryAssistant';
  import { resources } from './resources';
  import { mockAuthProvider } from './providers/mockAuth';
  import Dashboard from './pages/Dashboard.svelte';

  // Register the optional Rich Text Editor plugin globally
  setRichTextEditor(Editor);
  setChatProvider(createInventoryChatProvider(inMemoryDataProvider, resources));
</script>

<AdminApp dataProvider={inMemoryDataProvider} {resources} authProvider={mockAuthProvider} title="Inventory Platform" locale="en">
  {#snippet dashboard()}
    <Dashboard />
  {/snippet}
</AdminApp>
