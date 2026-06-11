<script lang="ts">
  import { getLocale } from '@svadmin/core/i18n';
  import { navigate } from '@svadmin/core/router';
  import { useList } from '@svadmin/core';
  import { AutoTable, Badge, Button } from '@svadmin/ui';
  import * as Card from '@svadmin/ui/components/ui/card/index.js';
  import { AlertTriangle, ArrowUpRight, Boxes, Package, Warehouse } from '@lucide/svelte';

  let { resourceName = 'products' } = $props<{ resourceName?: string }>();

  const locale = $derived(getLocale());
  const tr = (en: string, zh: string) => locale === 'zh-CN' ? zh : en;

  const productsQuery = useList({ resource: 'products', pagination: { mode: 'off' } });
  const warehousesQuery = useList({ resource: 'warehouses', pagination: { mode: 'off' } });
  const rulesQuery = useList({ resource: 'reorder_rules', pagination: { mode: 'off' } });

  const products = $derived((productsQuery.data?.data ?? []) as Record<string, unknown>[]);
  const warehouses = $derived((warehousesQuery.data?.data ?? []) as Record<string, unknown>[]);
  const reorderRules = $derived((rulesQuery.data?.data ?? []) as Record<string, unknown>[]);

  function numberValue(record: Record<string, unknown>, key: string): number {
    const value = record[key];
    return typeof value === 'number' ? value : Number(value ?? 0);
  }

  const totalStock = $derived(products.reduce((sum, product) => sum + numberValue(product, 'stock'), 0));
  const lowStock = $derived(products.filter((product) => numberValue(product, 'stock') <= numberValue(product, 'minStock')));
  const inventoryValue = $derived(products.reduce((sum, product) => sum + numberValue(product, 'stock') * numberValue(product, 'price'), 0));
  const activeRules = $derived(reorderRules.filter((rule) => rule.status === 'active'));
</script>

<div class="space-y-6">
  <section class="overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-sm shadow-slate-900/[0.03]">
    <div class="grid gap-0 lg:grid-cols-[1.35fr_0.65fr]">
      <div class="relative p-6 sm:p-8">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.13),transparent_24rem)]"></div>
        <div class="relative max-w-3xl">
          <Badge class="mb-4 rounded-full bg-primary/10 text-primary hover:bg-primary/10">{tr('Inventory Control', '库存控制')}</Badge>
          <h1 class="text-3xl font-semibold tracking-tight text-foreground">{tr('Products cockpit', '商品运营驾驶舱')}</h1>
          <p class="mt-2 max-w-2xl text-sm text-muted-foreground">
            {tr('Monitor stock coverage, reorder rules, and catalog health before jumping into the editable svadmin table.', '在进入可编辑表格前，先查看库存覆盖、补货规则和商品健康度。')}
          </p>
          <div class="mt-6 flex flex-wrap gap-3">
            <Button class="rounded-xl" onclick={() => navigate('/products/create')}>
              <Package class="h-4 w-4" data-icon="inline-start" />
              {tr('New product', '新建商品')}
            </Button>
            <Button variant="outline" class="rounded-xl" onclick={() => navigate('/reorder_rules')}>
              {tr('Review reorder rules', '查看补货规则')}
              <ArrowUpRight class="h-4 w-4" data-icon="inline-end" />
            </Button>
          </div>
        </div>
      </div>
      <div class="border-t border-border/70 bg-muted/25 p-5 lg:border-l lg:border-t-0">
        <div class="grid h-full gap-3">
          <div class="rounded-2xl bg-background/85 p-4">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{tr('Inventory Value', '库存价值')}</p>
            <p class="mt-2 text-2xl font-semibold">${inventoryValue.toLocaleString()}</p>
          </div>
          <div class="rounded-2xl bg-background/85 p-4">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{tr('Stock Units', '库存件数')}</p>
            <p class="mt-2 text-2xl font-semibold">{totalStock.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <Card.Root class="rounded-3xl border-border/70 bg-card/95">
      <Card.Content class="flex items-center gap-4 p-5">
        <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Boxes class="h-5 w-5" /></span>
        <div>
          <p class="text-sm text-muted-foreground">{tr('Catalog items', '商品档案')}</p>
          <p class="text-2xl font-semibold">{products.length}</p>
        </div>
      </Card.Content>
    </Card.Root>
    <Card.Root class="rounded-3xl border-border/70 bg-card/95">
      <Card.Content class="flex items-center gap-4 p-5">
        <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600"><AlertTriangle class="h-5 w-5" /></span>
        <div>
          <p class="text-sm text-muted-foreground">{tr('Low stock', '低库存')}</p>
          <p class="text-2xl font-semibold">{lowStock.length}</p>
        </div>
      </Card.Content>
    </Card.Root>
    <Card.Root class="rounded-3xl border-border/70 bg-card/95">
      <Card.Content class="flex items-center gap-4 p-5">
        <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600"><Warehouse class="h-5 w-5" /></span>
        <div>
          <p class="text-sm text-muted-foreground">{tr('Warehouses', '仓库')}</p>
          <p class="text-2xl font-semibold">{warehouses.length}</p>
        </div>
      </Card.Content>
    </Card.Root>
    <Card.Root class="rounded-3xl border-border/70 bg-card/95">
      <Card.Content class="flex items-center gap-4 p-5">
        <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600"><ArrowUpRight class="h-5 w-5" /></span>
        <div>
          <p class="text-sm text-muted-foreground">{tr('Active rules', '启用规则')}</p>
          <p class="text-2xl font-semibold">{activeRules.length}</p>
        </div>
      </Card.Content>
    </Card.Root>
  </div>

  <div class="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
    <Card.Root class="rounded-3xl border-border/70 bg-card/95">
      <Card.Header>
        <Card.Title>{tr('Replenishment focus', '补货关注')}</Card.Title>
        <Card.Description>{tr('Products currently below their minimum stock threshold.', '当前低于最低库存阈值的商品。')}</Card.Description>
      </Card.Header>
      <Card.Content class="space-y-3">
        {#each lowStock as product (String(product.id))}
          <div class="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="font-medium">{product.name}</p>
                <p class="text-xs text-muted-foreground">{product.sku}</p>
              </div>
              <Badge variant="outline" class="border-amber-500/30 bg-amber-500/10 text-amber-700">
                {numberValue(product, 'stock')} / {numberValue(product, 'minStock')}
              </Badge>
            </div>
          </div>
        {:else}
          <p class="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">{tr('All products are above threshold.', '所有商品均高于安全库存。')}</p>
        {/each}
      </Card.Content>
    </Card.Root>

    <AutoTable {resourceName} />
  </div>
</div>
