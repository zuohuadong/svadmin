<script lang="ts">
  import { useList } from '@svadmin/core';
  import { getLocale } from '@svadmin/core/i18n';
  import { AutoTable, Badge, Button } from '@svadmin/ui';
  import * as Card from '@svadmin/ui/components/ui/card/index.js';
  import { Building2, CalendarClock, Heart, MapPin, Search, SlidersHorizontal, UserRoundCheck } from '@lucide/svelte';

  interface Agent { id: number; name: string; territory: string; status: string; capacityScore: number; notes: string; }
  interface Property { id: number; propertyName: string; market: string; assetType: string; askingPrice: number; status: string; units: number; occupancy: number; notes: string; }
  interface Lead { id: number; leadName: string; budget: number; status: string; }
  interface Showing { id: number; showingNumber: string; scheduledDate: string; status: string; feedbackScore: number | null; notes: string; }

  let { resourceName = 'properties' } = $props<{ resourceName?: string }>();

  const locale = $derived(getLocale());
  const isZh = $derived(locale === 'zh-CN');
  const propertiesQuery = useList({ resource: 'properties', pagination: { mode: 'off' } });
  const agentsQuery = useList({ resource: 'property_agents', pagination: { mode: 'off' } });
  const leadsQuery = useList({ resource: 'property_leads', pagination: { mode: 'off' } });
  const showingsQuery = useList({ resource: 'property_showings', pagination: { mode: 'off' }, sorters: [{ field: 'scheduledDate', order: 'asc' }] });
  const properties = $derived((propertiesQuery.data?.data ?? []) as unknown as Property[]);
  const agents = $derived((agentsQuery.data?.data ?? []) as unknown as Agent[]);
  const leads = $derived((leadsQuery.data?.data ?? []) as unknown as Lead[]);
  const showings = $derived((showingsQuery.data?.data ?? []) as unknown as Showing[]);
  const showingCount = $derived(showings.length);
  const avgOccupancy = $derived(properties.length ? Math.round(properties.reduce((sum, property) => sum + property.occupancy, 0) / properties.length) : 0);
  const marketTabs = $derived([
    isZh ? '购买' : 'Buy',
    isZh ? '租赁' : 'Rent',
    isZh ? '出售' : 'Sell',
    isZh ? '商业' : 'Commercial',
    isZh ? '已收藏' : 'Saved',
  ]);
  const filterChips = $derived([
    { label: isZh ? '类型' : 'Type', value: isZh ? '多户 / 办公 / 工业' : 'multifamily / office / industrial' },
    { label: isZh ? '状态' : 'Condition', value: isZh ? '挂牌 / 运营 / 翻新' : 'listed / active / renovation' },
    { label: isZh ? '位置' : 'Where', value: 'San Diego, Austin, Portland' },
    { label: isZh ? '价格' : 'Price', value: '$19M - $34M' },
    { label: isZh ? '时间' : 'When', value: isZh ? '本周看房' : 'this week tours' },
  ]);

  function money(value: number): string { return `$${Math.round(value / 1000)}K`; }
  function statusLabel(status: string): string {
    if (!isZh) return status.replace('_', ' ');
    if (status === 'listed') return '挂牌';
    if (status === 'active') return '运营';
    if (status === 'renovation') return '翻新';
    if (status === 'under_contract') return '签约中';
    if (status === 'tour_scheduled') return '已约看房';
    if (status === 'qualified') return '已合格';
    if (status === 'new') return '新线索';
    if (status === 'offer') return '报价';
    if (status === 'scheduled') return '已排期';
    if (status === 'completed') return '已完成';
    if (status === 'on_leave') return '休假';
    return status;
  }
</script>

