<script lang="ts">
  import { getLocale, useList } from '@svadmin/core';
  import * as Card from '@svadmin/ui/components/ui/card/index.js';
  import {
    AlertTriangle,
    Bell,
    Bot,
    CalendarDays,
    ClipboardCheck,
    CreditCard,
    Home,
    Loader2,
    Package,
    Settings,
    Shuffle,
    Sliders,
    TrendingUp,
    Truck,
    Users,
  } from '@lucide/svelte';

  interface Product {
    id: number;
    name: string;
    sku: string;
    stock: number;
    minStock: number;
  }

  interface Movement {
    id: number;
    quantity: number;
    type: string;
    note: string;
    date: string;
  }

  interface Todo {
    id: number;
    completed: boolean;
    priority: string;
    title: string;
  }

  interface CalendarEvent {
    id: number;
    title: string;
    startDate: string;
    type: string;
  }

  interface Conversation {
    id: number;
    title: string;
    status: string;
    updatedAt: string;
  }

  interface Notification {
    id: number;
    title: string;
    severity: string;
    read: boolean;
    createdAt: string;
  }

  interface StockTransfer {
    id: number;
    status: string;
  }

  interface CycleCount {
    id: number;
    status: string;
  }

  interface InventoryAdjustment {
    id: number;
    status: string;
  }

  interface ReorderRule {
    id: number;
    status: string;
  }

  const productsQuery = useList({ resource: 'products', pagination: { mode: 'off' } });
  const suppliersQuery = useList({ resource: 'suppliers', pagination: { current: 1, pageSize: 1 } });
  const warehousesQuery = useList({ resource: 'warehouses', pagination: { current: 1, pageSize: 1 } });
  const movementsQuery = useList({ resource: 'stock_movements', pagination: { current: 1, pageSize: 5 }, sorters: [{ field: 'date', order: 'desc' }] });
  const transfersQuery = useList({ resource: 'stock_transfers', pagination: { mode: 'off' } });
  const cycleCountsQuery = useList({ resource: 'cycle_counts', pagination: { mode: 'off' } });
  const adjustmentsQuery = useList({ resource: 'inventory_adjustments', pagination: { mode: 'off' } });
  const reorderRulesQuery = useList({ resource: 'reorder_rules', pagination: { mode: 'off' } });
  const purchaseOrdersQuery = useList({ resource: 'purchase_orders', pagination: { current: 1, pageSize: 1 } });
  const salesOrdersQuery = useList({ resource: 'sales_orders', pagination: { current: 1, pageSize: 1 } });
  const todosQuery = useList({ resource: 'todos', pagination: { mode: 'off' } });
  const usersQuery = useList({ resource: 'users', pagination: { current: 1, pageSize: 1 } });
  const rolesQuery = useList({ resource: 'roles', pagination: { current: 1, pageSize: 1 } });
  const calendarQuery = useList({
    resource: 'calendar_events',
    pagination: { current: 1, pageSize: 3 },
    sorters: [{ field: 'startDate', order: 'asc' }],
  });
  const conversationsQuery = useList({
    resource: 'ai_conversations',
    pagination: { current: 1, pageSize: 3 },
    sorters: [{ field: 'updatedAt', order: 'desc' }],
  });
  const notificationsQuery = useList({
    resource: 'notifications',
    pagination: { current: 1, pageSize: 3 },
    sorters: [{ field: 'createdAt', order: 'desc' }],
  });

  const products = $derived((productsQuery.data?.data ?? []) as unknown as Product[]);
  const movements = $derived((movementsQuery.data?.data ?? []) as unknown as Movement[]);
  const transfers = $derived((transfersQuery.data?.data ?? []) as unknown as StockTransfer[]);
  const cycleCounts = $derived((cycleCountsQuery.data?.data ?? []) as unknown as CycleCount[]);
  const adjustments = $derived((adjustmentsQuery.data?.data ?? []) as unknown as InventoryAdjustment[]);
  const reorderRules = $derived((reorderRulesQuery.data?.data ?? []) as unknown as ReorderRule[]);
  const todos = $derived((todosQuery.data?.data ?? []) as unknown as Todo[]);
  const calendarEvents = $derived((calendarQuery.data?.data ?? []) as unknown as CalendarEvent[]);
  const conversations = $derived((conversationsQuery.data?.data ?? []) as unknown as Conversation[]);
  const notifications = $derived((notificationsQuery.data?.data ?? []) as unknown as Notification[]);

  const isLoading = $derived(
    productsQuery.isLoading ||
      suppliersQuery.isLoading ||
      warehousesQuery.isLoading ||
      movementsQuery.isLoading ||
      transfersQuery.isLoading ||
      cycleCountsQuery.isLoading ||
      adjustmentsQuery.isLoading ||
      reorderRulesQuery.isLoading ||
      purchaseOrdersQuery.isLoading ||
      salesOrdersQuery.isLoading ||
      todosQuery.isLoading ||
      usersQuery.isLoading ||
      rolesQuery.isLoading ||
      calendarQuery.isLoading ||
      conversationsQuery.isLoading ||
      notificationsQuery.isLoading,
  );

  const totalStock = $derived(products.reduce((sum, product) => sum + product.stock, 0));
  const lowStockProducts = $derived(products.filter((product) => product.stock <= product.minStock));
  const openTodos = $derived(todos.filter((todo) => !todo.completed).length);
  const unreadNotifications = $derived(notifications.filter((notification) => !notification.read).length);
  const openConversations = $derived(conversations.filter((conversation) => conversation.status !== 'resolved').length);
  const activeTransfers = $derived(transfers.filter((transfer) => !['received', 'cancelled'].includes(transfer.status)).length);
  const activeCycleCounts = $derived(cycleCounts.filter((count) => !['reconciled', 'cancelled'].includes(count.status)).length);
  const pendingAdjustments = $derived(adjustments.filter((adjustment) => adjustment.status === 'pending_approval').length);
  const reviewReorderRules = $derived(reorderRules.filter((rule) => rule.status === 'review').length);
  const currentLocale = $derived(getLocale());
  const isZh = $derived(currentLocale === 'zh-CN');

  function tr(en: string, zh: string): string {
    return isZh ? zh : en;
  }

  const stats = $derived([
    { label: tr('Stock Units', '库存总量'), value: totalStock, hint: tr('Across active products', '覆盖所有在售商品'), href: '#/products', Icon: Package, tone: 'from-sky-500 to-blue-600' },
    { label: tr('Low Stock', '低库存预警'), value: lowStockProducts.length, hint: tr('Need replenishment', '需要补货关注'), href: '#/products', Icon: AlertTriangle, tone: 'from-rose-500 to-orange-500' },
    { label: tr('Warehouses', '仓库节点'), value: warehousesQuery.data?.total ?? 0, hint: tr('Fulfillment locations', '履约与存储节点'), href: '#/warehouses', Icon: Home, tone: 'from-emerald-500 to-teal-600' },
    { label: tr('Suppliers', '供应商'), value: suppliersQuery.data?.total ?? 0, hint: tr('Active partners', '活跃合作伙伴'), href: '#/suppliers', Icon: Truck, tone: 'from-amber-500 to-yellow-600' },
  ]);

  const orderSummary = $derived([
    { label: tr('Purchase Orders', '采购订单'), value: purchaseOrdersQuery.data?.total ?? 0, href: '#/purchase_orders', Icon: ClipboardCheck },
    { label: tr('Sales Orders', '销售订单'), value: salesOrdersQuery.data?.total ?? 0, href: '#/sales_orders', Icon: CreditCard },
    { label: tr('Open Todo', '待办事项'), value: openTodos, href: '#/todos', Icon: TrendingUp },
    { label: tr('Stock Transfers', '库存调拨'), value: activeTransfers, href: '#/stock_transfers', Icon: Shuffle },
    { label: tr('Cycle Counts', '循环盘点'), value: activeCycleCounts, href: '#/cycle_counts', Icon: ClipboardCheck },
    { label: tr('Adjustments', '库存调整'), value: pendingAdjustments, href: '#/inventory_adjustments', Icon: Sliders },
    { label: tr('Reorder Rules', '补货规则'), value: reviewReorderRules, href: '#/reorder_rules', Icon: Settings },
  ]);

  const roadmapModules = $derived([
    {
      label: tr('User Management', '组织权限'),
      value: usersQuery.data?.total ?? 0,
      meta: tr(`${rolesQuery.data?.total ?? 0} roles`, `${rolesQuery.data?.total ?? 0} 个角色`),
      href: '#/users',
      Icon: Users,
      tone: 'bg-primary/10 text-primary border-primary/20',
    },
    {
      label: tr('Calendar', '计划日程'),
      value: calendarQuery.data?.total ?? 0,
      meta: tr('purchase and count planning', '采购与盘点计划'),
      href: '#/calendar_events',
      Icon: CalendarDays,
      tone: 'bg-info/10 text-info border-info/20',
    },
    {
      label: tr('AI Chat', 'AI 对话'),
      value: openConversations,
      meta: tr('open operations threads', '待处理运营会话'),
      href: '#/ai_conversations',
      Icon: Bot,
      tone: 'bg-primary/10 text-primary border-primary/20',
    },
    {
      label: tr('Notification Center', '通知中心'),
      value: unreadNotifications,
      meta: tr('unread notices', '未读通知'),
      href: '#/notifications',
      Icon: Bell,
      tone: 'bg-warning/10 text-warning border-warning/20',
    },
  ]);

  function movementTone(type: string): string {
    if (type === 'in') return 'text-success bg-success/10';
    if (type === 'out') return 'text-destructive bg-destructive/10';
    return 'text-warning bg-warning/10';
  }

  function signedQuantity(movement: Movement): string {
    if (movement.type === 'in') return `+${movement.quantity}`;
    return String(movement.quantity);
  }

  function notificationTone(severity: string): string {
    if (severity === 'critical') return 'bg-destructive/10 text-destructive';
    if (severity === 'warning') return 'bg-warning/10 text-warning';
    return 'bg-muted text-muted-foreground';
  }

  function statusLabel(status: string): string {
    const labels: Record<string, string> = {
      open: '打开',
      waiting: '等待中',
      resolved: '已解决',
      critical: '严重',
      warning: '警告',
      info: '信息',
    };
    return isZh ? (labels[status] ?? status) : status;
  }

  function eventTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      purchase: '采购',
      cycle_count: '盘点',
      receiving: '收货',
      review: '复核',
    };
    return isZh ? (labels[type] ?? type) : type;
  }
