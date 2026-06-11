<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import * as Card from '../ui/card/index.js';
  import { Badge } from '../ui/badge/index.js';
  import { Button } from '../ui/button/index.js';
  import { Avatar } from '../ui/avatar/index.js';
  import { Input } from '../ui/input/index.js';
  import { Search, UserPlus, MoreHorizontal, Clock, CheckCircle2, XCircle, ShieldCheck, UsersRound, KeyRound, Sparkles, ArrowRight, BookOpenCheck } from '@lucide/svelte';
  import type { Component } from 'svelte';

  type MemberStatus = 'active' | 'invited' | 'inactive';
  type StatusFilter = 'all' | MemberStatus;

  interface Member {
    id: string;
    name: string;
    email: string;
    role: string;
    status: MemberStatus;
    avatar?: string;
    joinedAt: string;
    department: string;
    permissions: string[];
  }

  interface StarterStep {
    id: string;
    title: string;
    description: string;
    owner: string;
    done: boolean;
    icon: Component;
  }

  let searchQuery = $state('');
  let statusFilter = $state<StatusFilter>('all');

  const members: Member[] = [
    { id: '1', name: 'Alex Chen', email: 'alex@acme.com', role: 'Admin', status: 'active', joinedAt: '2023-01-15', department: 'Platform', permissions: ['Billing', 'RBAC'] },
    { id: '2', name: 'Sarah Kim', email: 'sarah@acme.com', role: 'Editor', status: 'active', joinedAt: '2023-03-22', department: 'Design', permissions: ['Content', 'Reports'] },
    { id: '3', name: 'Mike Johnson', email: 'mike@acme.com', role: 'Viewer', status: 'invited', joinedAt: '2024-01-10', department: 'Finance', permissions: ['Reports'] },
    { id: '4', name: 'Lisa Wang', email: 'lisa@acme.com', role: 'Editor', status: 'active', joinedAt: '2023-06-05', department: 'Operations', permissions: ['Inventory', 'Orders'] },
    { id: '5', name: 'Tom Brown', email: 'tom@acme.com', role: 'Viewer', status: 'inactive', joinedAt: '2022-11-20', department: 'Support', permissions: ['Read only'] },
    { id: '6', name: 'Emma Davis', email: 'emma@acme.com', role: 'Admin', status: 'active', joinedAt: '2023-02-14', department: 'Security', permissions: ['Audit', 'SSO'] },
  ];

  const starterSteps: StarterStep[] = [
    { id: 'invite', title: '邀请核心成员', description: '先邀请拥有审批、财务和运营权限的负责人。', owner: 'Owner', done: true, icon: UserPlus },
    { id: 'roles', title: '确认角色边界', description: '为 Admin / Editor / Viewer 设置最小权限组合。', owner: 'Security', done: true, icon: ShieldCheck },
    { id: 'groups', title: '创建部门分组', description: '按部门分组便于批量授权和通知触达。', owner: 'People Ops', done: false, icon: UsersRound },
    { id: 'audit', title: '打开审计追踪', description: '记录邀请、停用、权限变更和导出动作。', owner: 'Compliance', done: false, icon: BookOpenCheck },
  ];

  const roleCards = [
    { role: 'Admin', count: 2, tone: 'bg-slate-900 text-white', icon: KeyRound, description: '管理账单、角色和安全策略。' },
    { role: 'Editor', count: 2, tone: 'bg-blue-600 text-white', icon: Sparkles, description: '维护数据、处理运营任务和报表。' },
    { role: 'Viewer', count: 2, tone: 'bg-emerald-600 text-white', icon: UsersRound, description: '只读访问仪表板和导出结果。' },
  ];

  const filteredMembers = $derived.by(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return members.filter((member) => {
      const matchesSearch = !keyword || [member.name, member.email, member.role, member.department].some((value) => value.toLowerCase().includes(keyword));
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  });
  const activeCount = $derived(members.filter((member) => member.status === 'active').length);
  const invitedCount = $derived(members.filter((member) => member.status === 'invited').length);
  const completedSteps = $derived(starterSteps.filter((step) => step.done).length);

  const statusConfig = {
    active: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500/10 text-emerald-700', label: t('account.active') },
    invited: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500/10 text-amber-700', label: t('account.invited') },
    inactive: { icon: XCircle, color: 'text-muted-foreground', bg: 'bg-muted text-muted-foreground', label: t('account.inactive') },
  };

  const initials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
</script>

<div class="space-y-6">
  <div class="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
    <div>
      <h2 class="text-xl font-semibold text-foreground">{t('account.membersStarter')}</h2>
      <p class="mt-1 text-sm text-muted-foreground">{t('account.membersStarterDescription')}</p>
    </div>
    <div class="flex gap-2">
      <Button variant="outline" size="sm">导入成员</Button>
      <Button size="sm">
        <UserPlus class="h-4 w-4 mr-1" />{t('account.inviteMember')}
      </Button>
    </div>
  </div>

  <div class="grid gap-4 md:grid-cols-3">
    {#each roleCards as card (card.role)}
      <Card.Card class="border-border/60">
        <Card.CardContent class="p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="rounded-xl p-3 {card.tone}">
              <card.icon class="h-5 w-5" />
            </div>
            <Badge variant="outline">{card.count} 人</Badge>
          </div>
          <h3 class="mt-4 font-semibold text-foreground">{card.role}</h3>
          <p class="mt-1 text-sm text-muted-foreground">{card.description}</p>
        </Card.CardContent>
      </Card.Card>
    {/each}
  </div>

  <div class="grid gap-4 xl:grid-cols-[1fr_20rem]">
    <div class="space-y-4">
      <Card.Card class="border-border/60">
        <Card.CardContent class="p-4">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div class="relative flex-1">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('common.search')} bind:value={searchQuery} class="pl-9" />
            </div>
            <div class="flex overflow-hidden rounded-lg border border-border bg-background">
              {#each [
                { id: 'all', label: '全部' },
                { id: 'active', label: t('account.active') },
                { id: 'invited', label: t('account.invited') },
                { id: 'inactive', label: t('account.inactive') },
              ] as option (option.id)}
                <button
                  class="h-9 px-3 text-xs font-medium transition-colors {statusFilter === option.id ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}"
                  onclick={() => statusFilter = option.id as StatusFilter}
                >
                  {option.label}
                </button>
              {/each}
            </div>
          </div>
        </Card.CardContent>
      </Card.Card>

      <Card.Card class="border-border/60">
        <Card.CardContent class="p-0">
          <div class="divide-y divide-border/60">
            {#each filteredMembers as member (member.id)}
              {@const sc = statusConfig[member.status]}
              <div class="flex flex-col gap-3 p-4 transition-colors hover:bg-accent/30 md:flex-row md:items-center">
                <div class="flex min-w-0 flex-1 items-center gap-3">
                  <div class="shrink-0">
                    {#if member.avatar}
                      <Avatar class="h-10 w-10"><img src={member.avatar} alt={member.name} /></Avatar>
                    {:else}
                      <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {initials(member.name)}
                      </div>
                    {/if}
                  </div>
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="truncate text-sm font-medium text-foreground">{member.name}</span>
                      <Badge variant="outline" class="text-[10px]">{member.role}</Badge>
                      <span class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold {sc.bg}">
                        <sc.icon class="h-3 w-3" />{sc.label}
                      </span>
                    </div>
                    <p class="truncate text-xs text-muted-foreground">{member.email} · {member.department}</p>
                  </div>
                </div>
                <div class="flex flex-wrap items-center gap-2 md:justify-end">
                  {#each member.permissions as permission (permission)}
                    <span class="rounded-full bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">{permission}</span>
                  {/each}
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            {/each}
          </div>
        </Card.CardContent>
      </Card.Card>
    </div>

    <div class="space-y-4">
      <Card.Card class="border-border/70 bg-card">
        <Card.CardHeader>
          <Card.CardTitle class="text-base">成员配置进度</Card.CardTitle>
          <Card.CardDescription>{completedSteps}/{starterSteps.length} 个初始化动作已完成。</Card.CardDescription>
        </Card.CardHeader>
        <Card.CardContent class="space-y-3">
          <div class="h-2 overflow-hidden rounded-full bg-muted">
            <div class="h-full rounded-full bg-primary" style="width: {(completedSteps / starterSteps.length) * 100}%"></div>
          </div>
          {#each starterSteps as step (step.id)}
            <div class="flex gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg {step.done ? 'bg-emerald-500/10 text-emerald-700' : 'bg-background text-muted-foreground'}">
                {#if step.done}<CheckCircle2 class="h-4 w-4" />{:else}<step.icon class="h-4 w-4" />{/if}
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-foreground">{step.title}</p>
                <p class="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
                <p class="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Owner · {step.owner}</p>
              </div>
            </div>
          {/each}
          <Button variant="outline" class="w-full">继续配置 <ArrowRight class="h-3.5 w-3.5 ml-1" /></Button>
        </Card.CardContent>
      </Card.Card>

      <Card.Card class="border-border/60">
        <Card.CardContent class="grid grid-cols-2 gap-3 p-4 text-center">
          <div class="rounded-xl bg-muted/30 p-3">
            <p class="text-2xl font-semibold text-foreground">{activeCount}</p>
            <p class="text-xs text-muted-foreground">活跃</p>
          </div>
          <div class="rounded-xl bg-muted/30 p-3">
            <p class="text-2xl font-semibold text-foreground">{invitedCount}</p>
            <p class="text-xs text-muted-foreground">待加入</p>
          </div>
        </Card.CardContent>
      </Card.Card>
    </div>
  </div>
</div>
