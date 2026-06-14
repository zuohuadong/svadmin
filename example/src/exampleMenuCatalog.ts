import type { MenuItem } from '@svadmin/core';
import { addTranslations } from '@svadmin/core';

type LocaleCode = 'en' | 'zh-CN';

export interface ReferenceMenuCatalogRow {
  zh: string;
  en: string;
  app: string;
  level: number;
  soon: boolean;
}

export const referenceMenuCatalogRows: ReferenceMenuCatalogRow[] = [
  { zh: '运营首页', en: 'Dashboard', app: 'Example', level: 1, soon: false },
  { zh: '公开资料', en: 'Public Profile', app: 'Profile', level: 1, soon: false },
  { zh: '默认资料', en: 'Default Profile', app: 'Profile', level: 2, soon: false },
  { zh: '企业资料', en: 'Company Profile', app: 'Profile', level: 2, soon: false },
  { zh: '玩家资料', en: 'Gamer Profile', app: 'Profile', level: 2, soon: false },
  { zh: '两栏项目', en: 'Projects - 2 Columns', app: 'Profile', level: 2, soon: false },
  { zh: '三栏项目', en: 'Projects - 3 Columns', app: 'Profile', level: 2, soon: false },
  { zh: '团队', en: 'Teams', app: 'Profile', level: 2, soon: false },
  { zh: '活动', en: 'Activity', app: 'Profile', level: 2, soon: false },
  { zh: '账户中心', en: 'Account', app: 'Account', level: 1, soon: false },
  { zh: '开始使用', en: 'Get Started', app: 'Account', level: 2, soon: false },
  { zh: '用户资料', en: 'User Profile', app: 'Account', level: 2, soon: false },
  { zh: '公司资料', en: 'Company Profile', app: 'Account', level: 2, soon: false },
  { zh: '侧边栏设置', en: 'Settings - Sidebar', app: 'Account', level: 2, soon: false },
  { zh: '企业设置', en: 'Settings - Enterprise', app: 'Account', level: 2, soon: false },
  { zh: '纯净设置', en: 'Settings - Plain', app: 'Account', level: 2, soon: false },
  { zh: '通知设置', en: 'Notifications', app: 'Account', level: 2, soon: false },
  { zh: '集成', en: 'Integrations', app: 'Account', level: 2, soon: false },
  { zh: 'API 密钥', en: 'API Keys', app: 'Account', level: 2, soon: false },
  { zh: '外观', en: 'Appearance', app: 'Account', level: 2, soon: false },
  { zh: '成员入门', en: 'Members Starter', app: 'Account', level: 2, soon: false },
  { zh: '团队成员', en: 'Team Members', app: 'Account', level: 2, soon: false },
  { zh: '导入成员', en: 'Import Members', app: 'Account', level: 2, soon: false },
  { zh: '安全日志', en: 'Security Log', app: 'Account', level: 2, soon: false },
  { zh: '团队网络', en: 'Network', app: 'Network', level: 1, soon: false },
  { zh: '成员卡片', en: 'User Cards', app: 'Network', level: 2, soon: false },
  { zh: '团队成员表', en: 'Team Crew Table', app: 'Network', level: 2, soon: false },
  { zh: '合作伙伴', en: 'Cooperations', app: 'Network', level: 2, soon: true },
  { zh: '线索', en: 'Leads', app: 'Network', level: 2, soon: true },
  { zh: '捐赠者', en: 'Donators', app: 'Network', level: 2, soon: true },
  { zh: '认证页面', en: 'Authentication', app: 'Auth', level: 1, soon: false },
  { zh: '登录', en: 'Sign In', app: 'Auth', level: 2, soon: false },
  { zh: '注册', en: 'Sign Up', app: 'Auth', level: 2, soon: false },
  { zh: '两步验证', en: '2FA', app: 'Auth', level: 2, soon: false },
  { zh: '404 页面', en: 'Error 404', app: 'Auth', level: 2, soon: false },
  { zh: '500 页面', en: 'Error 500', app: 'Auth', level: 2, soon: false },
  { zh: '商城库存', en: 'Store Inventory', app: 'Apps', level: 1, soon: false },
  { zh: '邮件', en: 'Mail', app: 'Apps', level: 1, soon: false },
  { zh: '日历', en: 'Calendar', app: 'Apps', level: 1, soon: false },
  { zh: '待办', en: 'Todo', app: 'Apps', level: 1, soon: false },
  { zh: '客户经营', en: 'CRM', app: 'Apps', level: 1, soon: false },
  { zh: '资产运营', en: 'Real Estate', app: 'Apps', level: 1, soon: false },
  { zh: 'AI 对话', en: 'AI Chat', app: 'Apps', level: 1, soon: false },
  { zh: '用户管理', en: 'User Management', app: 'Apps', level: 1, soon: false },
];

