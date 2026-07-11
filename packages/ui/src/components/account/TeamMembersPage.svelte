<script lang="ts">
  import { useTranslation } from '@svadmin/core/i18n';
  import * as Card from '../ui/card/index.js';
  import { Button } from '../ui/button/index.js';
  import { Input } from '../ui/input/index.js';
  import { Search, UserPlus, MoreHorizontal } from '@lucide/svelte';

  const i18n = useTranslation();

  interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Editor' | 'Viewer';
    avatar?: string;
    department: string;
    status: 'active' | 'invited' | 'inactive';
    lastActive: string;
  }

  let searchQuery = $state('');

  let members = $state<TeamMember[]>([
    { id: '1', name: 'Alex Chen', email: 'alex@acme.com', role: 'Admin', department: 'Engineering', status: 'active', lastActive: 'Just now' },
    { id: '2', name: 'Sarah Kim', email: 'sarah@acme.com', role: 'Editor', department: 'Design', status: 'active', lastActive: '5 min ago' },
    { id: '3', name: 'Mike Johnson', email: 'mike@acme.com', role: 'Viewer', department: 'Marketing', status: 'invited', lastActive: 'Pending' },
    { id: '4', name: 'Lisa Wang', email: 'lisa@acme.com', role: 'Editor', department: 'Engineering', status: 'active', lastActive: '1 hour ago' },
    { id: '5', name: 'Tom Brown', email: 'tom@acme.com', role: 'Viewer', department: 'Sales', status: 'inactive', lastActive: '2 weeks ago' },
    { id: '6', name: 'Emma Davis', email: 'emma@acme.com', role: 'Admin', department: 'Engineering', status: 'active', lastActive: '10 min ago' },
  ]);

  const filtered = $derived(
    searchQuery
      ? members.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.email.toLowerCase().includes(searchQuery.toLowerCase()) || m.department.toLowerCase().includes(searchQuery.toLowerCase()))
      : members
  );

  const roleColors = {
    'Admin': 'bg-red-500/10 text-red-600',
    'Editor': 'bg-blue-500/10 text-blue-600',
    'Viewer': 'bg-green-500/10 text-green-600',
  };

  const statusColors = {
    'active': 'bg-green-500/10 text-green-600',
    'invited': 'bg-amber-500/10 text-amber-600',
    'inactive': 'bg-muted text-muted-foreground',
  };

  const initials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  function statusLabel(status: TeamMember['status']) {
    if (status === 'active') return i18n.t('account.active');
    if (status === 'invited') return i18n.t('account.invited');
    return i18n.t('account.inactive');
  }
</script>

<div class="space-y-6" data-svadmin-content-page="account">
  <div class="flex items-start justify-between gap-4">
    <div>
      <h2 class="text-xl font-semibold text-foreground">{i18n.t('account.teamMembers')}</h2>
      <p class="mt-1 text-sm text-muted-foreground">{i18n.t('account.teamMembersDescription')}</p>
    </div>
    <Button size="sm">
      <UserPlus class="h-4 w-4 mr-1" />{i18n.t('account.inviteMember')}
    </Button>
  </div>

  <div class="relative">
    <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input placeholder={i18n.t('common.search')} bind:value={searchQuery} class="pl-9" />
  </div>

  <!-- Members grid -->
  <div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    {#each filtered as member (member.id)}
      <Card.Card class="border-border/60 hover:border-primary/30 transition-colors">
        <Card.CardContent class="p-4">
          <div class="flex items-start gap-3">
            <div class="shrink-0">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                {initials(member.name)}
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <h4 class="text-sm font-semibold text-foreground truncate">{member.name}</h4>
              </div>
              <p class="text-xs text-muted-foreground truncate">{member.email}</p>
              <div class="mt-2 flex flex-wrap gap-1.5">
                <span class="rounded-full px-2 py-0.5 text-[10px] font-semibold {roleColors[member.role]}">{member.role}</span>
                <span class="rounded-full px-2 py-0.5 text-[10px] font-semibold {statusColors[member.status]}">{statusLabel(member.status)}</span>
              </div>
              <div class="mt-2 flex items-center justify-between">
                <span class="text-xs text-muted-foreground">{member.department}</span>
                <span class="text-xs text-muted-foreground">{member.lastActive}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon-sm"><MoreHorizontal class="h-4 w-4" /></Button>
          </div>
        </Card.CardContent>
      </Card.Card>
    {/each}
  </div>
</div>
