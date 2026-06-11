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
  import ProductsPage from './pages/ProductsPage.svelte';
  import OrdersPage from './pages/OrdersPage.svelte';
  import PeoplePage from './pages/PeoplePage.svelte';
  import CalendarPage from './pages/CalendarPage.svelte';
  import MessagesPage from './pages/MessagesPage.svelte';
  import InventoryDirectoryPage from './pages/InventoryDirectoryPage.svelte';
  import OperationsPage from './pages/OperationsPage.svelte';
  import CrmOperationsPage from './pages/CrmOperationsPage.svelte';
  import PropertyOperationsPage from './pages/PropertyOperationsPage.svelte';

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

  const resourcePages = {
    products: { list: ProductsPage },
    skus: { list: InventoryDirectoryPage },
    categories: { list: InventoryDirectoryPage },
    suppliers: { list: InventoryDirectoryPage },
    warehouses: { list: InventoryDirectoryPage },
    stock_movements: { list: OperationsPage },
    stock_transfers: { list: OperationsPage },
    cycle_counts: { list: OperationsPage },
    inventory_adjustments: { list: OperationsPage },
    reorder_rules: { list: OperationsPage },
    purchase_orders: { list: OrdersPage },
    sales_orders: { list: OrdersPage },
    todos: { list: OperationsPage },
    users: { list: PeoplePage },
    roles: { list: PeoplePage },
    calendar_events: { list: CalendarPage },
    notifications: { list: MessagesPage },
    ai_conversations: { list: MessagesPage },
    crm_accounts: { list: CrmOperationsPage },
    crm_contacts: { list: CrmOperationsPage },
    crm_deals: { list: CrmOperationsPage },
    crm_activities: { list: CrmOperationsPage },
    properties: { list: PropertyOperationsPage },
    property_agents: { list: PropertyOperationsPage },
    property_leads: { list: PropertyOperationsPage },
    property_showings: { list: PropertyOperationsPage },
  };
</script>

<AdminApp
  dataProvider={inMemoryDataProvider}
  {resources}
  authProvider={mockAuthProvider}
  {resourcePages}
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