const menuLabels = {
  en: {
    dashboard: 'Dashboard',
    inventory: 'Inventory Center',
    products: 'Products',
    skus: 'SKU Management',
    categories: 'Categories',
    suppliers: 'Suppliers',
    warehouses: 'Warehouses',
    operations: 'Operations',
    stock_movements: 'Stock Movements',
    stock_transfers: 'Stock Transfers',
    cycle_counts: 'Cycle Counts',
    inventory_adjustments: 'Inventory Adjustments',
    reorder_rules: 'Reorder Rules',
    purchase_orders: 'Purchase Orders',
    sales_orders: 'Sales Orders',
    todos: 'Todo',
    organization: 'Organization & Permissions',
    users: 'Users',
    roles: 'Roles',
    planning: 'Planning & Schedule',
    calendar_events: 'Calendar Events',
    intelligence: 'AI Assistant',
    ai_conversations: 'AI Conversations',
    communications: 'Notifications & Mail',
    notifications: 'Notification Center',
    mail_inbox: 'Inbox',
    mail_draft: 'Drafts',
    mail_sent: 'Sent',
    mail_archive: 'Archive',
    mail_snoozed: 'Snoozed',
    mail_spam: 'Spam',
    mail_trash: 'Trash',
    crm: 'Customer Operations',
    crm_accounts: 'Customer Accounts',
    crm_contacts: 'Customer Contacts',
    crm_deals: 'Revenue Opportunities',
    crm_activities: 'Customer Activities',
    property: 'Property Operations',
    properties: 'Property Portfolio',
    property_agents: 'Property Advisors',
    property_leads: 'Property Leads',
    property_showings: 'Tour Schedule',
    store: 'Store Client',
    store_client_products: 'Store Products',
    store_client_orders: 'Store Orders',
    account_pages: 'Example Pages',
    public_profile: 'Public Profile',
    account_settings: 'Account Settings',
    network_cards: 'Network Cards',
    auth_2fa: '2FA',
    error_404: 'Error 404',
    error_500: 'Error 500',
  },
  'zh-CN': {
    dashboard: '运营首页',
    inventory: '库存中心',
    products: '商品档案',
    skus: 'SKU 管理',
    categories: '品类管理',
    suppliers: '供应商',
    warehouses: '仓库',
    operations: '运营作业',
    stock_movements: '库存流水',
    stock_transfers: '库存调拨',
    cycle_counts: '循环盘点',
    inventory_adjustments: '库存调整',
    reorder_rules: '补货规则',
    purchase_orders: '采购订单',
    sales_orders: '销售订单',
    todos: '待办事项',
    organization: '组织权限',
    users: '用户',
    roles: '角色',
    planning: '计划日程',
    calendar_events: '日程',
    intelligence: '智能助手',
    ai_conversations: 'AI 对话',
    communications: '消息通知',
    notifications: '通知中心',
    mail_inbox: '收件箱',
    mail_draft: '草稿箱',
    mail_sent: '已发送',
    mail_archive: '归档',
    mail_snoozed: '稍后提醒',
    mail_spam: '垃圾邮件',
    mail_trash: '废纸篓',
    crm: '客户经营',
    crm_accounts: '客户账户',
    crm_contacts: '客户联系人',
    crm_deals: '收入机会',
    crm_activities: '客户活动',
    property: '资产运营',
    properties: '资产组合',
    property_agents: '资产顾问',
    property_leads: '资产线索',
    property_showings: '看房安排',
    store: '商城客户端',
    store_client_products: '商城商品',
    store_client_orders: '商城订单',
    account_pages: '示例页面',
    public_profile: '公开资料',
    account_settings: '账户设置',
    network_cards: '网络卡片',
    auth_2fa: '两步验证',
    error_404: '404 页面',
    error_500: '500 页面',
  },
} satisfies Record<LocaleCode, Record<string, string>>;