</script>

<div class="space-y-6">
  <header class="border-b border-border/60 pb-5">
    <div class="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
    <div>
        <span class="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {tr('Live operations dashboard', '实时运营驾驶舱')}
        </span>
      <h1 class="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
        {tr('Inventory Platform', '库存运营平台')}
      </h1>
      <p class="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
        {tr('A focused svadmin example for inventory, operations, access, planning, assistance, and notifications.', '面向库存、订单、调拨、盘点、权限、日程、AI 协同和通知的 svadmin 原创后台示例。')}
      </p>
    </div>
      <div class="grid gap-3 sm:grid-cols-3 xl:w-[520px]">
        <div class="py-3">
          <p class="text-xs font-medium text-muted-foreground">{tr('Open Work', '待处理事项')}</p>
          <p class="mt-2 text-2xl font-semibold">{openTodos + activeTransfers + pendingAdjustments}</p>
        </div>
        <div class="py-3">
          <p class="text-xs font-medium text-muted-foreground">{tr('Alerts', '风险提醒')}</p>
          <p class="mt-2 text-2xl font-semibold text-destructive">{lowStockProducts.length + unreadNotifications}</p>
        </div>
        <div class="py-3">
          <p class="text-xs font-medium text-muted-foreground">{tr('AI Threads', 'AI 会话')}</p>
          <p class="mt-2 text-2xl font-semibold">{openConversations}</p>
        </div>
      </div>
    </div>
      {#if isLoading}
      <div class="relative mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 class="h-4 w-4 animate-spin" />
        {tr('Refreshing', '正在刷新')}
      </div>
    {/if}
  </header>

  <!-- Key stats -->
  <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {#each stats as stat (stat.label)}
      <a href={stat.href} class="group block border-b border-border/60 py-4 transition hover:text-primary">
            <div class="p-5">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
              <p class="truncate text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{stat.label}</p>
              <p class="mt-3 text-3xl font-semibold text-foreground">{stat.value}</p>
              <p class="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
          </div>
            <span class="flex h-12 w-12 shrink-0 items-center justify-center text-muted-foreground transition group-hover:scale-105 group-hover:text-primary">
            <stat.Icon class="h-5 w-5" />
          </span>
        </div>
        </div>
      </a>
    {/each}
  </section>

  <!-- Inventory Health + Operations Queue -->
  <section class="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
    <Card.Root>
      <Card.Header>
        <Card.Title class="text-sm font-semibold">{tr('Inventory Health', '库存健康')}</Card.Title>
        <a class="text-sm font-medium text-primary hover:underline" href="#/products">{tr('Products', '商品档案')}</a>
      </Card.Header>
      <Card.Content class="p-0">
        <div class="divide-y">
          {#each lowStockProducts as product (product.id)}
            <div class="flex items-center justify-between gap-4 px-5 py-3">
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-foreground">{product.name}</p>
                <p class="text-xs text-muted-foreground">{product.sku}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-destructive">{product.stock} / {product.minStock}</p>
                <p class="text-xs text-muted-foreground">{tr('on hand / minimum', '现有 / 最低')}</p>
              </div>
            </div>
          {:else}
            <div class="px-5 py-8 text-sm text-muted-foreground">{tr('All tracked products are above threshold.', '所有跟踪商品均高于安全库存。')}</div>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header>
        <Card.Title class="text-sm font-semibold">{tr('Operations Queue', '运营队列')}</Card.Title>
      </Card.Header>
      <Card.Content class="p-4">
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {#each orderSummary as item (item.label)}
            <a href={item.href} class="py-3 transition hover:text-primary">
              <div class="flex items-center justify-between gap-3">
                <span class="flex h-8 w-8 items-center justify-center text-muted-foreground">
                  <item.Icon class="h-4 w-4" />
                </span>
                <span class="text-lg font-semibold text-foreground">{item.value}</span>
              </div>
              <p class="mt-2 text-xs font-medium text-muted-foreground">{item.label}</p>
            </a>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>
  </section>

  <!-- Roadmap modules -->
  <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {#each roadmapModules as module (module.label)}
      <a href={module.href} class="border-b border-border/60 py-4 transition hover:text-primary">
        <div class="flex items-center justify-between gap-3">
          <span class="flex h-11 w-11 shrink-0 items-center justify-center {module.tone}">
            <module.Icon class="h-5 w-5" />
          </span>
          <span class="text-2xl font-semibold text-foreground">{module.value}</span>
        </div>
        <div class="mt-3">
          <p class="text-sm font-semibold text-foreground">{module.label}</p>
          <p class="mt-1 text-xs text-muted-foreground">{module.meta}</p>
        </div>
      </a>
    {/each}
  </section>

  <!-- Calendar / AI / Notifications columns -->
  <section class="grid gap-4 xl:grid-cols-3">
    <Card.Root>
      <Card.Header>
        <Card.Title class="text-sm font-semibold">{tr('Calendar', '计划日程')}</Card.Title>
        <a class="text-sm font-medium text-primary hover:underline" href="#/calendar_events">{tr('View all', '查看全部')}</a>
      </Card.Header>
      <Card.Content class="p-0">
        <div class="divide-y">
          {#each calendarEvents as event (event.id)}
            <div class="px-5 py-3">
              <p class="truncate text-sm font-medium text-foreground">{event.title}</p>
              <p class="mt-1 text-xs text-muted-foreground">{event.startDate} / {eventTypeLabel(event.type)}</p>
            </div>
          {:else}
            <div class="px-5 py-8 text-sm text-muted-foreground">{tr('No scheduled events.', '暂无计划日程。')}</div>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header>
        <Card.Title class="text-sm font-semibold">{tr('AI Operations', 'AI 运营助手')}</Card.Title>
        <a class="text-sm font-medium text-primary hover:underline" href="#/ai_conversations">{tr('View all', '查看全部')}</a>
      </Card.Header>
      <Card.Content class="p-0">
        <div class="divide-y">
          {#each conversations as conversation (conversation.id)}
            <div class="flex items-center justify-between gap-4 px-5 py-3">
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-foreground">{conversation.title}</p>
                <p class="text-xs text-muted-foreground">{conversation.updatedAt}</p>
              </div>
              <span class="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{statusLabel(conversation.status)}</span>
            </div>
          {:else}
            <div class="px-5 py-8 text-sm text-muted-foreground">{tr('No AI threads yet.', '暂无 AI 会话。')}</div>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header>
        <Card.Title class="text-sm font-semibold">{tr('Notifications', '通知中心')}</Card.Title>
        <a class="text-sm font-medium text-primary hover:underline" href="#/notifications">{tr('View all', '查看全部')}</a>
      </Card.Header>
      <Card.Content class="p-0">
        <div class="divide-y">
          {#each notifications as notification (notification.id)}
            <div class="flex items-center justify-between gap-4 px-5 py-3">
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-foreground">{notification.title}</p>
                <p class="text-xs text-muted-foreground">{notification.createdAt}</p>
              </div>
              <span class="rounded-md px-2 py-1 text-xs font-semibold {notificationTone(notification.severity)}">
                {statusLabel(notification.severity)}
              </span>
            </div>
          {:else}
            <div class="px-5 py-8 text-sm text-muted-foreground">{tr('No notifications yet.', '暂无通知。')}</div>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>
  </section>

  <!-- Recent Stock Movements -->
  <Card.Root>
    <Card.Header>
      <Card.Title class="text-sm font-semibold">{tr('Recent Stock Movements', '最近库存流水')}</Card.Title>
      <a class="text-sm font-medium text-primary hover:underline" href="#/stock_movements">{tr('View all', '查看全部')}</a>
    </Card.Header>
    <Card.Content class="p-0">
      <div class="divide-y">
        {#each movements as movement (movement.id)}
          <div class="flex items-center justify-between gap-4 px-5 py-3">
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-foreground">{movement.note}</p>
              <p class="text-xs text-muted-foreground">{movement.date}</p>
            </div>
            <span class="rounded-md px-2 py-1 text-xs font-semibold {movementTone(movement.type)}">
              {signedQuantity(movement)}
            </span>
          </div>
        {:else}
          <div class="px-5 py-8 text-sm text-muted-foreground">{tr('No movements recorded yet.', '暂无库存流水。')}</div>
        {/each}
      </div>
    </Card.Content>
  </Card.Root>
</div>
