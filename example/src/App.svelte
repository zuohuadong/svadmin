<script lang="ts">
  import { getLocale, setChatProvider } from '@svadmin/core';
  import { AdminApp, setRichTextEditor } from '@svadmin/ui';
  import { Editor } from '@svadmin/editor';
  import '@svadmin/ui/app.css';
  import { inMemoryDataProvider } from './providers/inMemoryDb';
  import { createInventoryChatProvider } from './providers/inventoryAssistant';
  import { createResources } from './resources';
  import { createExampleMenu, registerExampleMenuTranslations } from './exampleMenuCatalog';
  import { mockAuthProvider } from './providers/mockAuth';
  import Dashboard from './pages/Dashboard.svelte';
  import ExampleResourcePage from './pages/ExampleResourcePage.svelte';

  // Register the optional Rich Text Editor plugin globally
  registerExampleMenuTranslations();
  setRichTextEditor(Editor);

  const currentLocale = $derived(getLocale());
  const resources = $derived.by(() => createResources(currentLocale));
  const menu = $derived.by(() => createExampleMenu(currentLocale));
  const appTitle = $derived(currentLocale === 'zh-CN' ? '运营示例平台' : 'Example Operations');
  const loginHint = $derived(currentLocale === 'zh-CN' ? '已预填演示账号，方便快速测试。' : 'Demo credentials are prefilled for quick testing.');

  $effect(() => {
    setChatProvider(createInventoryChatProvider(inMemoryDataProvider, resources));
  });

  const resourcePages = {
    products: { list: ExampleResourcePage },
    skus: { list: ExampleResourcePage },
    categories: { list: ExampleResourcePage },
    suppliers: { list: ExampleResourcePage },
    warehouses: { list: ExampleResourcePage },
    stock_movements: { list: ExampleResourcePage },
    stock_transfers: { list: ExampleResourcePage },
    cycle_counts: { list: ExampleResourcePage },
    inventory_adjustments: { list: ExampleResourcePage },
    reorder_rules: { list: ExampleResourcePage },
    purchase_orders: { list: ExampleResourcePage },
    sales_orders: { list: ExampleResourcePage },
    todos: { list: ExampleResourcePage },
    users: { list: ExampleResourcePage },
    roles: { list: ExampleResourcePage },
    calendar_events: { list: ExampleResourcePage },
    notifications: { list: ExampleResourcePage },
    ai_conversations: { list: ExampleResourcePage },
    mail_inbox: { list: ExampleResourcePage },
    mail_draft: { list: ExampleResourcePage },
    mail_sent: { list: ExampleResourcePage },
    mail_archive: { list: ExampleResourcePage },
    mail_snoozed: { list: ExampleResourcePage },
    mail_spam: { list: ExampleResourcePage },
    mail_trash: { list: ExampleResourcePage },
    store_client_products: { list: ExampleResourcePage },
    store_client_orders: { list: ExampleResourcePage },
    crm_accounts: { list: ExampleResourcePage },
    crm_contacts: { list: ExampleResourcePage },
    crm_deals: { list: ExampleResourcePage },
    crm_activities: { list: ExampleResourcePage },
    properties: { list: ExampleResourcePage },
    property_agents: { list: ExampleResourcePage },
    property_leads: { list: ExampleResourcePage },
    property_showings: { list: ExampleResourcePage },
  };
</script>

<AdminApp
  dataProvider={inMemoryDataProvider}
  {resources}
  authProvider={mockAuthProvider}
  {resourcePages}
  {menu}
  title={appTitle}
  locale={currentLocale}
  themeConfig={{ layoutPreset: 'clean-flat' }}
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
