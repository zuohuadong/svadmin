<script lang="ts">
  import { useList } from '@svadmin/core';
  import { getLocale } from '@svadmin/core/i18n';
  import { Badge, Button } from '@svadmin/ui';
  import * as Card from '@svadmin/ui/components/ui/card/index.js';
  import { Building2, CalendarClock, Heart, MapPin, Search, SlidersHorizontal, UserRoundCheck } from '@lucide/svelte';
  import { readHashView } from '../utils/hashView';

  interface Agent { id: number; name: string; territory: string; status: string; capacityScore: number; notes: string; }
  interface Property { id: number; propertyName: string; market: string; assetType: string; askingPrice: number; status: string; units: number; occupancy: number; notes: string; }
  interface Lead { id: number; leadName: string; budget: number; status: string; }
  interface Showing { id: number; showingNumber: string; scheduledDate: string; status: string; feedbackScore: number | null; notes: string; }

  let { resourceName = 'properties' } = $props<{ resourceName?: string }>();
  let activeView = $state(readHashView('portfolio'));

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
  const normalizedView = $derived(['buy', 'rent', 'sell', 'commercial', 'saved', 'map', 'filters'].includes(activeView) ? activeView : 'portfolio');
  const marketTabs = $derived([
    { key: 'buy', label: isZh ? '购买' : 'Buy', href: '#/properties?view=buy' },
    { key: 'rent', label: isZh ? '租赁' : 'Rent', href: '#/properties?view=rent' },
    { key: 'sell', label: isZh ? '出售' : 'Sell', href: '#/properties?view=sell' },
    { key: 'commercial', label: isZh ? '商业' : 'Commercial', href: '#/properties?view=commercial' },
    { key: 'saved', label: isZh ? '已收藏' : 'Saved', href: '#/property_leads?view=saved' },
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

  const viewCopy = $derived.by(() => {
    const copies = {
      portfolio: {
        badge: isZh ? '资产运营' : 'Real Estate',
        title: isZh ? '资产搜索与看房工作台' : 'Property Search and Tour Workspace',
        description: isZh ? '把买/租筛选、资产卡片、地图态势和线索跟进放到一个页面。' : 'Combine buy/rent filters, property cards, map context, and lead follow-up.',
        action: isZh ? '新增看房' : 'New tour',
      },
      buy: {
        badge: isZh ? '购买' : 'Buy',
        title: isZh ? '购买资产筛选' : 'Buy-side Property Search',
        description: isZh ? '聚焦可购买资产、预算窗口、出租率和投资回报信号。' : 'Focus on purchasable assets, budget windows, occupancy, and return signals.',
        action: isZh ? '新增购买线索' : 'New buyer lead',
      },
      rent: {
        badge: isZh ? '租赁' : 'Rent',
        title: isZh ? '租赁需求工作台' : 'Rental Demand Workspace',
        description: isZh ? '按区域、预算和看房日程跟进租赁客户。' : 'Track rental clients by region, budget, and tour schedule.',
        action: isZh ? '安排租赁看房' : 'Schedule rental tour',
      },
      sell: {
        badge: isZh ? '出售' : 'Sell',
        title: isZh ? '出售委托视图' : 'Seller Listing View',
        description: isZh ? '关注挂牌状态、报价、买方反馈和成交风险。' : 'Watch listing state, offers, buyer feedback, and closing risk.',
        action: isZh ? '新增出售委托' : 'New seller listing',
      },
      commercial: {
        badge: isZh ? '商业' : 'Commercial',
        title: isZh ? '商业资产雷达' : 'Commercial Asset Radar',
        description: isZh ? '按办公、工业、多户和租约状态筛选商业机会。' : 'Filter commercial opportunities by office, industrial, multifamily, and lease status.',
        action: isZh ? '新增商业机会' : 'New commercial lead',
      },
      saved: {
        badge: isZh ? '已收藏' : 'Saved',
        title: isZh ? '收藏资产与线索' : 'Saved Properties and Leads',
        description: isZh ? '复盘收藏资产、线索预算和下一次联系计划。' : 'Review saved assets, lead budgets, and next-contact plans.',
        action: isZh ? '复盘收藏' : 'Review saved items',
      },
      map: {
        badge: isZh ? '地图视图' : 'Map View',
        title: isZh ? '地图态势视图' : 'Map Context View',
        description: isZh ? '用区域热区、资产点位和看房节奏判断下一步动作。' : 'Use market hot spots, property pins, and tour cadence to decide next actions.',
        action: isZh ? '打开地图筛选' : 'Open map filters',
      },
      filters: {
        badge: isZh ? '筛选器' : 'Filters',
        title: isZh ? '资产筛选器' : 'Property Filters',
        description: isZh ? '按类型、状态、位置、价格和时间窗口组合筛选条件。' : 'Combine type, condition, location, price, and timing filters.',
        action: isZh ? '保存筛选' : 'Save filters',
      },
    } satisfies Record<string, { badge: string; title: string; description: string; action: string }>;
    return copies[normalizedView as keyof typeof copies];
  });

  function syncView(): void {
    activeView = readHashView('portfolio');
  }
</script>

<svelte:window onhashchange={syncView} onpopstate={syncView} />

<div class="space-y-6" data-app-page="real-estate-workspace" data-property-view={normalizedView} data-resource-name={resourceName}>
  <section class="overflow-hidden rounded-xl border bg-card">
    <div class="grid gap-4 border-b p-5 xl:grid-cols-[1fr_0.42fr]">
      <div>
        <Badge>{viewCopy.badge}</Badge>
        <h1 class="mt-3 flex items-center gap-2 text-2xl font-semibold"><Building2 class="h-6 w-6 text-primary" />{viewCopy.title}</h1>
        <p class="mt-2 text-sm text-muted-foreground">{viewCopy.description}</p>
      </div>
      <div class="grid grid-cols-3 gap-2 text-center text-[11px] sm:text-xs">
        <div class="min-w-0 rounded-xl border p-2 sm:p-3"><p class="text-lg font-semibold sm:text-xl">{properties.length}</p><p class="truncate text-muted-foreground">{isZh ? '资产' : 'Assets'}</p></div>
        <div class="min-w-0 rounded-xl border p-2 sm:p-3"><p class="text-lg font-semibold sm:text-xl">{leads.length}</p><p class="truncate text-muted-foreground">{isZh ? '线索' : 'Leads'}</p></div>
        <div class="min-w-0 rounded-xl border p-2 sm:p-3"><p class="text-lg font-semibold sm:text-xl">{avgOccupancy}%</p><p class="truncate text-muted-foreground">{isZh ? '出租率' : 'Occupancy'}</p></div>
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-2 border-b px-4 py-3">
      {#each marketTabs as tab (tab.key)}
        <a href={tab.href} class={`rounded-full px-3 py-1.5 text-sm transition ${normalizedView === tab.key ? 'bg-primary text-primary-foreground' : 'border bg-background text-muted-foreground hover:text-foreground'}`}>{tab.label}</a>
      {/each}
      <a href="#/properties?view=map" class={`ml-auto rounded-full border px-3 py-1.5 text-sm ${normalizedView === 'map' ? 'bg-primary text-primary-foreground' : 'bg-muted/35 text-muted-foreground'}`}>{isZh ? '地图视图' : 'Map View'}</a>
    </div>
    <div class="grid gap-3 p-4 md:grid-cols-[1fr_auto_auto]">
      <div class="flex items-center gap-2 rounded-xl border bg-background px-3 py-2 text-sm text-muted-foreground"><Search class="h-4 w-4" />{isZh ? '城市、预算、户型、关键词' : 'City, budget, beds, keywords'}</div>
      <a href="#/properties?view=filters"><Button variant="outline"><SlidersHorizontal class="mr-2 h-4 w-4" />{isZh ? '筛选' : 'Filters'}</Button></a>
      <Button>{viewCopy.action}</Button>
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
      <Button variant="outline">{normalizedView === 'filters' ? viewCopy.action : (isZh ? '保存搜索' : 'Save Search')}</Button>
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
</div>
