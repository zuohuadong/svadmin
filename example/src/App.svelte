<script lang="ts">
  import { getLocale, setChatProvider } from '@svadmin/core';
  import { AdminApp, setRichTextEditor } from '@svadmin/ui';
  import { Editor } from '@svadmin/editor';
  import '@svadmin/ui/app.css';
  import { inMemoryDataProvider } from './providers/inMemoryDb';
  import { createInventoryChatProvider } from './providers/inventoryAssistant';
  import { createResources } from './resources';
  import { mockAuthProvider } from './providers/mockAuth';
  import Dashboard from './pages/Dashboard.svelte';

  // Register the optional Rich Text Editor plugin globally
  setRichTextEditor(Editor);

  const initialLocale = getLocale();
  const currentLocale = $derived(getLocale());
  let resources = $state.raw(createResources(initialLocale));
  const appTitle = $derived(currentLocale === 'zh-CN' ? '库存运营平台' : 'Inventory Platform');
  const loginHint = $derived(currentLocale === 'zh-CN' ? '已预填演示账号，方便快速测试登录。' : 'Demo credentials are prefilled for quick testing.');

  $effect(() => {
    const nextResources = createResources(currentLocale);
    resources = nextResources;
    setChatProvider(createInventoryChatProvider(inMemoryDataProvider, nextResources));
  });
</script>

<AdminApp
  dataProvider={inMemoryDataProvider}
  {resources}
  authProvider={mockAuthProvider}
  title={appTitle}
  locale={currentLocale}
  loginDefaults={{
    identifier: 'demo@example.com',
    password: 'demo',
    hint: loginHint,
  }}
>
  {#snippet dashboard()}
    <Dashboard />
  {/snippet}
</AdminApp>
