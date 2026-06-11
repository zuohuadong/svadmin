<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import * as Card from '../ui/card/index.js';
  import { Badge } from '../ui/badge/index.js';
  import { Button } from '../ui/button/index.js';
  import { Input } from '../ui/input/index.js';
  import { Checkbox } from '../ui/checkbox/index.js';
  import { Search, ShieldCheck, UserMinus, UserPlus } from '@lucide/svelte';

  interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Editor' | 'Viewer';
    department: string;
    status: 'active' | 'invited' | 'inactive';
    lastActive: string;
    permissions: string[];
  }

  let searchQuery = $state('');
  let roleFilter = $state<'all' | TeamMember['role']>('all');
  let selectedIds = $state<string[]>([]);

  const members: TeamMember[] = [
    { id: '1', name: 'Alex Chen', email: 'alex@acme.com', role: 'Admin', department: 'Engineering', status: 'active', lastActive: 'Just now', permissions: ['Users', 'Billing', 'Audit'] },
    { id: '2', name: 'Sarah Kim', email: 'sarah@acme.com', role: 'Editor', department: 'Design', status: 'active', lastActive: '5 min ago', permissions: ['Content', 'Projects'] },
    { id: '3', name: 'Mike Johnson', email: 'mike@acme.com', role: 'Viewer', department: 'Marketing', status: 'invited', lastActive: 'Pending', permissions: ['Reports'] },
    { id: '4', name: 'Lisa Wang', email: 'lisa@acme.com', role: 'Editor', department: 'Engineering', status: 'active', lastActive: '1 hour ago', permissions: ['Projects', 'Deploy'] },
    { id: '5', name: 'Tom Brown', email: 'tom@acme.com', role: 'Viewer', department: 'Sales', status: 'inactive', lastActive: '2 weeks ago', permissions: ['CRM'] },
    { id: '6', name: 'Emma Davis', email: 'emma@acme.com', role: 'Admin', department: 'Engineering', status: 'active', lastActive: '10 min ago', permissions: ['Users', 'Security'] },
  ];

  const filtered = $derived.by(() => {
    const query = searchQuery.trim().toLowerCase();
    return members.filter((member) => {
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      const matchesQuery = !query
        || member.name.toLowerCase().includes(query)
        || member.email.toLowerCase().includes(query)
        || member.department.toLowerCase().includes(query);
      return matchesRole && matchesQuery;
    });
  });

  const activeCount = $derived(members.filter((member) => member.status === 'active').length);
  const invitedCount = $derived(members.filter((member) => member.status === 'invited').length);
  const allVisibleSelected = $derived(filtered.length > 0 && filtered.every((member) => selectedIds.includes(member.id)));

  const roleColors = {
    Admin: 'bg-red-500/10 text-red-700 border-red-500/20',
    Editor: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    Viewer: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  };

  const statusColors = {
    active: 'bg-emerald-500/10 text-emerald-700',
    invited: 'bg-amber-500/10 text-amber-700',
    inactive: 'bg-muted text-muted-foreground',
  };

  function initials(name: string): string {
    return name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2);
  }

  function toggleMember(id: string, checked: boolean) {
    selectedIds = checked ? [...selectedIds, id] : selectedIds.filter((selectedId) => selectedId !== id);
  }

  function toggleVisible(checked: boolean) {
    const visibleIds = filtered.map((member) => member.id);
    selectedIds = checked
      ? Array.from(new Set([...selectedIds, ...visibleIds]))
      : selectedIds.filter((id) => !visibleIds.includes(id));
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
    <div>
      <h2 class="text-xl font-semibold text-foreground">{t('account.membersStarter')}</h2>
      <p class="mt-1 text-sm text-muted-foreground">{t('account.membersStarterDescription')}</p>
    </div>
    <div class="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" disabled={selectedIds.length === 0}>
        <UserMinus class="h-4 w-4" />
        批量停用 ({selectedIds.length})
      </Button>
      <Button size="sm">
        <UserPlus class="h-4 w-4" />
        {t('account.inviteMember')}
      </Button>
    </div>
  </div>

  <div class="grid gap-3 sm:grid-cols-3">
    <div class="rounded-lg border border-border/70 bg-card p-4">
      <div class="text-2xl font-semibold text-foreground">{members.length}</div>
      <div class="text-xs text-muted-foreground">成员总数</div>
    </div>
    <div class="rounded-lg border border-border/70 bg-card p-4">
      <div class="text-2xl font-semibold text-foreground">{activeCount}</div>
      <div class="text-xs text-muted-foreground">活跃成员</div>
    </div>
    <div class="rounded-lg border border-border/70 bg-card p-4">
      <div class="text-2xl font-semibold text-foreground">{invitedCount}</div>
      <div class="text-xs text-muted-foreground">待接受邀请</div>
    </div>
  </div>

  <div class="flex flex-col gap-2 lg:flex-row lg:items-center">
    <div class="relative min-w-64 flex-1">
      <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input placeholder={t('common.search')} bind:value={searchQuery} class="pl-9" />
    </div>
    <div class="flex overflow-hidden rounded-lg border border-border bg-background">
      {#each ['all', 'Admin', 'Editor', 'Viewer'] as role (role)}
        <button
          class="h-9 px-3 text-xs font-medium transition-colors {roleFilter === role ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}"
          onclick={() => roleFilter = role as typeof roleFilter}
        >
          {role === 'all' ? t('common.filter') : role}
        </button>
      {/each}
    </div>
  </div>

  <Card.Card class="border-border/70 bg-card">
    <Card.CardContent class="p-0">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b bg-muted/30">
              <th class="w-10 px-4 py-3 text-left">
                <Checkbox checked={allVisibleSelected} onCheckedChange={toggleVisible} aria-label="Select all visible members" />
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{t('account.member')}</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{t('account.role')}</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">权限范围</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{t('account.status')}</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">最近活动</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/70">
            {#each filtered as member (member.id)}
              <tr class="transition-colors hover:bg-accent/30">
                <td class="px-4 py-3">
                  <Checkbox checked={selectedIds.includes(member.id)} onCheckedChange={(checked) => toggleMember(member.id, checked)} aria-label={`Select ${member.name}`} />
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <span class="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {initials(member.name)}
                      <span class="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card {member.status === 'active' ? 'bg-emerald-500' : member.status === 'invited' ? 'bg-amber-500' : 'bg-muted-foreground'}"></span>
                    </span>
                    <div class="min-w-0">
                      <p class="truncate text-sm font-medium text-foreground">{member.name}</p>
                      <p class="truncate text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="rounded-full border px-2 py-0.5 text-[10px] font-semibold {roleColors[member.role]}">{member.role}</span>
                  <p class="mt-1 text-xs text-muted-foreground">{member.department}</p>
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-1">
                    {#each member.permissions as permission (permission)}
                      <Badge variant="outline" class="text-[10px]">
                        <ShieldCheck class="h-3 w-3" />
                        {permission}
                      </Badge>
                    {/each}
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="rounded-full px-2 py-0.5 text-[10px] font-semibold {statusColors[member.status]}">{member.status}</span>
                </td>
                <td class="px-4 py-3 text-sm text-muted-foreground">{member.lastActive}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </Card.CardContent>
  </Card.Card>
</div>
