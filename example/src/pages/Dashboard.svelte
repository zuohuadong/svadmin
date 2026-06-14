<script lang="ts">
  import { useList } from '@svadmin/core';
  import { getLocale } from '@svadmin/core/i18n';
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

  const locale = $derived(getLocale());
  const isZh = $derived(locale === 'zh-CN');

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

  const stats = $derived([
    { label: isZh ? '库存件数' : 'Stock Units', value: totalStock, href: '#/products', Icon: Package, tone: 'bg-info/10 text-info border-info/20' },
    { label: isZh ? '低库存' : 'Low Stock', value: lowStockProducts.length, href: '#/products', Icon: AlertTriangle, tone: 'bg-destructive/10 text-destructive border-destructive/20' },
    { label: isZh ? '仓库' : 'Warehouses', value: warehousesQuery.data?.total ?? 0, href: '#/warehouses', Icon: Home, tone: 'bg-success/10 text-success border-success/20' },
    { label: isZh ? '供应商' : 'Suppliers', value: suppliersQuery.data?.total ?? 0, href: '#/suppliers', Icon: Truck, tone: 'bg-warning/10 text-warning border-warning/20' },
  ]);

  const orderSummary = $derived([
    { label: isZh ? '采购订单' : 'Purchase Orders', value: purchaseOrdersQuery.data?.total ?? 0, href: '#/purchase_orders', Icon: ClipboardCheck },
    { label: isZh ? '销售订单' : 'Sales Orders', value: salesOrdersQuery.data?.total ?? 0, href: '#/sales_orders', Icon: CreditCard },
    { label: isZh ? '待办未结' : 'Open Todo', value: openTodos, href: '#/todos', Icon: TrendingUp },
    { label: isZh ? '库存调拨' : 'Stock Transfers', value: activeTransfers, href: '#/stock_transfers', Icon: Shuffle },
    { label: isZh ? '循环盘点' : 'Cycle Counts', value: activeCycleCounts, href: '#/cycle_counts', Icon: ClipboardCheck },
    { label: isZh ? '库存调整' : 'Adjustments', value: pendingAdjustments, href: '#/inventory_adjustments', Icon: Sliders },
    { label: isZh ? '补货规则' : 'Reorder Rules', value: reviewReorderRules, href: '#/reorder_rules', Icon: Settings },
  ]);

  const roadmapModules = $derived([
    {
      label: isZh ? '用户管理' : 'User Management',
      value: usersQuery.data?.total ?? 0,
      meta: isZh ? `${rolesQuery.data?.total ?? 0} 个角色` : `${rolesQuery.data?.total ?? 0} roles`,
      href: '#/users',
      Icon: Users,
      tone: 'bg-primary/10 text-primary border-primary/20',
    },
    {
      label: isZh ? '日历' : 'Calendar',
      value: calendarQuery.data?.total ?? 0,
      meta: isZh ? '采购与盘点计划' : 'purchase and count planning',
      href: '#/calendar_events',
      Icon: CalendarDays,
      tone: 'bg-info/10 text-info border-info/20',
    },
    {
      label: isZh ? 'AI 对话' : 'AI Chat',
      value: openConversations,
      meta: isZh ? '进行中的运营对话' : 'open operations threads',
      href: '#/ai_conversations',
      Icon: Bot,
      tone: 'bg-primary/10 text-primary border-primary/20',
    },
    {
      label: isZh ? '通知中心' : 'Notification Center',
      value: unreadNotifications,
      meta: isZh ? '未读提醒' : 'unread notices',
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

  function eventTypeLabel(type: string): string {
    if (!isZh) return type;
    if (type === 'cycle_count') return '盘点';
    if (type === 'receiving') return '收货';
    if (type === 'purchase') return '采购';
    return type;
  }

  function conversationStatusLabel(status: string): string {
    if (!isZh) return status;
    if (status === 'open') return '进行中';
    if (status === 'waiting') return '等待';
    if (status === 'resolved') return '已解决';
    return status;
  }

  function severityLabel(severity: string): string {
    if (!isZh) return severity;
    if (severity === 'critical') return '紧急';
    if (severity === 'warning') return '预警';
    if (severity === 'info') return '信息';
    return severity;
  }
</script>

<div class="space-y-6">
  <header class="grid gap-4 border-b border-border/60 pb-5 xl:grid-cols-[1fr_0.82fr]">
    <div class="min-w-0">
      <div class="inline-flex items-center rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
        {isZh ? '运营驾驶舱' : 'Operations Cockpit'}
      </div>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight text-foreground">
        {isZh ? '库存运营示例平台' : 'Inventory Operations Platform'}
      </h1>
      <p class="mt-2 max-w-3xl text-sm text-muted-foreground">
        {isZh
          ? '集中呈现库存、作业、权限、计划、AI 对话和通知的高密度后台示例。'
          : 'A dense svadmin workspace for inventory, operations, access, planning, assistance, and notifications.'}
      </p>
      <div class="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span class="rounded-md border bg-card px-2.5 py-1">{isZh ? '本地数据源' : 'Local data provider'}</span>
        <span class="rounded-md border bg-card px-2.5 py-1">{isZh ? 'CRUD 闭环' : 'CRUD flows'}</span>
        <span class="rounded-md border bg-card px-2.5 py-1">{isZh ? 'AI 助手演示' : 'AI assistant demo'}</span>
      </div>
    </div>

    <div class="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
      <div class="rounded-lg border bg-card px-4 py-3">
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{isZh ? '履约健康' : 'Fulfillment Health'}</p>
        <p class="mt-2 text-2xl font-semibold text-foreground">{lowStockProducts.length === 0 ? '100%' : '91%'}</p>
        <p class="mt-1 text-xs text-muted-foreground">{isZh ? '低库存风险已纳入队列' : 'low-stock risk is queued'}</p>
      </div>
      <div class="rounded-lg border bg-card px-4 py-3">
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{isZh ? '待处理' : 'Open Work'}</p>
        <p class="mt-2 text-2xl font-semibold text-foreground">{openTodos + activeTransfers + pendingAdjustments}</p>
        <p class="mt-1 text-xs text-muted-foreground">{isZh ? '待办、调拨与审批' : 'todos, transfers, approvals'}</p>
      </div>
      <div class="rounded-lg border bg-card px-4 py-3">
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{isZh ? '刷新状态' : 'Refresh'}</p>
        <p class="mt-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          {#if isLoading}
            <Loader2 class="h-4 w-4 animate-spin" />
            {isZh ? '同步中' : 'Refreshing'}
          {:else}
            {isZh ? '已同步' : 'Synced'}
          {/if}
        </p>
        <p class="mt-1 text-xs text-muted-foreground">{isZh ? '示例数据实时读取' : 'example data is live'}</p>
      </div>
    </div>
  </header>

  <!-- Key stats -->
  <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    {#each stats as stat (stat.label)}
      <a href={stat.href} class="block rounded-lg border bg-card px-6 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate text-xs font-medium uppercase text-muted-foreground">{stat.label}</p>
            <p class="mt-2 text-2xl font-semibold text-foreground">{stat.value}</p>
          </div>
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border {stat.tone}">
            <stat.Icon class="h-5 w-5" />
          </span>
        </div>
      </a>
    {/each}
  </section>

  <!-- Inventory Health + Operations Queue -->
  <section class="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
    <Card.Root class="overflow-hidden border-border/40">
      <Card.Header class="flex flex-row items-center justify-between border-b px-6 py-4">
        <Card.Title class="text-sm font-semibold">{isZh ? '库存健康' : 'Inventory Health'}</Card.Title>
        <a class="text-sm font-medium text-primary hover:underline" href="#/products">{isZh ? '商品档案' : 'Products'}</a>
      </Card.Header>
      <Card.Content class="p-0">
        <div class="divide-y">
          {#each lowStockProducts as product (product.id)}
            <div class="flex items-center justify-between gap-4 px-6 py-4">
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-foreground">{product.name}</p>
                <p class="text-xs text-muted-foreground">{product.sku}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-destructive">{product.stock} / {product.minStock}</p>
                <p class="text-xs text-muted-foreground">{isZh ? '现有 / 下限' : 'on hand / minimum'}</p>
              </div>
            </div>
          {:else}
            <div class="px-6 py-8 text-sm text-muted-foreground">{isZh ? '所有跟踪商品均高于库存下限。' : 'All tracked products are above threshold.'}</div>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>

    <Card.Root class="overflow-hidden border-border/40">
      <Card.Header class="border-b px-6 py-4">
        <Card.Title class="text-sm font-semibold">{isZh ? '运营队列' : 'Operations Queue'}</Card.Title>
      </Card.Header>
      <Card.Content class="p-4">
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {#each orderSummary as item (item.label)}
            <a href={item.href} class="rounded-lg border p-3 transition hover:border-primary/50 hover:bg-muted/50">
              <div class="flex items-center justify-between gap-3">
                <item.Icon class="h-4 w-4 text-muted-foreground" />
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
  <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    {#each roadmapModules as module (module.label)}
      <a href={module.href} class="rounded-lg border bg-card px-6 py-4 shadow-sm transition hover:border-primary/50 hover:bg-muted/50">
        <div class="flex items-center justify-between gap-3">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border {module.tone}">
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
    <Card.Root class="overflow-hidden border-border/40">
      <Card.Header class="flex flex-row items-center justify-between border-b px-6 py-4">
        <Card.Title class="text-sm font-semibold">{isZh ? '日历' : 'Calendar'}</Card.Title>
        <a class="text-sm font-medium text-primary hover:underline" href="#/calendar_events">{isZh ? '查看全部' : 'View all'}</a>
      </Card.Header>
      <Card.Content class="p-0">
        <div class="divide-y">
          {#each calendarEvents as event (event.id)}
            <div class="px-6 py-4">
              <p class="truncate text-sm font-medium text-foreground">{event.title}</p>
              <p class="mt-1 text-xs text-muted-foreground">{event.startDate} / {eventTypeLabel(event.type)}</p>
            </div>
          {:else}
            <div class="px-6 py-8 text-sm text-muted-foreground">{isZh ? '暂无计划日程。' : 'No scheduled events.'}</div>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>

    <Card.Root class="overflow-hidden border-border/40">
      <Card.Header class="flex flex-row items-center justify-between border-b px-6 py-4">
        <Card.Title class="text-sm font-semibold">{isZh ? 'AI 运营' : 'AI Operations'}</Card.Title>
        <a class="text-sm font-medium text-primary hover:underline" href="#/ai_conversations">{isZh ? '查看全部' : 'View all'}</a>
      </Card.Header>
      <Card.Content class="p-0">
        <div class="divide-y">
          {#each conversations as conversation (conversation.id)}
            <div class="flex items-center justify-between gap-4 px-6 py-4">
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-foreground">{conversation.title}</p>
                <p class="text-xs text-muted-foreground">{conversation.updatedAt}</p>
              </div>
              <span class="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{conversationStatusLabel(conversation.status)}</span>
            </div>
          {:else}
            <div class="px-6 py-8 text-sm text-muted-foreground">{isZh ? '暂无 AI 对话。' : 'No AI threads yet.'}</div>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>

    <Card.Root class="overflow-hidden border-border/40">
      <Card.Header class="flex flex-row items-center justify-between border-b px-6 py-4">
        <Card.Title class="text-sm font-semibold">{isZh ? '通知' : 'Notifications'}</Card.Title>
        <a class="text-sm font-medium text-primary hover:underline" href="#/notifications">{isZh ? '查看全部' : 'View all'}</a>
      </Card.Header>
      <Card.Content class="p-0">
        <div class="divide-y">
          {#each notifications as notification (notification.id)}
            <div class="flex items-center justify-between gap-4 px-6 py-4">
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-foreground">{notification.title}</p>
                <p class="text-xs text-muted-foreground">{notification.createdAt}</p>
              </div>
              <span class="rounded-md px-2 py-1 text-xs font-semibold {notificationTone(notification.severity)}">
                {severityLabel(notification.severity)}
              </span>
            </div>
          {:else}
            <div class="px-6 py-8 text-sm text-muted-foreground">{isZh ? '暂无通知。' : 'No notifications yet.'}</div>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>
  </section>

  <!-- Recent Stock Movements -->
  <Card.Root class="overflow-hidden border-border/40">
    <Card.Header class="flex flex-row items-center justify-between border-b px-6 py-4">
      <Card.Title class="text-sm font-semibold">{isZh ? '近期库存流水' : 'Recent Stock Movements'}</Card.Title>
      <a class="text-sm font-medium text-primary hover:underline" href="#/stock_movements">{isZh ? '查看全部' : 'View all'}</a>
    </Card.Header>
    <Card.Content class="p-0">
      <div class="divide-y">
        {#each movements as movement (movement.id)}
          <div class="flex items-center justify-between gap-4 px-6 py-4">
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-foreground">{movement.note}</p>
              <p class="text-xs text-muted-foreground">{movement.date}</p>
            </div>
            <span class="rounded-md px-2 py-1 text-xs font-semibold {movementTone(movement.type)}">
              {signedQuantity(movement)}
            </span>
          </div>
      {:else}
          <div class="px-6 py-8 text-sm text-muted-foreground">{isZh ? '暂无库存流水。' : 'No movements recorded yet.'}</div>
      {/each}
      </div>
    </Card.Content>
  </Card.Root>
</div>
