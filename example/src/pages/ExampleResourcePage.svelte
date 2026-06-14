<script lang="ts">
  import { getLocale } from '@svadmin/core/i18n';
  import { ResourceOperationsPage } from '@svadmin/ui';
  import type { Component } from 'svelte';
  import {
    Bot,
    Briefcase,
    Building2,
    CalendarDays,
    ClipboardList,
    Mail,
    Package,
    ShoppingBag,
    Users,
  } from '@lucide/svelte';

  interface PageCopy {
    eyebrow: string;
    title: string;
    description: string;
    actionLabel: string;
    tableLabel: string;
    tableDescription: string;
    highlightsLabel: string;
  }

  interface PageConfig {
    icon: Component<{ class?: string }>;
    en: PageCopy;
    zh: PageCopy;
    metrics: Array<{ label: string; value: string | number; hint?: string }>;
    lanes: Array<{ label: string; value: string | number; hint?: string }>;
    highlights: Array<{ title: string; description?: string; meta?: string; badge?: string }>;
  }

  let { resourceName }: { resourceName: string } = $props();

  const locale = $derived(getLocale());

  const fallbackConfig: PageConfig = {
    icon: ClipboardList,
    en: {
      eyebrow: 'Operations',
      title: 'Workspace records',
      description: 'Review, edit, and maintain this example resource from a dense svadmin operations surface.',
      actionLabel: 'New record',
      tableLabel: 'Records',
      tableDescription: 'Editable data with list, create, update, and delete flows.',
      highlightsLabel: 'Focus queue',
    },
    zh: {
      eyebrow: '运营',
      title: '工作区记录',
      description: '在高密度的 svadmin 运营页面中查看、编辑和维护该示例资源。',
      actionLabel: '新建记录',
      tableLabel: '记录',
      tableDescription: '支持列表、新建、更新和删除的可编辑数据。',
      highlightsLabel: '重点队列',
    },
    metrics: [
      { label: 'Active', value: 12, hint: 'demo records' },
      { label: 'Queued', value: 4, hint: 'needs review' },
      { label: 'Health', value: '92%', hint: 'sample score' },
    ],
    lanes: [
      { label: 'Ready', value: 8, hint: 'available for action' },
      { label: 'Review', value: 3, hint: 'requires attention' },
      { label: 'Closed', value: 5, hint: 'recently completed' },
    ],
    highlights: [
      { title: 'Daily review', description: 'Check the highest priority records first.', meta: 'Updated today', badge: 'Live' },
    ],
  };

  const appConfigs: Record<string, PageConfig> = {
    inventory: {
      ...fallbackConfig,
      icon: Package,
      en: {
        eyebrow: 'Inventory',
        title: 'Inventory control cockpit',
        description: 'Track catalog coverage, reorder exposure, warehouse capacity, and operational exceptions.',
        actionLabel: 'New inventory record',
        tableLabel: 'Inventory records',
        tableDescription: 'Editable inventory data connected to the local example provider.',
        highlightsLabel: 'Replenishment focus',
      },
      zh: {
        eyebrow: '库存',
        title: '库存控制工作台',
        description: '跟踪商品覆盖、补货风险、仓库容量和运营异常。',
        actionLabel: '新建库存记录',
        tableLabel: '库存记录',
        tableDescription: '连接本地示例数据源的可编辑库存数据。',
        highlightsLabel: '补货关注',
      },
      metrics: [
        { label: 'Catalog', value: 28, hint: 'managed items' },
        { label: 'Low stock', value: 2, hint: 'below threshold' },
        { label: 'Coverage', value: '91%', hint: 'healthy lanes' },
      ],
      lanes: [
        { label: 'Ready to ship', value: 18, hint: 'normal stock range' },
        { label: 'Needs reorder', value: 2, hint: 'below minimum stock' },
        { label: 'Pending setup', value: 4, hint: 'missing enrichment' },
      ],
      highlights: [
        { title: 'Ergonomic Chair', description: 'Below minimum stock in West Hub.', meta: '4 / 6 units', badge: 'Low' },
        { title: 'Packing Tape', description: 'Consumption is above the weekly baseline.', meta: '18 / 24 units', badge: 'Review' },
      ],
    },
    operations: {
      ...fallbackConfig,
      icon: ClipboardList,
      en: {
        eyebrow: 'Operations',
        title: 'Operations execution board',
        description: 'Coordinate transfers, counts, adjustments, purchase work, and sales fulfillment from one view.',
        actionLabel: 'New operation',
        tableLabel: 'Operation records',
        tableDescription: 'Use the table for CRUD, audit preparation, and day-to-day operations checks.',
        highlightsLabel: 'Execution queue',
      },
      zh: {
        eyebrow: '运营',
        title: '运营执行看板',
        description: '集中协调调拨、盘点、调整、采购作业和销售履约。',
        actionLabel: '新建作业',
        tableLabel: '作业记录',
        tableDescription: '使用表格完成 CRUD、审计准备和日常运营检查。',
        highlightsLabel: '执行队列',
      },
      metrics: [
        { label: 'Open work', value: 14, hint: 'active tasks' },
        { label: 'Blocked', value: 1, hint: 'needs owner' },
        { label: 'SLA', value: '96%', hint: 'on-time work' },
      ],
      lanes: [
        { label: 'Draft', value: 3, hint: 'not yet released' },
        { label: 'In progress', value: 7, hint: 'currently owned' },
        { label: 'Completed', value: 16, hint: 'recent closure' },
      ],
      highlights: [
        { title: 'WH-MAIN cycle count', description: 'Count window starts today.', meta: 'Owner: Operations Analyst', badge: 'Today' },
        { title: 'Tape reorder rule', description: 'Target quantity needs review.', meta: 'Lead time: 5 days', badge: 'Policy' },
      ],
    },
    people: {
      ...fallbackConfig,
      icon: Users,
      en: {
        eyebrow: 'Organization',
        title: 'User and access workspace',
        description: 'Manage users, roles, permission views, ownership, and activity signals.',
        actionLabel: 'New member',
        tableLabel: 'People records',
        tableDescription: 'Operational people data for access and ownership examples.',
        highlightsLabel: 'Access focus',
      },
      zh: {
        eyebrow: '组织',
        title: '用户与权限工作区',
        description: '管理用户、角色、权限视图、负责人和活动信号。',
        actionLabel: '新建成员',
        tableLabel: '人员记录',
        tableDescription: '用于权限与负责人示例的运营人员数据。',
        highlightsLabel: '权限关注',
      },
      metrics: [
        { label: 'Members', value: 8, hint: 'active users' },
        { label: 'Roles', value: 4, hint: 'access groups' },
        { label: 'Invites', value: 2, hint: 'pending' },
      ],
      lanes: [
        { label: 'Active', value: 6, hint: 'signed in recently' },
        { label: 'Invited', value: 2, hint: 'waiting for setup' },
        { label: 'Suspended', value: 0, hint: 'no current holds' },
      ],
      highlights: [
        { title: 'Role review', description: 'Confirm operator access before next deployment.', meta: 'Due this week', badge: 'RBAC' },
      ],
    },
    calendar: {
      ...fallbackConfig,
      icon: CalendarDays,
      en: {
        eyebrow: 'Planning',
        title: 'Calendar planning board',
        description: 'Track events, meetings, reminders, schedules, and operational milestones.',
        actionLabel: 'New event',
        tableLabel: 'Calendar records',
        tableDescription: 'Timeline data for procurement, receiving, reviews, and recurring operations.',
        highlightsLabel: 'Upcoming schedule',
      },
      zh: {
        eyebrow: '计划',
        title: '日历计划看板',
        description: '跟踪活动、会议、提醒、排期和运营里程碑。',
        actionLabel: '新建日程',
        tableLabel: '日历记录',
        tableDescription: '采购、收货、复盘和周期作业的时间线数据。',
        highlightsLabel: '近期日程',
      },
      metrics: [
        { label: 'This week', value: 9, hint: 'planned items' },
        { label: 'Reviews', value: 3, hint: 'decision points' },
        { label: 'Done', value: 5, hint: 'completed' },
      ],
      lanes: [
        { label: 'Events', value: 4, hint: 'operational milestones' },
        { label: 'Meetings', value: 3, hint: 'cross-team reviews' },
        { label: 'Reminders', value: 6, hint: 'owner prompts' },
      ],
      highlights: [
        { title: 'Cycle count', description: 'Warehouse count scheduled for the next shift.', meta: 'Today', badge: 'Count' },
      ],
    },
    communications: {
      ...fallbackConfig,
      icon: Mail,
      en: {
        eyebrow: 'Communications',
        title: 'Message operations center',
        description: 'Review inboxes, notifications, delivery signals, and follow-up communication queues.',
        actionLabel: 'New message',
        tableLabel: 'Message records',
        tableDescription: 'Example communication data for mail, alerts, and internal notifications.',
        highlightsLabel: 'Unread focus',
      },
      zh: {
        eyebrow: '通信',
        title: '消息运营中心',
        description: '查看收件箱、通知、投递信号和跟进沟通队列。',
        actionLabel: '新建消息',
        tableLabel: '消息记录',
        tableDescription: '邮件、警报和内部通知的示例通信数据。',
        highlightsLabel: '未读关注',
      },
      metrics: [
        { label: 'Unread', value: 5, hint: 'needs review' },
        { label: 'Drafts', value: 2, hint: 'not sent' },
        { label: 'Alerts', value: 3, hint: 'system events' },
      ],
      lanes: [
        { label: 'Inbox', value: 3, hint: 'incoming messages' },
        { label: 'Snoozed', value: 1, hint: 'scheduled follow-up' },
        { label: 'Sent', value: 2, hint: 'outbound notes' },
      ],
      highlights: [
        { title: 'Low stock review', description: 'Operations message waiting in the inbox.', meta: 'Unread', badge: 'Mail' },
      ],
    },
    crm: {
      ...fallbackConfig,
      icon: Briefcase,
      en: {
        eyebrow: 'CRM',
        title: 'Customer revenue workspace',
        description: 'Coordinate accounts, contacts, opportunities, and customer activity follow-ups.',
        actionLabel: 'New CRM record',
        tableLabel: 'Customer records',
        tableDescription: 'Account and pipeline data built for a compact admin workflow.',
        highlightsLabel: 'Pipeline focus',
      },
      zh: {
        eyebrow: '客户经营',
        title: '客户收入工作区',
        description: '协同客户账户、联系人、收入机会和客户活动跟进。',
        actionLabel: '新建客户记录',
        tableLabel: '客户记录',
        tableDescription: '面向紧凑后台流程的账户与管线数据。',
        highlightsLabel: '管线关注',
      },
      metrics: [
        { label: 'Accounts', value: 6, hint: 'active portfolio' },
        { label: 'Pipeline', value: '$860K', hint: 'weighted value' },
        { label: 'At risk', value: 1, hint: 'watch list' },
      ],
      lanes: [
        { label: 'Discovery', value: 3, hint: 'new opportunities' },
        { label: 'Proposal', value: 2, hint: 'commercial review' },
        { label: 'Negotiation', value: 1, hint: 'late-stage' },
      ],
      highlights: [
        { title: 'Renewal account', description: 'Decision maker needs one more technical review.', meta: 'Close date: Jun 28', badge: 'Hot' },
      ],
    },
    property: {
      ...fallbackConfig,
      icon: Building2,
      en: {
        eyebrow: 'Property',
        title: 'Property operations workspace',
        description: 'Manage property portfolios, advisors, leads, tours, saved assets, and map-oriented work.',
        actionLabel: 'New property record',
        tableLabel: 'Property records',
        tableDescription: 'Real-estate style operations data represented through svadmin resources.',
        highlightsLabel: 'Tour focus',
      },
      zh: {
        eyebrow: '资产',
        title: '资产运营工作区',
        description: '管理资产组合、顾问、线索、看房、收藏资产和地图类作业。',
        actionLabel: '新建资产记录',
        tableLabel: '资产记录',
        tableDescription: '通过 svadmin 资源表达的资产运营数据。',
        highlightsLabel: '看房关注',
      },
      metrics: [
        { label: 'Assets', value: 12, hint: 'managed properties' },
        { label: 'Leads', value: 8, hint: 'active demand' },
        { label: 'Tours', value: 3, hint: 'scheduled' },
      ],
      lanes: [
        { label: 'Listed', value: 4, hint: 'market ready' },
        { label: 'Qualified', value: 5, hint: 'lead stage' },
        { label: 'Scheduled', value: 3, hint: 'upcoming tours' },
      ],
      highlights: [
        { title: 'Harbor Lofts tour', description: 'Prepare amenity and rent-roll details.', meta: 'Jun 14', badge: 'Tour' },
      ],
    },
    ai: {
      ...fallbackConfig,
      icon: Bot,
      en: {
        eyebrow: 'AI',
        title: 'AI assistant workspace',
        description: 'Review assistant conversations, operational prompts, templates, and model routing examples.',
        actionLabel: 'New conversation',
        tableLabel: 'AI conversation records',
        tableDescription: 'Local assistant data powered by the example chat provider.',
        highlightsLabel: 'Prompt focus',
      },
      zh: {
        eyebrow: 'AI',
        title: 'AI 助手工作区',
        description: '查看助手对话、运营提示词、模板和模型路由示例。',
        actionLabel: '新建对话',
        tableLabel: 'AI 对话记录',
        tableDescription: '由本地示例聊天 provider 支持的助手数据。',
        highlightsLabel: '提示词关注',
      },
      metrics: [
        { label: 'Threads', value: 6, hint: 'active chats' },
        { label: 'Resolved', value: 4, hint: 'closed answers' },
        { label: 'Waiting', value: 2, hint: 'needs context' },
      ],
      lanes: [
        { label: 'Replenishment', value: 2, hint: 'inventory prompts' },
        { label: 'Forecast', value: 1, hint: 'planning prompts' },
        { label: 'Policy', value: 3, hint: 'knowledge prompts' },
      ],
      highlights: [
        { title: 'Reorder assistant', description: 'Use stock and purchase data for local guidance.', meta: 'Read-only demo', badge: 'AI' },
      ],
    },
    store: {
      ...fallbackConfig,
      icon: ShoppingBag,
      en: {
        eyebrow: 'Store',
        title: 'Storefront operations workspace',
        description: 'Manage catalog search, product details, cart signals, wishlist demand, checkout, and orders.',
        actionLabel: 'New store record',
        tableLabel: 'Store records',
        tableDescription: 'Commerce-oriented demo records for client-facing store flows.',
        highlightsLabel: 'Store focus',
      },
      zh: {
        eyebrow: '商城',
        title: '商城运营工作区',
        description: '管理商品搜索、详情、购物车信号、心愿需求、结账和订单。',
        actionLabel: '新建商城记录',
        tableLabel: '商城记录',
        tableDescription: '面向客户端商城流程的电商示例记录。',
        highlightsLabel: '商城关注',
      },
      metrics: [
        { label: 'Products', value: 3, hint: 'demo catalog' },
        { label: 'Orders', value: 3, hint: 'recent checkout' },
        { label: 'Rating', value: '4.6', hint: 'avg score' },
      ],
      lanes: [
        { label: 'Catalog', value: 3, hint: 'searchable items' },
        { label: 'Checkout', value: 2, hint: 'active orders' },
        { label: 'Delivered', value: 1, hint: 'completed order' },
      ],
      highlights: [
        { title: 'Field Laptop Bundle', description: 'Strongest demand in the demo catalog.', meta: '4.8 rating', badge: 'Top' },
      ],
    },
  };

  function configFor(resource: string): PageConfig {
    if (['products', 'skus', 'categories', 'suppliers', 'warehouses'].includes(resource)) return appConfigs.inventory;
    if ([
      'stock_movements',
      'stock_transfers',
      'cycle_counts',
      'inventory_adjustments',
      'reorder_rules',
      'purchase_orders',
      'sales_orders',
      'todos',
    ].includes(resource)) return appConfigs.operations;
    if (['users', 'roles'].includes(resource)) return appConfigs.people;
    if (resource === 'calendar_events') return appConfigs.calendar;
    if (resource === 'ai_conversations') return appConfigs.ai;
    if (resource === 'notifications' || resource.startsWith('mail_')) return appConfigs.communications;
    if (resource.startsWith('crm_')) return appConfigs.crm;
    if (resource.startsWith('property') || resource === 'properties') return appConfigs.property;
    if (resource.startsWith('store_client_')) return appConfigs.store;
    return fallbackConfig;
  }

  const config = $derived(configFor(resourceName));
  const copy = $derived(locale === 'zh-CN' ? config.zh : config.en);
</script>

<ResourceOperationsPage
  {resourceName}
  eyebrow={copy.eyebrow}
  title={copy.title}
  description={copy.description}
  actionLabel={copy.actionLabel}
  icon={config.icon}
  metrics={config.metrics}
  lanes={config.lanes}
  highlights={config.highlights}
  tableLabel={copy.tableLabel}
  tableDescription={copy.tableDescription}
  highlightsLabel={copy.highlightsLabel}
  emptyLanesText={locale === 'zh-CN' ? '暂无分组记录。' : 'No grouped records yet.'}
/>
