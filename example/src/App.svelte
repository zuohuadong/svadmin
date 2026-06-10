<script lang="ts">
  import { AdminApp, setRichTextEditor } from '@svadmin/ui';
  import { Editor } from '@svadmin/editor';
  import '@svadmin/ui/app.css';
  import { inMemoryDataProvider } from './providers/inMemoryDb';
  import { resources } from './resources';
  import { mockAuthProvider } from './providers/mockAuth';
  import Dashboard from './pages/Dashboard.svelte';

  // Register the optional Rich Text Editor plugin globally
  setRichTextEditor(Editor);
</script>

<AdminApp dataProvider={inMemoryDataProvider} {resources} authProvider={mockAuthProvider} title="Inventory Platform" locale="en">
  {#snippet dashboard()}
    <Dashboard />
  {/snippet}
</AdminApp>
