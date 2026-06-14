<script lang="ts">
  import { useList } from '@svadmin/core';
  import { getLocale } from '@svadmin/core/i18n';
  import { AutoTable, Badge, Button } from '@svadmin/ui';
  import * as Card from '@svadmin/ui/components/ui/card/index.js';
  import { CalendarDays, ChevronLeft, ChevronRight, Clock, Filter, ListChecks, Plus } from '@lucide/svelte';

  interface CalendarEvent {
    id: number;
    title: string;
    type: string;
    startDate: string;
    status: string;
  }

  let { resourceName = 'calendar_events' } = $props<{ resourceName?: string }>();

  const locale = $derived(getLocale());
  const isZh = $derived(locale === 'zh-CN');
  const query = useList({ resource: 'calendar_events', pagination: { mode: 'off' }, sorters: [{ field: 'startDate', order: 'asc' }] });
  const events = $derived((query.data?.data ?? []) as unknown as CalendarEvent[]);
  const days = Array.from({ length: 35 }, (_, index) => index + 1);
  const typeStats = $derived(['purchase', 'cycle_count', 'receiving', 'review'].map((type) => ({
    type,
    count: events.filter((event) => event.type === type).length,
  })));
  const statusStats = $derived(['scheduled', 'completed', 'planned'].map((status) => ({
    status,
    count: events.filter((event) => event.status === status).length,
  })));
  const nextEvent = $derived(events[0]);

  function eventsForDay(day: number): CalendarEvent[] {
    return events.filter((event) => Number(event.startDate.slice(-2)) === day);
  }

  function typeLabel(type: string): string {
    if (!isZh) return type.replace('_', ' ');
    if (type === 'purchase') return '采购';
    if (type === 'cycle_count') return '盘点';
    if (type === 'receiving') return '收货';
    if (type === 'review') return '复盘';
    return type;
  }

  function statusLabel(status: string): string {
    if (!isZh) return status.replace('_', ' ');
    if (status === 'scheduled') return '已排期';
    if (status === 'completed') return '已完成';
    if (status === 'planned') return '计划中';
    return status;
  }
</script>