<div class="space-y-6" data-app-page="real-estate-workspace">
  <section class="overflow-hidden rounded-xl border bg-card">
    <div class="grid gap-4 border-b p-5 xl:grid-cols-[1fr_0.42fr]">
      <div>
        <Badge>{isZh ? '资产运营' : 'Real Estate'}</Badge>
        <h1 class="mt-3 flex items-center gap-2 text-2xl font-semibold"><Building2 class="h-6 w-6 text-primary" />{isZh ? '资产搜索与看房工作台' : 'Property Search and Tour Workspace'}</h1>
        <p class="mt-2 text-sm text-muted-foreground">{isZh ? '把买/租筛选、资产卡片、地图态势和线索跟进放到一个页面。' : 'Combine buy/rent filters, property cards, map context, and lead follow-up.'}</p>
      </div>
      <div class="grid grid-cols-3 gap-2 text-center">
        <div class="rounded-xl border p-3"><p class="text-xl font-semibold">{properties.length}</p><p class="text-xs text-muted-foreground">{isZh ? '资产' : 'Assets'}</p></div>
        <div class="rounded-xl border p-3"><p class="text-xl font-semibold">{leads.length}</p><p class="text-xs text-muted-foreground">{isZh ? '线索' : 'Leads'}</p></div>
        <div class="rounded-xl border p-3"><p class="text-xl font-semibold">{avgOccupancy}%</p><p class="text-xs text-muted-foreground">{isZh ? '出租率' : 'Occupancy'}</p></div>
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-2 border-b px-4 py-3">
      {#each marketTabs as tab, index (tab)}
        <button class={`rounded-full px-3 py-1.5 text-sm transition ${index === 0 ? 'bg-primary text-primary-foreground' : 'border bg-background text-muted-foreground hover:text-foreground'}`}>{tab}</button>
      {/each}
      <span class="ml-auto rounded-full border bg-muted/35 px-3 py-1.5 text-sm text-muted-foreground">{isZh ? '地图视图' : 'Map View'}</span>
    </div>
    <div class="grid gap-3 p-4 md:grid-cols-[1fr_auto_auto]">
      <div class="flex items-center gap-2 rounded-xl border bg-background px-3 py-2 text-sm text-muted-foreground"><Search class="h-4 w-4" />{isZh ? '城市、预算、户型、关键词' : 'City, budget, beds, keywords'}</div>
      <Button variant="outline"><SlidersHorizontal class="mr-2 h-4 w-4" />{isZh ? '筛选' : 'Filters'}</Button>
      <Button>{isZh ? '新增看房' : 'New tour'}</Button>
    </div>
    <div class="grid gap-2 border-t bg-muted/15 p-4 md:grid-cols-5">
      {#each filterChips as chip (chip.label)}
        <div class="rounded-xl border bg-background p-3">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{chip.label}</p>
          <p class="mt-1 truncate text-sm font-medium">{chip.value}</p>
        </div>
      {/each}
    </div>
    <div class="flex justify-end border-t px-4 py-3">
      <Button variant="outline">{isZh ? '保存搜索' : 'Save Search'}</Button>
    </div>
  </section>

  <section class="grid gap-4 xl:grid-cols-[1fr_0.42fr]">
    <div class="grid gap-4 md:grid-cols-2">
      {#each properties as property (property.id)}
        <article class="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div class="h-32 bg-gradient-to-br from-sky-100 via-emerald-50 to-amber-50"></div>
          <div class="space-y-3 p-4">
            <div class="flex items-start justify-between gap-3"><div><h2 class="font-semibold">{property.propertyName}</h2><p class="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin class="h-3.5 w-3.5" />{property.market} · {property.assetType}</p></div><Button variant="outline" size="icon"><Heart class="h-4 w-4" /></Button></div>
            <div class="flex items-center justify-between gap-3"><p class="text-xl font-semibold">{money(property.askingPrice)}</p><Badge variant="outline">{statusLabel(property.status)}</Badge></div>
            <p class="text-xs text-muted-foreground">{property.units} {isZh ? '个单元' : 'units'} · {property.occupancy}% {isZh ? '出租率' : 'occupied'}</p>
          </div>
        </article>
      {/each}
    </div>
    <div class="grid gap-4 content-start">
      <Card.Root class="overflow-hidden"><Card.Header><Card.Title class="text-base">{isZh ? '地图态势' : 'Map Context'}</Card.Title></Card.Header><Card.Content><div class="relative mx-auto h-72 w-full max-w-md rounded-xl border bg-[radial-gradient(circle_at_30%_25%,hsl(var(--primary)/0.22),transparent_22%),radial-gradient(circle_at_70%_55%,hsl(var(--success)/0.18),transparent_18%),linear-gradient(135deg,hsl(var(--muted)),hsl(var(--background)))]"><span class="absolute left-[32%] top-[28%] h-4 w-4 rounded-full border-2 border-background bg-primary shadow"></span><span class="absolute left-[68%] top-[54%] h-4 w-4 rounded-full border-2 border-background bg-success shadow"></span><span class="absolute left-[48%] top-[72%] h-4 w-4 rounded-full border-2 border-background bg-warning shadow"></span></div></Card.Content></Card.Root>
      <Card.Root><Card.Header><Card.Title class="text-base">{isZh ? '活跃线索' : 'Active Leads'}</Card.Title></Card.Header><Card.Content class="space-y-3">{#each leads.slice(0, 3) as lead (lead.id)}<div class="rounded-xl border p-3"><div class="flex items-center justify-between"><p class="font-semibold">{lead.leadName}</p><Badge>{money(lead.budget)}</Badge></div><p class="mt-1 text-xs text-muted-foreground">{statusLabel(lead.status)}</p></div>{/each}</Card.Content></Card.Root>
    </div>
  </section>

  <section class="grid gap-4 xl:grid-cols-[0.82fr_1.18fr]">
    <Card.Root>
      <Card.Header><Card.Title class="flex items-center gap-2 text-base"><UserRoundCheck class="h-4 w-4 text-primary" />{isZh ? '顾问负载' : 'Advisor Capacity'}</Card.Title><Card.Description>{isZh ? '按区域、状态和容量分配新线索。' : 'Route new leads by territory, status, and capacity.'}</Card.Description></Card.Header>
      <Card.Content class="space-y-3">
        {#each agents as agent (agent.id)}
          <div class="rounded-xl border p-3">
            <div class="flex items-center justify-between gap-3">
              <div><p class="font-semibold">{agent.name}</p><p class="mt-1 text-xs text-muted-foreground">{agent.territory} · {statusLabel(agent.status)}</p></div>
              <Badge variant="outline">{agent.capacityScore}</Badge>
            </div>
            <div class="mt-3 h-2 rounded-full bg-muted"><div class="h-2 rounded-full bg-primary" style:width={`${agent.capacityScore}%`}></div></div>
          </div>
        {/each}
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Header><Card.Title class="flex items-center gap-2 text-base"><CalendarClock class="h-4 w-4 text-primary" />{isZh ? '看房日程' : 'Tour Schedule'}</Card.Title><Card.Description>{isZh ? `未来和历史看房共 ${showingCount} 条。` : `${showingCount} scheduled and historical tours.`}</Card.Description></Card.Header>
      <Card.Content class="space-y-3">
        {#each showings as showing (showing.id)}
          <div class="grid gap-3 rounded-xl border p-3 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p class="font-semibold">{showing.showingNumber}</p>
              <p class="mt-1 text-xs text-muted-foreground">{showing.scheduledDate} · {showing.notes}</p>
            </div>
            <div class="flex items-center gap-2">
              <Badge variant="outline">{statusLabel(showing.status)}</Badge>
              {#if showing.feedbackScore}<Badge>{showing.feedbackScore}/10</Badge>{/if}
            </div>
          </div>
        {/each}
      </Card.Content>
    </Card.Root>
  </section>

  <AutoTable {resourceName} />
</div>
