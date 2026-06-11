<script lang="ts">
  import { useList } from '@svadmin/core';
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

  const stats = $derived([
    { label: 'Stock Units', value: totalStock, href: '#/products', Icon: Package, tone: 'bg-info/10 text-info border-info/20' },
    { label: 'Low Stock', value: lowStockProducts.length, href: '#/products', Icon: AlertTriangle, tone: 'bg-destructive/10 text-destructive border-destructive/20' },
    { label: 'Warehouses', value: warehousesQuery.data?.total ?? 0, href: '#/warehouses', Icon: Home, tone: 'bg-success/10 text-success border-success/20' },
    { label: 'Suppliers', value: suppliersQuery.data?.total ?? 0, href: '#/suppliers', Icon: Truck, tone: 'bg-warning/10 text-warning border-warning/20' },
  ]);

  const orderSummary = $derived([
    { label: 'Purchase Orders', value: purchaseOrdersQuery.data?.total ?? 0, href: '#/purchase_orders', Icon: ClipboardCheck },
    { label: 'Sales Orders', value: salesOrdersQuery.data?.total ?? 0, href: '#/sales_orders', Icon: CreditCard },
    { label: 'Open Todo', value: openTodos, href: '#/todos', Icon: TrendingUp },
    { label: 'Stock Transfers', value: activeTransfers, href: '#/stock_transfers', Icon: Shuffle },
    { label: 'Cycle Counts', value: activeCycleCounts, href: '#/cycle_counts', Icon: ClipboardCheck },
    { label: 'Adjustments', value: pendingAdjustments, href: '#/inventory_adjustments', Icon: Sliders },
    { label: 'Reorder Rules', value: reviewReorderRules, href: '#/reorder_rules', Icon: Settings },
  ]);

  const roadmapModules = $derived([
    {
      label: 'User Management',
      value: usersQuery.data?.total ?? 0,
      meta: `${rolesQuery.data?.total ?? 0} roles`,
      href: '#/users',
      Icon: Users,
      tone: 'bg-primary/10 text-primary border-primary/20',
    },
    {
      label: 'Calendar',
      value: calendarQuery.data?.total ?? 0,
      meta: 'purchase and count planning',
      href: '#/calendar_events',
      Icon: CalendarDays,
      tone: 'bg-info/10 text-info border-info/20',
    },
    {
      label: 'AI Chat',
      value: openConversations,
      meta: 'open operations threads',
      href: '#/ai_conversations',
      Icon: Bot,
      tone: 'bg-primary/10 text-primary border-primary/20',
    },
    {
      label: 'Notification Center',
      value: unreadNotifications,
      meta: 'unread notices',
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
</script>

<div class="space-y-6">
  <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 class="text-2xl font-semibold text-foreground">Inventory Platform</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        A focused svadmin example for inventory, operations, access, planning, assistance, and notifications.
      </p>
    </div>
    {#if isLoading}
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 class="h-4 w-4 animate-spin" />
        Refreshing
      </div>
    {/if}
  </header>

  <!-- Key stats -->
  <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    {#each stats as stat (stat.label)}
      <a href={stat.href} class="block rounded-lg border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
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
      <Card.Header class="flex flex-row items-center justify-between border-b px-5 py-4">
        <Card.Title class="text-sm font-semibold">Inventory Health</Card.Title>
        <a class="text-sm font-medium text-primary hover:underline" href="#/products">Products</a>
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
                <p class="text-xs text-muted-foreground">on hand / minimum</p>
              </div>
            </div>
          {:else}
            <div class="px-5 py-8 text-sm text-muted-foreground">All tracked products are above threshold.</div>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>

    <Card.Root class="overflow-hidden border-border/40">
      <Card.Header class="border-b px-5 py-4">
        <Card.Title class="text-sm font-semibold">Operations Queue</Card.Title>
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
      <a href={module.href} class="rounded-lg border bg-card p-4 shadow-sm transition hover:border-primary/50 hover:bg-muted/50">
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
      <Card.Header class="flex flex-row items-center justify-between border-b px-5 py-4">
        <Card.Title class="text-sm font-semibold">Calendar</Card.Title>
        <a class="text-sm font-medium text-primary hover:underline" href="#/calendar_events">View all</a>
      </Card.Header>
      <Card.Content class="p-0">
        <div class="divide-y">
          {#each calendarEvents as event (event.id)}
            <div class="px-5 py-3">
              <p class="truncate text-sm font-medium text-foreground">{event.title}</p>
              <p class="mt-1 text-xs text-muted-foreground">{event.startDate} / {event.type}</p>
            </div>
          {:else}
            <div class="px-5 py-8 text-sm text-muted-foreground">No scheduled events.</div>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>

    <Card.Root class="overflow-hidden border-border/40">
      <Card.Header class="flex flex-row items-center justify-between border-b px-5 py-4">
        <Card.Title class="text-sm font-semibold">AI Operations</Card.Title>
        <a class="text-sm font-medium text-primary hover:underline" href="#/ai_conversations">View all</a>
      </Card.Header>
      <Card.Content class="p-0">
        <div class="divide-y">
          {#each conversations as conversation (conversation.id)}
            <div class="flex items-center justify-between gap-4 px-5 py-3">
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-foreground">{conversation.title}</p>
                <p class="text-xs text-muted-foreground">{conversation.updatedAt}</p>
              </div>
              <span class="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{conversation.status}</span>
            </div>
          {:else}
            <div class="px-5 py-8 text-sm text-muted-foreground">No AI threads yet.</div>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>

    <Card.Root class="overflow-hidden border-border/40">
      <Card.Header class="flex flex-row items-center justify-between border-b px-5 py-4">
        <Card.Title class="text-sm font-semibold">Notifications</Card.Title>
        <a class="text-sm font-medium text-primary hover:underline" href="#/notifications">View all</a>
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
                {notification.severity}
              </span>
            </div>
          {:else}
            <div class="px-5 py-8 text-sm text-muted-foreground">No notifications yet.</div>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>
  </section>

  <!-- Recent Stock Movements -->
  <Card.Root class="overflow-hidden border-border/40">
    <Card.Header class="flex flex-row items-center justify-between border-b px-5 py-4">
      <Card.Title class="text-sm font-semibold">Recent Stock Movements</Card.Title>
      <a class="text-sm font-medium text-primary hover:underline" href="#/stock_movements">View all</a>
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
          <div class="px-5 py-8 text-sm text-muted-foreground">No movements recorded yet.</div>
        {/each}
      </div>
    </Card.Content>
  </Card.Root>
</div>