<div class="space-y-6" data-app-page="calendar-workspace">
  <section class="grid gap-4 xl:grid-cols-[1fr_0.72fr]">
    <Card.Root class="overflow-hidden border-primary/20">
      <Card.Header class="border-b">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge>{isZh ? '日程应用' : 'Calendar App'}</Badge>
            <Card.Title class="mt-3 flex items-center gap-2 text-2xl"><CalendarDays class="h-6 w-6 text-primary" />{isZh ? '运营日程控制台' : 'Operations Schedule Console'}</Card.Title>
            <Card.Description>{isZh ? '用月视图、议程列表、类型过滤和状态摘要管理计划作业。' : 'Manage planned work with month view, agenda, type filters, and status summaries.'}</Card.Description>
          </div>
          <div class="flex flex-wrap gap-2">
            <Button variant="outline"><Filter class="mr-2 h-4 w-4" />{isZh ? '筛选' : 'Filter'}</Button>
            <Button><Plus class="mr-2 h-4 w-4" />{isZh ? '新建日程' : 'New event'}</Button>
          </div>
        </div>
      </Card.Header>
      <Card.Content class="grid gap-3 p-5 sm:grid-cols-3">
        <div class="rounded-xl border bg-card p-4">
          <p class="text-xs text-muted-foreground">{isZh ? '日程总数' : 'Total Events'}</p>
          <p class="mt-2 text-2xl font-semibold">{events.length}</p>
        </div>
        <div class="rounded-xl border bg-card p-4">
          <p class="text-xs text-muted-foreground">{isZh ? '下一项' : 'Next Event'}</p>
          <p class="mt-2 truncate text-lg font-semibold">{nextEvent?.title ?? '-'}</p>
        </div>
        <div class="rounded-xl border bg-card p-4">
          <p class="text-xs text-muted-foreground">{isZh ? '视图' : 'View'}</p>
          <div class="mt-2 flex gap-2">
            <Badge>{isZh ? '月' : 'Month'}</Badge>
            <Badge variant="outline">{isZh ? '议程' : 'Agenda'}</Badge>
          </div>
        </div>
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Header><Card.Title class="flex items-center gap-2 text-base"><ListChecks class="h-4 w-4 text-primary" />{isZh ? '类型过滤' : 'Type Filters'}</Card.Title></Card.Header>
      <Card.Content class="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
        {#each typeStats as item (item.type)}
          <div class="flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
            <span>{typeLabel(item.type)}</span>
            <Badge variant="outline">{item.count}</Badge>
          </div>
        {/each}
      </Card.Content>
    </Card.Root>
  </section>

  <section class="grid gap-4 xl:grid-cols-[1fr_0.36fr]">
    <Card.Root class="overflow-hidden">
      <Card.Header class="flex flex-row items-center justify-between border-b">
        <div>
          <Badge>{isZh ? '计划日程' : 'Calendar'}</Badge>
          <Card.Title class="mt-3 flex items-center gap-2 text-2xl"><CalendarDays class="h-6 w-6 text-primary" />{isZh ? '2026 年 6 月运营日历' : 'June 2026 Operations Calendar'}</Card.Title>
          <Card.Description>{isZh ? '把采购、盘点、收货和复盘落到月视图。' : 'Map purchasing, counts, receiving, and reviews into a month view.'}</Card.Description>
        </div>
        <div class="hidden gap-2 sm:flex"><Button variant="outline" size="icon"><ChevronLeft class="h-4 w-4" /></Button><Button variant="outline" size="icon"><ChevronRight class="h-4 w-4" /></Button></div>
      </Card.Header>
      <Card.Content class="p-0">
        <div class="grid grid-cols-7 border-b bg-muted/30 text-center text-xs font-semibold text-muted-foreground">
          {#each (isZh ? ['一','二','三','四','五','六','日'] : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']) as weekday (weekday)}
            <div class="px-2 py-3">{weekday}</div>
          {/each}
        </div>
        <div class="block divide-y sm:hidden">
          {#each events as event (event.id)}
            <a href="#/calendar_events" class="block px-4 py-3">
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-semibold">{event.title}</p>
                <Badge variant="outline">{typeLabel(event.type)}</Badge>
              </div>
              <p class="mt-1 text-xs text-muted-foreground">{event.startDate} · {statusLabel(event.status)}</p>
            </a>
          {/each}
        </div>
        <div class="hidden sm:grid sm:grid-cols-7">
          {#each days as day (day)}
            <div class="min-h-28 border-b border-r p-3">
              <p class="text-xs font-semibold text-muted-foreground">{day <= 30 ? day : ''}</p>
              <div class="mt-2 space-y-1">
                {#each eventsForDay(day) as event (event.id)}
                  <a href="#/calendar_events" class="block rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">{event.title}</a>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>

    <div class="grid gap-4 content-start">
      <Card.Root>
        <Card.Header><Card.Title class="text-base">{isZh ? '近期议程' : 'Upcoming Agenda'}</Card.Title></Card.Header>
        <Card.Content class="space-y-3">
          {#each events.slice(0, 5) as event (event.id)}
            <div class="rounded-xl border bg-card p-3">
              <div class="flex items-center justify-between gap-3"><p class="text-sm font-semibold">{event.title}</p><Badge variant="outline">{typeLabel(event.type)}</Badge></div>
              <p class="mt-1 text-xs text-muted-foreground">{event.startDate} · {statusLabel(event.status)}</p>
            </div>
          {/each}
        </Card.Content>
      </Card.Root>
      <Card.Root>
        <Card.Content class="p-5">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{isZh ? '本周焦点' : 'This week'}</p>
          <p class="mt-2 text-3xl font-semibold">{events.length}</p>
          <p class="mt-1 text-xs text-muted-foreground">{isZh ? '个运营日程需要跟进' : 'operations events to follow'}</p>
        </Card.Content>
      </Card.Root>
      <Card.Root>
        <Card.Header><Card.Title class="flex items-center gap-2 text-base"><Clock class="h-4 w-4 text-primary" />{isZh ? '状态摘要' : 'Status Summary'}</Card.Title></Card.Header>
        <Card.Content class="space-y-2">
          {#each statusStats as item (item.status)}
            <div class="flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
              <span>{statusLabel(item.status)}</span>
              <Badge variant="outline">{item.count}</Badge>
            </div>
          {/each}
        </Card.Content>
      </Card.Root>
    </div>
  </section>

  <AutoTable {resourceName} />
</div>
