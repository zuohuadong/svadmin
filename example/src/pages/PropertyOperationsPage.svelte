<script lang="ts">
  import { getLocale, useList } from '@svadmin/core';
  import { ResourceOperationsPage } from '@svadmin/ui';
  import { Building2, CalendarCheck, KeyRound, MapPinned } from '@lucide/svelte';

  let { resourceName } = $props<{ resourceName: string }>();

  const locale = $derived(getLocale());
  const tr = (en: string, zh: string) => locale === 'zh-CN' ? zh : en;

  const propertiesQuery = useList({ resource: 'properties', pagination: { mode: 'off' } });
  const agentsQuery = useList({ resource: 'property_agents', pagination: { mode: 'off' } });
  const leadsQuery = useList({ resource: 'property_leads', pagination: { mode: 'off' } });
  const showingsQuery = useList({ resource: 'property_showings', pagination: { mode: 'off' } });

  const properties = $derived((propertiesQuery.data?.data ?? []) as Record<string, unknown>[]);
  const agents = $derived((agentsQuery.data?.data ?? []) as Record<string, unknown>[]);
  const leads = $derived((leadsQuery.data?.data ?? []) as Record<string, unknown>[]);
  const showings = $derived((showingsQuery.data?.data ?? []) as Record<string, unknown>[]);

  function numberValue(record: Record<string, unknown>, field: string): number {
    const value = record[field];
    return typeof value === 'number' ? value : Number(value ?? 0);
  }

  function valueLabel(value: unknown): string {
    const key = String(value ?? '');
    const labels: Record<string, string> = {
      multifamily: tr('Multifamily', '多户住宅'),
      office: tr('Office', '办公'),
      retail: tr('Retail', '零售'),
      industrial: tr('Industrial', '工业'),
      active: tr('Active', '启用'),
      renovation: tr('Renovation', '改造中'),
      listed: tr('Listed', '已挂牌'),
      under_contract: tr('Under contract', '签约中'),
      on_leave: tr('On leave', '休假'),
      paused: tr('Paused', '暂停'),
      referral: tr('Referral', '转介绍'),
      portal: tr('Portal', '门户'),
      walk_in: tr('Walk in', '到访'),
      partner: tr('Partner', '合作方'),
      new: tr('New', '新建'),
      qualified: tr('Qualified', '已确认'),
      tour_scheduled: tr('Tour scheduled', '已约看'),
      offer: tr('Offer', '报价'),
      dormant: tr('Dormant', '休眠'),
      scheduled: tr('Scheduled', '已计划'),
      completed: tr('Completed', '已完成'),
      rescheduled: tr('Rescheduled', '已改期'),
      cancelled: tr('Cancelled', '已取消'),
    };
    return labels[key] ?? key;
  }

  function groupCount(records: Record<string, unknown>[], field: string): Array<{ label: string; value: number; hint: string }> {
    const groups: Array<{ label: string; value: number; hint: string }> = [];
    for (const record of records) {
      const label = record[field] === undefined || record[field] === null ? tr('Unsorted', '未分类') : valueLabel(record[field]);
      const existing = groups.find((item) => item.label === label);
      if (existing) existing.value += 1;
      else groups.push({ label, value: 1, hint: tr('Current portfolio lane', '当前资产泳道') });
    }
    return groups.slice(0, 5);
  }

  const listedProperties = $derived(properties.filter((property) => String(property.status) === 'listed' || String(property.status) === 'under_contract').length);
  const activeLeadCount = $derived(leads.filter((lead) => !['dormant', 'offer'].includes(String(lead.status))).length);
  const upcomingTours = $derived(showings.filter((showing) => String(showing.status) === 'scheduled' || String(showing.status) === 'rescheduled').length);
  const portfolioValue = $derived(properties.reduce((sum, property) => sum + numberValue(property, 'askingPrice'), 0));

  const profile = $derived.by(() => {
    switch (resourceName) {
      case 'property_agents':
        return {
          eyebrow: tr('Advisor Capacity', '顾问容量'),
          title: tr('Advisor coverage board', '顾问覆盖看板'),
          description: tr('Balance active territories, capacity scores, and temporary coverage gaps.', '平衡负责区域、容量评分和临时覆盖缺口。'),
          actionLabel: tr('Add advisor', '新增顾问'),
          Icon: KeyRound,
          lanes: groupCount(agents, 'status'),
        };
      case 'property_leads':
        return {
          eyebrow: tr('Demand Desk', '需求工作台'),
          title: tr('Property lead pipeline', '资产线索管道'),
          description: tr('Track buyers and occupiers from first signal to offer review.', '跟踪买方和租户从首次意向到报价复盘的过程。'),
          actionLabel: tr('Add lead', '新增线索'),
          Icon: MapPinned,
          lanes: groupCount(leads, 'status'),
        };
      case 'property_showings':
        return {
          eyebrow: tr('Tour Operations', '看房作业'),
          title: tr('Tour schedule desk', '看房排期台'),
          description: tr('Coordinate advisors, leads, property notes, and feedback after each visit.', '协调顾问、线索、资产要点和每次到访后的反馈。'),
          actionLabel: tr('Schedule tour', '安排看房'),
          Icon: CalendarCheck,
          lanes: groupCount(showings, 'status'),
        };
      default:
        return {
          eyebrow: tr('Property Operations', '资产运营'),
          title: tr('Portfolio command board', '资产组合指挥台'),
          description: tr('Review markets, asset types, occupancy, listing status, and manager coverage.', '查看市场、资产类型、出租率、挂牌状态和负责人覆盖。'),
          actionLabel: tr('Add property', '新增资产'),
          Icon: Building2,
          lanes: groupCount(properties, 'status'),
        };
    }
  });

  const metrics = $derived([
    { label: tr('Portfolio Value', '组合估值'), value: `$${portfolioValue.toLocaleString()}`, hint: tr('asking price total', '挂牌价合计') },
    { label: tr('Active Leads', '活跃线索'), value: activeLeadCount, hint: tr('excluding dormant and offer stage', '不含休眠和报价阶段') },
    { label: tr('Upcoming Tours', '待看房'), value: upcomingTours, hint: tr('scheduled or rescheduled visits', '已安排或已改期到访') },
  ]);

  const highlights = $derived([
    ...properties
      .filter((property) => Number(property.occupancy ?? 0) < 80)
      .slice(0, 2)
      .map((property) => ({
        title: String(property.propertyName),
        description: String(property.notes ?? ''),
        meta: tr('Occupancy needs attention', '出租率需要关注'),
        badge: `${property.occupancy ?? 0}%`,
      })),
    ...leads
      .filter((lead) => String(lead.status) === 'tour_scheduled' || String(lead.status) === 'offer')
      .slice(0, Math.max(0, 3 - listedProperties))
      .map((lead) => ({
        title: String(lead.leadName),
        description: String(lead.notes ?? ''),
        meta: tr(`Target date ${lead.targetMoveDate ?? ''}`, `目标日期 ${lead.targetMoveDate ?? ''}`),
        badge: valueLabel(lead.status),
      })),
  ]);
</script>

<ResourceOperationsPage
  {resourceName}
  eyebrow={profile.eyebrow}
  title={profile.title}
  description={profile.description}
  actionLabel={profile.actionLabel}
  icon={profile.Icon}
  {metrics}
  lanes={profile.lanes}
  {highlights}
  tableLabel={tr('Portfolio workspace', '资产工作台')}
  tableDescription={tr('Structured records keep list, create, edit, and detail flows available.', '结构化记录保留列表、创建、编辑和详情流程。')}
  emptyLanesText={tr('No grouped records yet.', '暂无分组记录。')}
  highlightsLabel={tr('Focus queue', '重点队列')}
/>
