<script lang="ts">
  import { useList } from '@svadmin/core';
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

  const productsQuery = useList({ resource: 'products', pagination: { mode: 'off' } });
  const suppliersQuery = useList({ resource: 'suppliers', pagination: { current: 1, pageSize: 1 } });
  const warehousesQuery = useList({ resource: 'warehouses', pagination: { current: 1, pageSize: 1 } });
  const movementsQuery = useList({ resource: 'stock_movements', pagination: { current: 1, pageSize: 5 }, sorters: [{ field: 'date', order: 'desc' }] });
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
  const todos = $derived((todosQuery.data?.data ?? []) as unknown as Todo[]);
  const calendarEvents = $derived((calendarQuery.data?.data ?? []) as unknown as CalendarEvent[]);
  const conversations = $derived((conversationsQuery.data?.data ?? []) as unknown as Conversation[]);
  const notifications = $derived((notificationsQuery.data?.data ?? []) as unknown as Notification[]);

  const isLoading = $derived(
    productsQuery.isLoading ||
      suppliersQuery.isLoading ||
      warehousesQuery.isLoading ||
      movementsQuery.isLoading ||
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

  const stats = $derived([
    { label: 'Stock Units', value: totalStock, href: '#/products', Icon: Package, tone: 'bg-sky-50 text-sky-700 border-sky-100' },
    { label: 'Low Stock', value: lowStockProducts.length, href: '#/products', Icon: AlertTriangle, tone: 'bg-rose-50 text-rose-700 border-rose-100' },
    { label: 'Warehouses', value: warehousesQuery.data?.total ?? 0, href: '#/warehouses', Icon: Home, tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { label: 'Suppliers', value: suppliersQuery.data?.total ?? 0, href: '#/suppliers', Icon: Truck, tone: 'bg-amber-50 text-amber-700 border-amber-100' },
  ]);

  const orderSummary = $derived([
    { label: 'Purchase Orders', value: purchaseOrdersQuery.data?.total ?? 0, href: '#/purchase_orders', Icon: ClipboardCheck },
    { label: 'Sales Orders', value: salesOrdersQuery.data?.total ?? 0, href: '#/sales_orders', Icon: CreditCard },
    { label: 'Open Todo', value: openTodos, href: '#/todos', Icon: TrendingUp },
  ]);

  const roadmapModules = $derived([
    {
      label: 'User Management',
      value: usersQuery.data?.total ?? 0,
      meta: `${rolesQuery.data?.total ?? 0} roles`,
      href: '#/users',
      Icon: Users,
      tone: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    },
    {
      label: 'Calendar',
      value: calendarQuery.data?.total ?? 0,
      meta: 'purchase and count planning',
      href: '#/calendar_events',
      Icon: CalendarDays,
      tone: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    },
    {
      label: 'AI Chat',
      value: openConversations,
      meta: 'open operations threads',
      href: '#/ai_conversations',
      Icon: Bot,
      tone: 'bg-violet-50 text-violet-700 border-violet-100',
    },
    {
      label: 'Notification Center',
      value: unreadNotifications,
      meta: 'unread notices',
      href: '#/notifications',
      Icon: Bell,
      tone: 'bg-orange-50 text-orange-700 border-orange-100',
    },
  ]);

  function movementTone(type: string): string {
    if (type === 'in') return 'text-emerald-700 bg-emerald-50';
    if (type === 'out') return 'text-rose-700 bg-rose-50';
    return 'text-amber-700 bg-amber-50';
  }

  function signedQuantity(movement: Movement): string {
    if (movement.type === 'in') return `+${movement.quantity}`;
    return String(movement.quantity);
  }

  function notificationTone(severity: string): string {
    if (severity === 'critical') return 'bg-rose-50 text-rose-700';
    if (severity === 'warning') return 'bg-amber-50 text-amber-700';
    return 'bg-slate-100 text-slate-700';
  }
</script>

<div class="space-y-6">
  <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 class="text-2xl font-semibold text-gray-950">Inventory Platform</h1>
      <p class="mt-1 text-sm text-gray-500">
        A focused svadmin example for inventory, access, planning, assistance, and notifications.
      </p>
    </div>
    {#if isLoading}
      <div class="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 class="h-4 w-4 animate-spin" />
        Refreshing
      </div>
    {/if}
  </header>

  <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    {#each stats as stat (stat.label)}
      <a href={stat.href} class="rounded-lg border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate text-xs font-medium uppercase text-gray-500">{stat.label}</p>
            <p class="mt-2 text-2xl font-semibold text-gray-950">{stat.value}</p>
          </div>
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border {stat.tone}">
            <stat.Icon class="h-5 w-5" />
          </span>
        </div>
      </a>
    {/each}
  </section>

  <section class="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
    <div class="rounded-lg border bg-white shadow-sm">
      <div class="flex items-center justify-between border-b px-5 py-4">
        <h2 class="text-sm font-semibold text-gray-950">Inventory Health</h2>
        <a class="text-sm font-medium text-primary hover:underline" href="#/products">Products</a>
      </div>
      <div class="divide-y">
        {#each lowStockProducts as product (product.id)}
          <div class="flex items-center justify-between gap-4 px-5 py-3">
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-gray-950">{product.name}</p>
              <p class="text-xs text-gray-500">{product.sku}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-rose-700">{product.stock} / {product.minStock}</p>
              <p class="text-xs text-gray-500">on hand / minimum</p>
            </div>
          </div>
        {:else}
          <div class="px-5 py-8 text-sm text-gray-500">All tracked products are above threshold.</div>
        {/each}
      </div>
    </div>

    <div class="rounded-lg border bg-white shadow-sm">
      <div class="border-b px-5 py-4">
        <h2 class="text-sm font-semibold text-gray-950">Operations Queue</h2>
      </div>
      <div class="grid gap-3 p-4 sm:grid-cols-3 lg:grid-cols-1">
        {#each orderSummary as item (item.label)}
          <a href={item.href} class="rounded-lg border p-3 transition hover:border-primary/50 hover:bg-gray-50">
            <div class="flex items-center justify-between gap-3">
              <item.Icon class="h-4 w-4 text-gray-500" />
              <span class="text-lg font-semibold text-gray-950">{item.value}</span>
            </div>
            <p class="mt-2 text-xs font-medium text-gray-500">{item.label}</p>
          </a>
        {/each}
      </div>
    </div>
  </section>

  <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    {#each roadmapModules as module (module.label)}
      <a href={module.href} class="rounded-lg border bg-white p-4 shadow-sm transition hover:border-primary/50 hover:bg-gray-50">
        <div class="flex items-center justify-between gap-3">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border {module.tone}">
            <module.Icon class="h-5 w-5" />
          </span>
          <span class="text-2xl font-semibold text-gray-950">{module.value}</span>
        </div>
        <div class="mt-3">
          <p class="text-sm font-semibold text-gray-950">{module.label}</p>
          <p class="mt-1 text-xs text-gray-500">{module.meta}</p>
        </div>
      </a>
    {/each}
  </section>

  <section class="grid gap-4 xl:grid-cols-3">
    <div class="rounded-lg border bg-white shadow-sm">
      <div class="flex items-center justify-between border-b px-5 py-4">
        <h2 class="text-sm font-semibold text-gray-950">Calendar</h2>
        <a class="text-sm font-medium text-primary hover:underline" href="#/calendar_events">View all</a>
      </div>
      <div class="divide-y">
        {#each calendarEvents as event (event.id)}
          <div class="px-5 py-3">
            <p class="truncate text-sm font-medium text-gray-950">{event.title}</p>
            <p class="mt-1 text-xs text-gray-500">{event.startDate} / {event.type}</p>
          </div>
        {:else}
          <div class="px-5 py-8 text-sm text-gray-500">No scheduled events.</div>
        {/each}
      </div>
    </div>

    <div class="rounded-lg border bg-white shadow-sm">
      <div class="flex items-center justify-between border-b px-5 py-4">
        <h2 class="text-sm font-semibold text-gray-950">AI Operations</h2>
        <a class="text-sm font-medium text-primary hover:underline" href="#/ai_conversations">View all</a>
      </div>
      <div class="divide-y">
        {#each conversations as conversation (conversation.id)}
          <div class="flex items-center justify-between gap-4 px-5 py-3">
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-gray-950">{conversation.title}</p>
              <p class="text-xs text-gray-500">{conversation.updatedAt}</p>
            </div>
            <span class="rounded-md bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-700">{conversation.status}</span>
          </div>
        {:else}
          <div class="px-5 py-8 text-sm text-gray-500">No AI threads yet.</div>
        {/each}
      </div>
    </div>

    <div class="rounded-lg border bg-white shadow-sm">
      <div class="flex items-center justify-between border-b px-5 py-4">
        <h2 class="text-sm font-semibold text-gray-950">Notifications</h2>
        <a class="text-sm font-medium text-primary hover:underline" href="#/notifications">View all</a>
      </div>
      <div class="divide-y">
        {#each notifications as notification (notification.id)}
          <div class="flex items-center justify-between gap-4 px-5 py-3">
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-gray-950">{notification.title}</p>
              <p class="text-xs text-gray-500">{notification.createdAt}</p>
            </div>
            <span class="rounded-md px-2 py-1 text-xs font-semibold {notificationTone(notification.severity)}">
              {notification.severity}
            </span>
          </div>
        {:else}
          <div class="px-5 py-8 text-sm text-gray-500">No notifications yet.</div>
        {/each}
      </div>
    </div>
  </section>

  <section class="rounded-lg border bg-white shadow-sm">
    <div class="flex items-center justify-between border-b px-5 py-4">
      <h2 class="text-sm font-semibold text-gray-950">Recent Stock Movements</h2>
      <a class="text-sm font-medium text-primary hover:underline" href="#/stock_movements">View all</a>
    </div>
    <div class="divide-y">
      {#each movements as movement (movement.id)}
        <div class="flex items-center justify-between gap-4 px-5 py-3">
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-gray-950">{movement.note}</p>
            <p class="text-xs text-gray-500">{movement.date}</p>
          </div>
          <span class="rounded-md px-2 py-1 text-xs font-semibold {movementTone(movement.type)}">
            {signedQuantity(movement)}
          </span>
        </div>
      {:else}
        <div class="px-5 py-8 text-sm text-gray-500">No movements recorded yet.</div>
      {/each}
    </div>
  </section>
</div>
