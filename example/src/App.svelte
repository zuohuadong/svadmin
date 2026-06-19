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
  import AiWorkspacePage from './pages/AiWorkspacePage.svelte';
  import CalendarWorkspacePage from './pages/CalendarWorkspacePage.svelte';
  import CrmDashboardPage from './pages/CrmDashboardPage.svelte';
  import ExampleResourcePage from './pages/ExampleResourcePage.svelte';
  import MailWorkspacePage from './pages/MailWorkspacePage.svelte';
  import RealEstateWorkspacePage from './pages/RealEstateWorkspacePage.svelte';
  import TodoWorkspacePage from './pages/TodoWorkspacePage.svelte';
  import UserManagementPage from './pages/UserManagementPage.svelte';

  // Register the optional Rich Text Editor plugin globally
  registerExampleMenuTranslations();
  setRichTextEditor(Editor);

  const currentLocale = $derived(getLocale());
  const resources = $derived.by(() => createResources(currentLocale));
  const menu = $derived.by(() => createExampleMenu(currentLocale));
  const appTitle = 'svadmin example';
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
    todos: { list: TodoWorkspacePage },
    users: { list: UserManagementPage },
    roles: { list: UserManagementPage },
    permissions: { list: UserManagementPage },
    user_accounts: { list: UserManagementPage },
    user_logs: { list: UserManagementPage },
    user_settings: { list: UserManagementPage },
    calendar_events: { list: CalendarWorkspacePage },
    notifications: { list: ExampleResourcePage },
    ai_conversations: { list: AiWorkspacePage },
    mail_inbox: { list: MailWorkspacePage },
    mail_draft: { list: MailWorkspacePage },
    mail_sent: { list: MailWorkspacePage },
    mail_archive: { list: MailWorkspacePage },
    mail_snoozed: { list: MailWorkspacePage },
    mail_spam: { list: MailWorkspacePage },
    mail_trash: { list: MailWorkspacePage },
    store_client_products: { list: ExampleResourcePage },
    store_client_orders: { list: ExampleResourcePage },
    crm_accounts: { list: CrmDashboardPage },
    crm_contacts: { list: CrmDashboardPage },
    crm_deals: { list: CrmDashboardPage },
    crm_activities: { list: CrmDashboardPage },
    properties: { list: RealEstateWorkspacePage },
    property_agents: { list: RealEstateWorkspacePage },
    property_leads: { list: RealEstateWorkspacePage },
    property_showings: { list: RealEstateWorkspacePage },
    project_planning: { list: ExampleResourcePage },
    store_admin: { list: ExampleResourcePage },
    store_services: { list: ExampleResourcePage },
    ai_prompt: { list: ExampleResourcePage },
    invoice_generator: { list: ExampleResourcePage },
    billing_plans: { list: ExampleResourcePage },
    billing_invoices: { list: ExampleResourcePage },
    billing_subscriptions: { list: ExampleResourcePage },
    security_sessions: { list: ExampleResourcePage },
    security_devices: { list: ExampleResourcePage },
    security_allowed_ips: { list: ExampleResourcePage },
    referral_invites: { list: ExampleResourcePage },  };
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
