<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import * as Card from '../ui/card/index.js';
  import { Badge } from '../ui/badge/index.js';
  import { Button } from '../ui/button/index.js';
  import { Input } from '../ui/input/index.js';
  import { Search, Download, UserPlus, MoreHorizontal, CheckCircle2, Clock, XCircle, UsersRound, BriefcaseBusiness, Activity, ShieldCheck } from '@lucide/svelte';

  type CrewStatus = 'active' | 'away' | 'offline';
  type StatusFilter = 'all' | CrewStatus;

  interface CrewMember {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    status: CrewStatus;
    joinedAt: string;
    projects: number;
    utilization: number;
    location: string;
    skills: string[];
  }

  let searchQuery = $state('');
  let departmentFilter = $state('all');
  let statusFilter = $state<StatusFilter>('all');

  const crew: CrewMember[] = [
    { id: '1', name: 'Alex Chen', email: 'alex@acme.com', role: 'Tech Lead', department: 'Engineering', status: 'active', joinedAt: '2022-03-15', projects: 12, utilization: 88, location: 'Shanghai', skills: ['Architecture', 'SRE'] },
    { id: '2', name: 'Sarah Kim', email: 'sarah@acme.com', role: 'Senior Designer', department: 'Design', status: 'active', joinedAt: '2022-06-22', projects: 8, utilization: 74, location: 'Seoul', skills: ['UX', 'Design Ops'] },
    { id: '3', name: 'Mike Johnson', email: 'mike@acme.com', role: 'Product Manager', department: 'Product', status: 'away', joinedAt: '2023-01-10', projects: 6, utilization: 69, location: 'Austin', skills: ['Roadmap', 'Analytics'] },
    { id: '4', name: 'Lisa Wang', email: 'lisa@acme.com', role: 'Backend Engineer', department: 'Engineering', status: 'active', joinedAt: '2023-04-05', projects: 10, utilization: 81, location: 'Shenzhen', skills: ['API', 'Database'] },
    { id: '5', name: 'Tom Brown', email: 'tom@acme.com', role: 'QA Engineer', department: 'Engineering', status: 'offline', joinedAt: '2022-11-20', projects: 4, utilization: 52, location: 'London', skills: ['Automation', 'Regression'] },
    { id: '6', name: 'Emma Davis', email: 'emma@acme.com', role: 'Engineering Manager', department: 'Engineering', status: 'active', joinedAt: '2022-02-14', projects: 15, utilization: 91, location: 'New York', skills: ['People', 'Delivery'] },
    { id: '7', name: 'James Wilson', email: 'james@acme.com', role: 'DevOps Engineer', department: 'Infrastructure', status: 'active', joinedAt: '2023-08-01', projects: 7, utilization: 77, location: 'Berlin', skills: ['Cloud', 'CI/CD'] },
    { id: '8', name: 'Yuki Tanaka', email: 'yuki@acme.com', role: 'Frontend Engineer', department: 'Engineering', status: 'away', joinedAt: '2023-05-12', projects: 9, utilization: 72, location: 'Tokyo', skills: ['Svelte', 'A11y'] },
  ];

  const departments = $derived(['all', ...Array.from(new Set(crew.map((member) => member.department)))]);
  const filtered = $derived.by(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return crew.filter((member) => {
      const matchesSearch = !keyword || [member.name, member.email, member.role, member.department, member.location, ...member.skills].some((value) => value.toLowerCase().includes(keyword));
      const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  });
  const activeCount = $derived(crew.filter((member) => member.status === 'active').length);
  const projectCount = $derived(crew.reduce((total, member) => total + member.projects, 0));
  const avgUtilization = $derived(Math.round(crew.reduce((total, member) => total + member.utilization, 0) / crew.length));

  const statusConfig = {
    active: { icon: CheckCircle2, color: 'text-emerald-600', dot: 'bg-emerald-500', label: t('account.active') },
    away: { icon: Clock, color: 'text-amber-600', dot: 'bg-amber-500', label: '暂离' },
    offline: { icon: XCircle, color: 'text-muted-foreground', dot: 'bg-muted-foreground', label: t('account.inactive') },
  };

  const initials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
</script>

<div class="space-y-6">
  <div class="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
    <div>
      <h2 class="text-xl font-semibold text-foreground">{t('network.teamCrew')}</h2>
      <p class="mt-1 text-sm text-muted-foreground">{t('network.teamCrewDescription')}</p>
    </div>
    <div class="flex gap-2">
      <Button variant="outline" size="sm">
        <Download class="h-3.5 w-3.5 mr-1" />{t('common.export')}
      </Button>
      <Button size="sm">
        <UserPlus class="h-3.5 w-3.5 mr-1" />{t('account.inviteMember')}
      </Button>
    </div>
  </div>

  <div class="grid gap-4 md:grid-cols-4">
    {#each [
      { label: '团队成员', value: crew.length, icon: UsersRound, tone: 'bg-slate-900 text-white' },
      { label: '在线成员', value: activeCount, icon: Activity, tone: 'bg-emerald-600 text-white' },
      { label: '项目负载', value: projectCount, icon: BriefcaseBusiness, tone: 'bg-blue-600 text-white' },
      { label: '平均投入', value: `${avgUtilization}%`, icon: ShieldCheck, tone: 'bg-amber-600 text-white' },
    ] as metric (metric.label)}
      <Card.Card class="border-border/60">
        <Card.CardContent class="flex items-center justify-between gap-3 p-4">
          <div>
            <p class="text-xs font-medium text-muted-foreground">{metric.label}</p>
            <p class="mt-1 text-2xl font-semibold text-foreground">{metric.value}</p>
          </div>
          <div class="rounded-xl p-3 {metric.tone}">
            <metric.icon class="h-5 w-5" />
          </div>
        </Card.CardContent>
      </Card.Card>
    {/each}
  </div>

  <Card.Card class="border-border/60">
    <Card.CardContent class="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={t('common.search')} bind:value={searchQuery} class="pl-9" />
      </div>
      <select bind:value={departmentFilter} class="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
        {#each departments as department (department)}
          <option value={department}>{department === 'all' ? '全部部门' : department}</option>
        {/each}
      </select>
      <div class="flex overflow-hidden rounded-lg border border-border bg-background">
        {#each [
          { id: 'all', label: '全部' },
          { id: 'active', label: t('account.active') },
          { id: 'away', label: '暂离' },
          { id: 'offline', label: t('account.inactive') },
        ] as option (option.id)}
          <button
            class="h-9 px-3 text-xs font-medium transition-colors {statusFilter === option.id ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}"
            onclick={() => statusFilter = option.id as StatusFilter}
          >
            {option.label}
          </button>
        {/each}
      </div>
    </Card.CardContent>
  </Card.Card>

  <Card.Card class="border-border/60">
    <Card.CardContent class="p-0">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{t('account.member')}</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{t('account.role')}</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">部门</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">技能标签</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{t('account.status')}</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">投入</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">地点</th>
              <th class="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/60">
            {#each filtered as member (member.id)}
              {@const sc = statusConfig[member.status]}
              <tr class="transition-colors hover:bg-accent/30">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="relative shrink-0">
                      <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {initials(member.name)}
                      </div>
                      <span class="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full {sc.dot} ring-2 ring-card"></span>
                    </div>
                    <div class="min-w-0">
                      <p class="truncate text-sm font-medium text-foreground">{member.name}</p>
                      <p class="truncate text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-foreground">{member.role}</td>
                <td class="px-4 py-3 text-sm text-muted-foreground">{member.department}</td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-1.5">
                    {#each member.skills as skill (skill)}
                      <Badge variant="outline" class="text-[10px]">{skill}</Badge>
                    {/each}
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="flex items-center gap-1 text-xs {sc.color}">
                    <sc.icon class="h-3 w-3" />{sc.label}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="w-28">
                    <div class="flex justify-between text-xs text-muted-foreground"><span>{member.projects} 项目</span><span>{member.utilization}%</span></div>
                    <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div class="h-full rounded-full bg-primary" style="width: {member.utilization}%"></div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{member.location}</td>
                <td class="px-4 py-3">
                  <Button variant="ghost" size="icon-sm"><MoreHorizontal class="h-4 w-4" /></Button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </Card.CardContent>
  </Card.Card>
</div>
