<script lang="ts">
  import { getLocale } from '@svadmin/core/i18n';
  import { navigate } from '@svadmin/core/router';
  import { useList } from '@svadmin/core';
  import { AutoTable, Badge, Button } from '@svadmin/ui';
  import * as Card from '@svadmin/ui/components/ui/card/index.js';
  import { AlertTriangle, ClipboardCheck, ListTodo, MoveRight, Repeat, SlidersHorizontal, TrendingUp } from '@lucide/svelte';

  let { resourceName } = $props<{ resourceName: string }>();

  const locale = $derived(getLocale());
  const tr = (en: string, zh: string) => locale === 'zh-CN' ? zh : en;
  const query = useList({ get resource() { return resourceName; }, pagination: { mode: 'off' } });
  const records = $derived((query.data?.data ?? []) as Record<string, unknown>[]);

  const profile = $derived.by(() => {
    switch (resourceName) {
      case 'stock_transfers':
        return { eyebrow: tr('Warehouse Flow', '仓间流转'), title: tr('Stock transfer board', '库存调拨看板'), description: tr('Coordinate source and destination warehouse commitments before receiving.', '协调调出仓、调入仓和到货承诺。'), Icon: Repeat, action: tr('New transfer', '新建调拨'), statusField: 'status' };
      case 'cycle_counts':
        return { eyebrow: tr('Inventory Assurance', '库存稽核'), title: tr('Cycle count planner', '循环盘点计划'), description: tr('Track scheduled counts, counted items, and variance risk by warehouse.', '按仓库跟踪盘点计划、已盘项和差异风险。'), Icon: ClipboardCheck, action: tr('New count', '新建盘点'), statusField: 'status' };
      case 'inventory_adjustments':
        return { eyebrow: tr('Exception Control', '异常管控'), title: tr('Adjustment approvals', '库存调整审批'), description: tr('Review quantity changes, reasons, and approval state before posting corrections.', '过账调整前复核数量变化、原因和审批状态。'), Icon: SlidersHorizontal, action: tr('New adjustment', '新建调整'), statusField: 'status' };
      case 'reorder_rules':
        return { eyebrow: tr('Replenishment', '补货策略'), title: tr('Reorder rule console', '补货规则控制台'), description: tr('Tune min stock, target stock, supplier lead time, and rule health.', '调整最低库存、目标库存、供应商交期和规则状态。'), Icon: AlertTriangle, action: tr('New rule', '新建规则'), statusField: 'status' };
      case 'todos':
        return { eyebrow: tr('Work Queue', '工作队列'), title: tr('Operations task queue', '运营待办队列'), description: tr('Prioritize blocked, urgent, and assigned work across inventory operations.', '按阻塞、紧急程度和负责人处理库存运营任务。'), Icon: ListTodo, action: tr('New task', '新建待办'), statusField: 'status' };
      default:
        return { eyebrow: tr('Inventory Ledger', '库存台账'), title: tr('Stock movement ledger', '库存流水台账'), description: tr('Audit inbound, outbound, and adjustment movements with warehouse context.', '按仓库上下文审计入库、出库和调整流水。'), Icon: TrendingUp, action: tr('New movement', '新建流水'), statusField: 'type' };
    }
  });

  function numberValue(record: Record<string, unknown>, key: string): number {
    const value = record[key];
    return typeof value === 'number' ? value : Number(value ?? 0);
  }

  const firstLanes = $derived.by(() => {
    const counts: Array<{ label: string; count: number }> = [];
    for (const record of records) {
      const key = String(record[profile.statusField] ?? tr('Unsorted', '未分类'));
      const lane = counts.find((item) => item.label === key);
      if (lane) {
        lane.count += 1;
      } else {
        counts.push({ label: key, count: 1 });
      }
    }
    return counts.slice(0, 4);
  });

  const quantityTotal = $derived(records.reduce((sum, record) => sum + Math.abs(numberValue(record, 'quantity') || numberValue(record, 'quantityChange') || numberValue(record, 'reorderQuantity')), 0));
</script>

<div class="space-y-6">
  <section class="grid gap-4 xl:grid-cols-[0.78fr_1.22fr]">
    <Card.Root class="rounded-[2rem] border-border/70 bg-card">
      <Card.Content class="p-6 sm:p-8">
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
      </Card.Content>
    </Card.Root>

    <div class="grid gap-4 md:grid-cols-4">
      {#each firstLanes as lane (lane.label)}
        <Card.Root class="rounded-[2rem] border-border/70 bg-card">
          <Card.Content class="p-5">
            <div class="flex items-center justify-between gap-3">
              <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary"><MoveRight class="h-4 w-4" /></span>
              <span class="text-3xl font-semibold">{lane.count}</span>
            </div>
            <p class="mt-4 truncate text-sm font-medium capitalize">{lane.label}</p>
            <p class="mt-1 text-xs text-muted-foreground">{tr('Current lane', '当前泳道')}</p>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  </section>

  <div class="grid gap-4 lg:grid-cols-3">
    <Card.Root class="rounded-3xl border-border/70 bg-card">
      <Card.Content class="p-5">
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{tr('Records', '记录数')}</p>
        <p class="mt-2 text-3xl font-semibold">{records.length}</p>
      </Card.Content>
    </Card.Root>
    <Card.Root class="rounded-3xl border-border/70 bg-card">
      <Card.Content class="p-5">
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{tr('Operational volume', '作业数量')}</p>
        <p class="mt-2 text-3xl font-semibold">{quantityTotal.toLocaleString()}</p>
      </Card.Content>
    </Card.Root>
    <Card.Root class="rounded-3xl border-border/70 bg-card">
      <Card.Content class="p-5">
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{tr('svadmin workflow', 'svadmin 工作流')}</p>
        <p class="mt-2 text-sm font-medium text-primary">{tr('Review summary, then edit structured records below.', '先看摘要，再编辑下方结构化记录。')}</p>
      </Card.Content>
    </Card.Root>
  </div>

  <AutoTable {resourceName} />
</div>
