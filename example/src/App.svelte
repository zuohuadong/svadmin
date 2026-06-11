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
  import AiWorkspacePage from './pages/AiWorkspacePage.svelte';
  import type { MenuItem } from '@svadmin/core';

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


  const menuItems: MenuItem[] = [
    {
      name: 'dashboard',
      label: '运营首页',
      icon: 'home',
      href: '/'
    },
    {
      name: 'inventory_system',
      label: '库存系统',
      icon: 'package',
      children: [
        { name: 'products', label: '商品档案', icon: 'package', href: '/products' },
        { name: 'skus', label: '库存商品 (SKU)', icon: 'barcode', href: '/skus' },
        { name: 'categories', label: '品类管理', icon: 'folder-tree', href: '/categories' },
        { name: 'suppliers', label: '供应商管理', icon: 'building-2', href: '/suppliers' },
        { name: 'warehouses', label: '仓库管理', icon: 'warehouse', href: '/warehouses' },
        { name: 'stock_movements', label: '库存异动', icon: 'repeat', href: '/stock_movements' },
        { name: 'stock_transfers', label: '库存调拨', icon: 'repeat', href: '/stock_transfers' },
        { name: 'cycle_counts', label: '库存盘点', icon: 'sliders-horizontal', href: '/cycle_counts' },
        { name: 'inventory_adjustments', label: '库存调整', icon: 'sliders-horizontal', href: '/inventory_adjustments' },
        { name: 'reorder_rules', label: '补货规则', icon: 'sliders-horizontal', href: '/reorder_rules' },
        { name: 'purchase_orders', label: '采购订单', icon: 'clipboard-check', href: '/purchase_orders' },
        { name: 'sales_orders', label: '销售订单', icon: 'clipboard-check', href: '/sales_orders' }
      ]
    },
    {
      name: 'cooperation_system',
      label: '协作系统',
      icon: 'clipboard-check',
      children: [
        { name: 'notifications', label: '通知与邮件', icon: 'bell', href: '/mail/inbox' },
        { name: 'calendar', label: '日程日历', icon: 'calendar', href: '/calendar/page' },
        { name: 'todos', label: '待办事项 (Todo)', icon: 'list-todo', href: '/todo/all-tasks' }
      ]
    },
    {
      name: 'ai_workspace',
      label: '智能工作台',
      icon: 'bot',
      children: [
        { name: 'ai_chat', label: 'AI 会话中心', icon: 'bot', href: '/ai/start' }
      ]
    },
    {
      name: 'crm_system',
      label: '客户经营',
      icon: 'handshake',
      children: [
        { name: 'crm_dashboard', label: '客户经营看板', icon: 'handshake', href: '/crm/dashboard' },
        { name: 'crm_accounts', label: 'CRM 客户账户', icon: 'handshake', href: '/crm_accounts' },
        { name: 'crm_contacts', label: '客户联系人', icon: 'users', href: '/crm_contacts' },
        { name: 'crm_deals', label: '销售机会管理', icon: 'briefcase-business', href: '/crm_deals' },
        { name: 'crm_activities', label: '客户经营活动', icon: 'sliders-horizontal', href: '/crm_activities' }
      ]
    },
    {
      name: 'property_system',
      label: '资产运营',
      icon: 'map-pinned',
      children: [
        { name: 'property_dashboard', label: '资产运营看板', icon: 'map-pinned', href: '/real-estate/page' },
        { name: 'properties', label: '房产资产管理', icon: 'building-2', href: '/properties' },
        { name: 'property_agents', label: '置业经纪人', icon: 'user-round-check', href: '/property_agents' },
        { name: 'property_leads', label: '意向线索跟进', icon: 'sliders-horizontal', href: '/property_leads' },
        { name: 'property_showings', label: '预约看房管理', icon: 'calendar-check', href: '/property_showings' }
      ]
    },
    {
      name: 'user_permissions',
      label: '用户与权限',
      icon: 'shield',
      children: [
        { name: 'users', label: '用户管理', icon: 'users', href: '/user-management/users' },
        { name: 'roles', label: '角色与权限', icon: 'shield', href: '/roles' }
      ]
    },
    {
      name: 'info_center',
      label: '资料中心',
      icon: 'book-open',
      children: [
        { name: 'public_profile', label: '公开资料', icon: 'book-open', href: '/public-profile' },
        { name: 'projects_2_columns', label: '项目列表 · 双列', icon: 'folder', href: '/public-profile/projects/2-columns' },
        { name: 'projects_3_columns', label: '项目列表 · 三列', icon: 'folder', href: '/public-profile/projects/3-columns' },
        { name: 'activity_log', label: '动态跟踪', icon: 'repeat', href: '/public-profile/activity' },
        { name: 'teams_showcase', label: '团队展示', icon: 'users', href: '/public-profile/teams' },
        { name: 'profile_company', label: '公司资料档案', icon: 'building-2', href: '/public-profile/profiles/company' },
        { name: 'profile_default', label: '默认资料档案', icon: 'user-round-check', href: '/public-profile/profiles/default' },
        { name: 'profile_gamer', label: '玩家资料档案', icon: 'user-round-check', href: '/public-profile/profiles/gamer' }
      ]
    },
    {
      name: 'account_center',
      label: '账户中心',
      icon: 'user-round-check',
      children: [
        { name: 'user_profile', label: '个人设置', icon: 'user-round-check', href: '/account/home/user-profile' },
        { name: 'appearance', label: '主题外观', icon: 'palette', href: '/account/appearance' },
        { name: 'notifications_settings', label: '消息通知', icon: 'bell', href: '/account/notifications' },
        { name: 'integrations_settings', label: '插件集成', icon: 'puzzle', href: '/account/integrations' },
        { name: 'api_keys', label: 'API 密钥管理', icon: 'key-round', href: '/account/api-keys' },
        { name: 'security_log', label: '安全审计日志', icon: 'sliders-horizontal', href: '/account/security/security-log' },
        { name: 'get_started', label: '新手指引', icon: 'book-open', href: '/account/home/get-started' },
        { name: 'company_profile', label: '企业/公司档案', icon: 'building-2', href: '/account/home/company-profile' },
        { name: 'settings_plain', label: '极简设置页面', icon: 'settings', href: '/account/home/settings-plain' },
        { name: 'settings_sidebar', label: '侧栏设置页面', icon: 'sliders-horizontal', href: '/account/home/settings-sidebar' },
        { name: 'settings_enterprise', label: '企业设置管理', icon: 'sliders-horizontal', href: '/account/home/settings-enterprise' },
        { name: 'team_members', label: '团队成员列表', icon: 'users', href: '/account/members/team-members' },
        { name: 'import_members', label: '批量引入成员', icon: 'repeat', href: '/account/members/import-members' },
        { name: 'members_starter', label: '新手成员面板', icon: 'user-round-check', href: '/account/members/members-starter' }
      ]
    },
    {
      name: 'network_center',
      label: '网络',
      icon: 'repeat',
      children: [
        { name: 'team_crew', label: '成员网络表格', icon: 'users', href: '/network/user-table/team-crew' },
        { name: 'user_cards', label: '卡片资产展示', icon: 'barcode', href: '/network/user-cards/nft' }
      ]
    },
    {
      name: 'auth_error_pages',
      label: '认证与错误页',
      icon: 'alert-triangle',
      children: [
        { name: 'login', label: '系统登录页', icon: 'key-round', href: '/login' },
        { name: 'register', label: '系统注册页', icon: 'user-round-check', href: '/register' },
        { name: '2fa', label: '双重认证 (2FA)', icon: 'shield', href: '/authentication/branded/2fa' },
        { name: 'error_404', label: '404 错误页', icon: 'alert-triangle', href: '/authentication/error-404' },
        { name: 'error_500', label: '500 错误页', icon: 'alert-triangle', href: '/authentication/error-500' }
      ]
    }
  ];

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
    ai_conversations: { list: AiWorkspacePage },
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
  defaultTheme="light"
  themeConfig={{ layoutPreset: 'clean-flat' }}
  menu={menuItems}
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
