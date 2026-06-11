<script lang="ts">
  import { getLocale } from '@svadmin/core/i18n';
  import { navigate } from '@svadmin/core/router';
  import { useList } from '@svadmin/core';
  import { AutoTable, Badge, Button } from '@svadmin/ui';
  import * as Card from '@svadmin/ui/components/ui/card/index.js';
  import { Barcode, Building2, FolderTree, Home, PackageSearch, Warehouse } from '@lucide/svelte';

  let { resourceName } = $props<{ resourceName: string }>();

  const locale = $derived(getLocale());
  const tr = (en: string, zh: string) => locale === 'zh-CN' ? zh : en;
  const query = useList({ get resource() { return resourceName; }, pagination: { mode: 'off' } });
  const records = $derived((query.data?.data ?? []) as Record<string, unknown>[]);

  const profile = $derived.by(() => {
    switch (resourceName) {
      case 'skus':
        return {
          eyebrow: tr('Catalog Master', '档案主数据'),
          title: tr('SKU registry', 'SKU 编码台账'),
          description: tr('Keep barcode, variant, and item status data clean before warehouse operations consume it.', '维护条码、规格和状态，让仓库作业使用一致的商品编码。'),
          Icon: Barcode,
          action: tr('New SKU', '新建 SKU'),
          focus: tr('Variant integrity', '规格完整性'),
        };
      case 'categories':
        return {
          eyebrow: tr('Catalog Master', '档案主数据'),
          title: tr('Category taxonomy', '品类分类体系'),
          description: tr('Shape the product tree used by filtering, purchasing, and replenishment rules.', '维护商品分类树，支撑筛选、采购和补货规则。'),
          Icon: FolderTree,
          action: tr('New category', '新建品类'),
          focus: tr('Navigation clarity', '导航清晰度'),
        };
      case 'suppliers':
        return {
          eyebrow: tr('Partner Master', '伙伴主数据'),
          title: tr('Supplier directory', '供应商名录'),
          description: tr('Centralize contact ownership and procurement context for purchase planning.', '集中维护联系人和采购上下文，支撑采购计划。'),
          Icon: Building2,
          action: tr('New supplier', '新建供应商'),
          focus: tr('Sourcing coverage', '供货覆盖'),
        };
      default:
        return {
          eyebrow: tr('Warehouse Master', '仓储主数据'),
          title: tr('Warehouse network', '仓库网络'),
          description: tr('Review capacity, utilization, and locations before assigning stock movement work.', '分配库存作业前，先查看容量、利用率和仓库位置。'),
          Icon: Warehouse,
          action: tr('New warehouse', '新建仓库'),
          focus: tr('Capacity planning', '容量规划'),
        };
    }
  });

  function numberValue(record: Record<string, unknown>, key: string): number {
    const value = record[key];
    return typeof value === 'number' ? value : Number(value ?? 0);
  }

  const activeRecords = $derived(records.filter((record) => record.status === 'active' || record.status === undefined));
  const utilizationAverage = $derived.by(() => {
    const utilization = records.map((record) => numberValue(record, 'utilization')).filter((value) => value > 0);
    if (utilization.length === 0) return 0;
    return Math.round(utilization.reduce((sum, value) => sum + value, 0) / utilization.length);
  });
</script>

<div class="space-y-6">
  <section class="overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-sm shadow-slate-900/[0.03]">
    <div class="grid gap-0 xl:grid-cols-[0.72fr_1.28fr]">
      <div class="relative p-6 sm:p-8">
        <div class="absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--primary)/0.13),transparent_58%)]"></div>
        <div class="relative">
          <Badge class="mb-4 rounded-full bg-primary/10 text-primary hover:bg-primary/10">{profile.eyebrow}</Badge>
          <div class="flex items-start gap-4">
            <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-primary/25">
              <profile.Icon class="h-6 w-6" />
            </span>
            <div>
              <h1 class="text-3xl font-semibold tracking-tight">{profile.title}</h1>
              <p class="mt-2 max-w-xl text-sm text-muted-foreground">{profile.description}</p>
            </div>
          </div>
          <Button class="mt-6 rounded-xl" onclick={() => navigate(`/${resourceName}/create`)}>{profile.action}</Button>
        </div>
      </div>
      <div class="grid gap-4 border-t border-border/70 bg-muted/20 p-5 md:grid-cols-3 xl:border-l xl:border-t-0">
        <Card.Root class="rounded-3xl border-border/70 bg-background/85">
          <Card.Content class="p-5">
            <PackageSearch class="h-5 w-5 text-primary" />
            <p class="mt-4 text-sm text-muted-foreground">{tr('Records', '记录数')}</p>
            <p class="text-3xl font-semibold">{records.length}</p>
          </Card.Content>
        </Card.Root>
        <Card.Root class="rounded-3xl border-border/70 bg-background/85">
          <Card.Content class="p-5">
            <Home class="h-5 w-5 text-emerald-600" />
            <p class="mt-4 text-sm text-muted-foreground">{profile.focus}</p>
            <p class="text-3xl font-semibold">{resourceName === 'warehouses' ? `${utilizationAverage}%` : activeRecords.length}</p>
          </Card.Content>
        </Card.Root>
        <Card.Root class="rounded-3xl border-border/70 bg-background/85">
          <Card.Content class="p-5">
            <Warehouse class="h-5 w-5 text-sky-600" />
            <p class="mt-4 text-sm text-muted-foreground">{tr('Editable via svadmin', 'svadmin 可编辑')}</p>
            <p class="text-3xl font-semibold">CRUD</p>
          </Card.Content>
        </Card.Root>
      </div>
    </div>
  </section>

  <div class="grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
    <Card.Root class="rounded-[2rem] border-border/70 bg-card">
      <Card.Header>
        <Card.Title>{tr('Data quality focus', '数据质量关注')}</Card.Title>
        <Card.Description>{tr('A compact operational summary before editing the master data table.', '编辑主数据表前的紧凑运营摘要。')}</Card.Description>
      </Card.Header>
      <Card.Content class="space-y-3">
        {#each records.slice(0, 5) as record (String(record.id))}
          <div class="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
            <div class="min-w-0">
              <p class="truncate font-medium">{record.name ?? record.sku ?? record.code}</p>
              <p class="truncate text-xs text-muted-foreground">{record.location ?? record.email ?? record.variant ?? record.description ?? profile.focus}</p>
            </div>
            <Badge variant="outline">{record.status ?? record.code ?? record.id}</Badge>
          </div>
        {/each}
      </Card.Content>
    </Card.Root>

    <AutoTable {resourceName} />
  </div>
</div>
