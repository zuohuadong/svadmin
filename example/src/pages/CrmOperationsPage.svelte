<script lang="ts">
  import { getLocale, useList } from '@svadmin/core';
  import { ResourceOperationsPage } from '@svadmin/ui';
  import { BriefcaseBusiness, CalendarCheck, Handshake, UserRoundCheck } from '@lucide/svelte';

  let { resourceName } = $props<{ resourceName: string }>();

  const locale = $derived(getLocale());
  const tr = (en: string, zh: string) => locale === 'zh-CN' ? zh : en;

  const accountsQuery = useList({ resource: 'crm_accounts', pagination: { mode: 'off' } });
  const contactsQuery = useList({ resource: 'crm_contacts', pagination: { mode: 'off' } });
  const dealsQuery = useList({ resource: 'crm_deals', pagination: { mode: 'off' } });
  const activitiesQuery = useList({ resource: 'crm_activities', pagination: { mode: 'off' } });

  const accounts = $derived((accountsQuery.data?.data ?? []) as Record<string, unknown>[]);
  const contacts = $derived((contactsQuery.data?.data ?? []) as Record<string, unknown>[]);
  const deals = $derived((dealsQuery.data?.data ?? []) as Record<string, unknown>[]);
  const activities = $derived((activitiesQuery.data?.data ?? []) as Record<string, unknown>[]);

  function numberValue(record: Record<string, unknown>, field: string): number {
    const value = record[field];
    return typeof value === 'number' ? value : Number(value ?? 0);
  }

  function valueLabel(value: unknown): string {
    const key = String(value ?? '');
    const labels: Record<string, string> = {
      strategic: tr('Strategic', '战略'),
      growth: tr('Growth', '增长'),
      renewal: tr('Renewal', '续约'),
      healthy: tr('Healthy', '健康'),
      watch: tr('Watch', '观察'),
      at_risk: tr('At risk', '风险'),
      decision_maker: tr('Decision maker', '决策人'),
      evaluator: tr('Evaluator', '评估人'),
      operator: tr('Operator', '操作员'),
      active: tr('Active', '启用'),
      new: tr('New', '新建'),
      paused: tr('Paused', '暂停'),
      discovery: tr('Discovery', '发现'),
      proposal: tr('Proposal', '方案'),
      negotiation: tr('Negotiation', '谈判'),
      won: tr('Won', '已赢单'),
      lost: tr('Lost', '已输单'),
      planned: tr('Planned', '已规划'),
      completed: tr('Completed', '已完成'),
      follow_up: tr('Follow up', '需跟进'),
    };
    return labels[key] ?? key;
  }

  function groupCount(records: Record<string, unknown>[], field: string): Array<{ label: string; value: number; hint: string }> {
    const groups: Array<{ label: string; value: number; hint: string }> = [];
    for (const record of records) {
      const label = record[field] === undefined || record[field] === null ? tr('Unsorted', '未分类') : valueLabel(record[field]);
      const existing = groups.find((item) => item.label === label);
      if (existing) existing.value += 1;
      else groups.push({ label, value: 1, hint: tr('Current records in this lane', '当前泳道记录数') });
    }
    return groups.slice(0, 5);
  }

  const openPipeline = $derived(deals.filter((deal) => !['won', 'lost'].includes(String(deal.stage))));
  const pipelineAmount = $derived(openPipeline.reduce((sum, deal) => sum + numberValue(deal, 'amount'), 0));
  const plannedActivities = $derived(activities.filter((activity) => String(activity.status) !== 'completed').length);
  const watchAccounts = $derived(accounts.filter((account) => String(account.health) !== 'healthy').length);

  const profile = $derived.by(() => {
    switch (resourceName) {
      case 'crm_contacts':
        return {
          eyebrow: tr('Relationship Map', '关系图谱'),
          title: tr('Contact coverage desk', '联系人覆盖台'),
          description: tr('Track decision makers, evaluators, and operators across active customer accounts.', '跟踪客户账户中的决策人、评估人和一线使用者。'),
          actionLabel: tr('Add contact', '新增联系人'),
          Icon: UserRoundCheck,
          lanes: groupCount(contacts, 'influence'),
        };
      case 'crm_deals':
        return {
          eyebrow: tr('Revenue Motion', '收入推进'),
          title: tr('Opportunity pipeline', '机会管道'),
          description: tr('Prioritize open opportunities by stage, owner, amount, and next commitment.', '按阶段、负责人、金额和下一步承诺推进开放机会。'),
          actionLabel: tr('Add opportunity', '新增机会'),
          Icon: Handshake,
          lanes: groupCount(deals, 'stage'),
        };
      case 'crm_activities':
        return {
          eyebrow: tr('Follow-up Rhythm', '跟进节奏'),
          title: tr('Customer activity queue', '客户活动队列'),
          description: tr('Plan calls, demos, and reviews so account teams can keep every commitment visible.', '安排电话、演示和复盘，让客户团队清楚看到每个承诺。'),
          actionLabel: tr('Log activity', '记录活动'),
          Icon: CalendarCheck,
          lanes: groupCount(activities, 'status'),
        };
      default:
        return {
          eyebrow: tr('Customer Operations', '客户经营'),
          title: tr('Account health board', '客户健康看板'),
          description: tr('Review account value, renewal health, ownership, and near-term review commitments.', '查看账户价值、续约健康度、负责人和近期复盘承诺。'),
          actionLabel: tr('Add account', '新增账户'),
          Icon: BriefcaseBusiness,
          lanes: groupCount(accounts, 'health'),
        };
    }
  });

  const metrics = $derived([
    { label: tr('Accounts', '客户账户'), value: accounts.length, hint: tr('active book of business', '当前经营账户') },
    { label: tr('Open Pipeline', '开放管道'), value: `$${pipelineAmount.toLocaleString()}`, hint: tr('excluding won and lost', '不含已赢单和已输单') },
    { label: tr('Planned Work', '待推进活动'), value: plannedActivities, hint: tr('calls, demos, and reviews', '电话、演示和复盘') },
  ]);

  const highlights = $derived([
    ...accounts
      .filter((account) => String(account.health) !== 'healthy')
      .slice(0, 2)
      .map((account) => ({
        title: String(account.accountName),
        description: String(account.notes ?? ''),
        meta: tr('Needs relationship review', '需要关系复盘'),
        badge: valueLabel(account.health),
      })),
    ...openPipeline
      .slice(0, Math.max(0, 3 - Math.min(watchAccounts, 2)))
      .map((deal) => ({
        title: String(deal.dealName),
        description: String(deal.nextStep ?? ''),
        meta: tr(`Close target ${deal.closeDate ?? ''}`, `预计成交 ${deal.closeDate ?? ''}`),
        badge: `$${numberValue(deal, 'amount').toLocaleString()}`,
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
  tableLabel={tr('Customer workspace', '客户工作台')}
  tableDescription={tr('Structured records keep list, create, edit, and detail flows available.', '结构化记录保留列表、创建、编辑和详情流程。')}
  emptyLanesText={tr('No grouped records yet.', '暂无分组记录。')}
  highlightsLabel={tr('Focus queue', '重点队列')}
/>
