<script lang="ts">
  import { getLocale } from '@svadmin/core/i18n';
  import { navigate } from '@svadmin/core/router';
  import { useList } from '@svadmin/core';
  import { AutoTable, Badge, Button } from '@svadmin/ui';
  import * as Card from '@svadmin/ui/components/ui/card/index.js';
  import { CreditCard, Download, FileCheck2, PackageCheck, Truck } from '@lucide/svelte';

  let { resourceName } = $props<{ resourceName: string }>();

  const locale = $derived(getLocale());
  const tr = (en: string, zh: string) => locale === 'zh-CN' ? zh : en;
  const isPurchase = $derived(resourceName === 'purchase_orders');
  const query = useList({ get resource() { return resourceName; }, pagination: { mode: 'off' } });
  const orders = $derived((query.data?.data ?? []) as Record<string, unknown>[]);
  const title = $derived(isPurchase ? tr('Purchase command center', '采购订单中心') : tr('Sales fulfillment board', '销售履约看板'));
  const description = $derived(isPurchase ? tr('Track supplier commitments, receiving windows, and open purchase value.', '跟踪供应商承诺、收货窗口和未结采购金额。') : tr('Coordinate customer orders, processing queues, and shipment readiness.', '协调客户订单、处理队列和发货准备。'));
  const statusFlow = $derived(isPurchase
    ? [
        { key: 'draft', label: tr('Draft', '草稿'), Icon: FileCheck2 },
        { key: 'ordered', label: tr('Ordered', '已下单'), Icon: Download },
        { key: 'received', label: tr('Received', '已收货'), Icon: PackageCheck },
      ]
    : [
        { key: 'pending', label: tr('Pending', '待处理'), Icon: FileCheck2 },
        { key: 'processing', label: tr('Processing', '处理中'), Icon: Truck },
        { key: 'shipped', label: tr('Shipped', '已发货'), Icon: PackageCheck },
      ]);

  function numberValue(record: Record<string, unknown>, key: string): number {
    const value = record[key];
    return typeof value === 'number' ? value : Number(value ?? 0);
  }

  const totalAmount = $derived(orders.reduce((sum, order) => sum + numberValue(order, 'totalAmount'), 0));
</script>

<div class="space-y-6">
  <section class="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
    <Card.Root class="rounded-[2rem] border-border/70 bg-card">
      <Card.Content class="p-6 sm:p-8">
        <Badge class="mb-4 rounded-full bg-sky-500/10 text-sky-700 hover:bg-sky-500/10">{isPurchase ? tr('Procurement', '采购') : tr('Sales', '销售')}</Badge>
        <h1 class="text-3xl font-semibold tracking-tight">{title}</h1>
        <p class="mt-2 text-sm text-muted-foreground">{description}</p>
        <div class="mt-6 flex flex-wrap gap-3">
          <Button class="rounded-xl" onclick={() => navigate(`/${resourceName}/create`)}>
            {tr('Create order', '新建订单')}
          </Button>
          <Button variant="outline" class="rounded-xl" onclick={() => navigate(isPurchase ? '/suppliers' : '/products')}>
            {isPurchase ? tr('Open suppliers', '查看供应商') : tr('Open catalog', '查看商品')}
          </Button>
        </div>
      </Card.Content>
    </Card.Root>

    <div class="grid gap-4 md:grid-cols-3">
      {#each statusFlow as status (status.key)}
        {@const count = orders.filter((order) => order.status === status.key).length}
        <Card.Root class="rounded-[2rem] border-border/70 bg-card">
          <Card.Content class="p-5">
            <div class="flex items-center justify-between gap-3">
              <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><status.Icon class="h-5 w-5" /></span>
              <span class="text-3xl font-semibold">{count}</span>
            </div>
            <p class="mt-4 text-sm font-medium">{status.label}</p>
            <p class="mt-1 text-xs text-muted-foreground">{tr('Orders in this lane', '当前状态订单')}</p>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  </section>

  <Card.Root class="rounded-[2rem] border-border/70 bg-card">
    <Card.Content class="grid gap-4 p-5 md:grid-cols-3">
      <div class="rounded-2xl bg-muted/25 p-4">
        <p class="text-xs uppercase tracking-[0.14em] text-muted-foreground">{tr('Total value', '订单总额')}</p>
        <p class="mt-2 text-2xl font-semibold">${totalAmount.toLocaleString()}</p>
      </div>
      <div class="rounded-2xl bg-muted/25 p-4">
        <p class="text-xs uppercase tracking-[0.14em] text-muted-foreground">{tr('Records', '记录数')}</p>
        <p class="mt-2 text-2xl font-semibold">{orders.length}</p>
      </div>
      <div class="rounded-2xl bg-muted/25 p-4">
        <p class="text-xs uppercase tracking-[0.14em] text-muted-foreground">{tr('Workflow', '工作流')}</p>
        <p class="mt-2 flex items-center gap-2 text-sm font-medium"><CreditCard class="h-4 w-4 text-primary" />{isPurchase ? tr('Supplier to warehouse', '供应商到仓库') : tr('Order to shipment', '订单到发货')}</p>
      </div>
    </Card.Content>
  </Card.Root>

  <AutoTable {resourceName} />
</div>
