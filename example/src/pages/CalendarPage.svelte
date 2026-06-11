<script lang="ts">
  import { getLocale } from '@svadmin/core/i18n';
  import { navigate } from '@svadmin/core/router';
  import { useList } from '@svadmin/core';
  import { AutoTable, Badge, Button } from '@svadmin/ui';
  import * as Card from '@svadmin/ui/components/ui/card/index.js';
  import { CalendarDays, ClipboardCheck, Truck } from '@lucide/svelte';

  let { resourceName = 'calendar_events' } = $props<{ resourceName?: string }>();

  const locale = $derived(getLocale());
  const tr = (en: string, zh: string) => locale === 'zh-CN' ? zh : en;
  const eventsQuery = useList({ resource: 'calendar_events', pagination: { mode: 'off' } });
  const events = $derived((eventsQuery.data?.data ?? []) as Record<string, unknown>[]);
</script>

<div class="space-y-6">
  <section class="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm shadow-slate-900/[0.03]">
    <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <Badge class="mb-4 rounded-full bg-primary/10 text-primary hover:bg-primary/10">{tr('Planning', '计划日程')}</Badge>
        <h1 class="text-3xl font-semibold tracking-tight">{tr('Operations calendar', '运营日程')}</h1>
        <p class="mt-2 max-w-2xl text-sm text-muted-foreground">{tr('A timeline-first view for receiving, purchase reviews, cycle counts, and warehouse commitments.', '以时间线优先查看收货、采购复核、循环盘点和仓库承诺。')}</p>
      </div>
      <Button class="rounded-xl" onclick={() => navigate('/calendar_events/create')}>
        <CalendarDays class="h-4 w-4" data-icon="inline-start" />
        {tr('Schedule event', '安排日程')}
      </Button>
    </div>
  </section>

  <div class="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
    <Card.Root class="rounded-[2rem] border-border/70 bg-card">
      <Card.Header>
        <Card.Title>{tr('Upcoming timeline', '近期时间线')}</Card.Title>
        <Card.Description>{tr('Operational commitments sorted by schedule.', '按计划日期排序的运营事项。')}</Card.Description>
      </Card.Header>
      <Card.Content class="space-y-4">
        {#each events as event (String(event.id))}
          <div class="relative pl-8">
            <span class="absolute left-0 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
              {#if event.type === 'receiving'}
                <Truck class="h-3 w-3" />
              {:else}
                <ClipboardCheck class="h-3 w-3" />
              {/if}
            </span>
            <div class="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <div class="flex items-center justify-between gap-3">
                <p class="font-medium">{event.title}</p>
                <Badge variant="outline">{event.status}</Badge>
              </div>
              <p class="mt-1 text-xs text-muted-foreground">{event.startDate} · {event.notes}</p>
            </div>
          </div>
        {/each}
      </Card.Content>
    </Card.Root>

    <AutoTable {resourceName} />
  </div>
</div>