type MenuKey = keyof typeof menuLabels.en;

function item(name: MenuKey, icon: string, href?: string, children?: MenuItem[]): MenuItem {
  return { name, icon, href, children };
}

function localize(items: MenuItem[], locale: string): MenuItem[] {
  const resolvedLocale: LocaleCode = locale === 'zh-CN' ? 'zh-CN' : 'en';
  return items.map((menuItem) => ({
    ...menuItem,
    label: menuLabels[resolvedLocale][menuItem.name as MenuKey],
    children: menuItem.children ? localize(menuItem.children, locale) : undefined,
  }));
}

const exampleMenuTemplate: MenuItem[] = [
  item('dashboard', 'dashboard', '/'),
  item('inventory', 'folder', undefined, [
    item('products', 'folder', '/products'),
    item('skus', 'folder', '/skus'),
    item('categories', 'folder', '/categories'),
    item('suppliers', 'users', '/suppliers'),
    item('warehouses', 'home', '/warehouses'),
  ]),
  item('operations', 'list-todo', undefined, [
    item('stock_movements', 'trending-up', '/stock_movements'),
    item('stock_transfers', 'repeat', '/stock_transfers'),
    item('cycle_counts', 'clipboard-check', '/cycle_counts'),
    item('inventory_adjustments', 'sliders-horizontal', '/inventory_adjustments'),
    item('reorder_rules', 'alert-triangle', '/reorder_rules'),
    item('purchase_orders', 'download', '/purchase_orders'),
    item('sales_orders', 'credit-card', '/sales_orders'),
    item('todos', 'list-todo', '/todos'),
  ]),
  item('organization', 'users', undefined, [
    item('users', 'users', '/users'),
    item('roles', 'shield', '/roles'),
  ]),
  item('planning', 'calendar', undefined, [
    item('calendar_events', 'calendar', '/calendar_events'),
  ]),
  item('intelligence', 'bot', undefined, [
    item('ai_conversations', 'bot', '/ai_conversations'),
  ]),
  item('communications', 'bell', undefined, [
    item('notifications', 'bell', '/notifications'),
    item('mail_inbox', 'mail', '/mail_inbox'),
    item('mail_draft', 'file', '/mail_draft'),
    item('mail_sent', 'send', '/mail_sent'),
    item('mail_archive', 'folder', '/mail_archive'),
    item('mail_snoozed', 'clock', '/mail_snoozed'),
    item('mail_spam', 'alert-triangle', '/mail_spam'),
    item('mail_trash', 'trash', '/mail_trash'),
  ]),
  item('crm', 'briefcase', undefined, [
    item('crm_accounts', 'briefcase', '/crm_accounts'),
    item('crm_contacts', 'users', '/crm_contacts'),
    item('crm_deals', 'trending-up', '/crm_deals'),
    item('crm_activities', 'calendar', '/crm_activities'),
  ]),
  item('property', 'building', undefined, [
    item('properties', 'home', '/properties'),
    item('property_agents', 'users', '/property_agents'),
    item('property_leads', 'trending-up', '/property_leads'),
    item('property_showings', 'calendar', '/property_showings'),
  ]),
  item('store', 'shopping-bag', undefined, [
    item('store_client_products', 'shopping-bag', '/store_client_products'),
    item('store_client_orders', 'credit-card', '/store_client_orders'),
  ]),
  item('account_pages', 'settings', undefined, [
    item('public_profile', 'users', '/public-profile/profiles/default'),
    item('account_settings', 'settings', '/settings/account'),
    item('network_cards', 'images', '/network/user-cards'),
    item('auth_2fa', 'key', '/2fa'),
    item('error_404', 'alert-triangle', '/404'),
    item('error_500', 'alert-triangle', '/500'),
  ]),
];

export function registerExampleMenuTranslations(): void {
  addTranslations('en', Object.fromEntries(Object.entries(menuLabels.en).map(([key, value]) => [`menu.${key}`, value])));
  addTranslations('zh-CN', Object.fromEntries(Object.entries(menuLabels['zh-CN']).map(([key, value]) => [`menu.${key}`, value])));
}

export function createExampleMenu(locale: string): MenuItem[] {
  return localize(exampleMenuTemplate, locale);
}
