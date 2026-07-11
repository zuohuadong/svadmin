<script lang="ts">
  import { useTranslation } from '@svadmin/core/i18n';
  import * as Card from '../ui/card/index.js';
  import { Button } from '../ui/button/index.js';
  import { Badge } from '../ui/badge/index.js';
  import { Avatar } from '../ui/avatar/index.js';
  import { Input } from '../ui/input/index.js';
  import { Search, UserPlus, MoreHorizontal, Clock, CheckCircle2, XCircle } from '@lucide/svelte';

  const i18n = useTranslation();

  interface Member {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'invited' | 'inactive';
    avatar?: string;
    joinedAt: string;
  }

  let searchQuery = $state('');

  let members = $state<Member[]>([
    { id: '1', name: 'Alex Chen', email: 'alex@acme.com', role: 'Admin', status: 'active', joinedAt: '2023-01-15' },
    { id: '2', name: 'Sarah Kim', email: 'sarah@acme.com', role: 'Editor', status: 'active', joinedAt: '2023-03-22' },
    { id: '3', name: 'Mike Johnson', email: 'mike@acme.com', role: 'Viewer', status: 'invited', joinedAt: '2024-01-10' },
    { id: '4', name: 'Lisa Wang', email: 'lisa@acme.com', role: 'Editor', status: 'active', joinedAt: '2023-06-05' },
    { id: '5', name: 'Tom Brown', email: 'tom@acme.com', role: 'Viewer', status: 'inactive', joinedAt: '2022-11-20' },
    { id: '6', name: 'Emma Davis', email: 'emma@acme.com', role: 'Admin', status: 'active', joinedAt: '2023-02-14' },
  ]);

  const filteredMembers = $derived(
    searchQuery
      ? members.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.email.toLowerCase().includes(searchQuery.toLowerCase()))
      : members
  );

  const statusConfig = {
    'active': { icon: CheckCircle2, color: 'text-green-500', label: i18n.t('account.active') },
    'invited': { icon: Clock, color: 'text-amber-500', label: i18n.t('account.invited') },
    'inactive': { icon: XCircle, color: 'text-muted-foreground', label: i18n.t('account.inactive') },
  };

  const initials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
</script>

<div class="space-y-6" data-svadmin-content-page="account">
  <div class="flex items-start justify-between gap-4">
    <div>
      <h2 class="text-xl font-semibold text-foreground">{i18n.t('account.membersStarter')}</h2>
      <p class="mt-1 text-sm text-muted-foreground">{i18n.t('account.membersStarterDescription')}</p>
    </div>
    <Button size="sm">
      <UserPlus class="h-4 w-4 mr-1" />{i18n.t('account.inviteMember')}
    </Button>
  </div>

  <!-- Search -->
  <div class="relative">
    <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      placeholder={i18n.t('common.search')}
      bind:value={searchQuery}
      class="pl-9"
    />
  </div>

  <!-- Members list -->
  <Card.Card class="border-border/60">
    <Card.CardContent class="p-0">
      <div class="divide-y">
        {#each filteredMembers as member (member.id)}
          {@const sc = statusConfig[member.status]}
          <div class="flex items-center gap-3 p-4 hover:bg-accent/30 transition-colors">
            <div class="shrink-0">
              {#if member.avatar}
                <Avatar class="h-9 w-9"><img src={member.avatar} alt={member.name} /></Avatar>
              {:else}
                <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  {initials(member.name)}
                </div>
              {/if}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-foreground truncate">{member.name}</span>
                <Badge variant="outline" class="text-[10px] shrink-0">{member.role}</Badge>
              </div>
              <p class="text-xs text-muted-foreground truncate">{member.email}</p>
            </div>
            <div class="shrink-0 flex items-center gap-3">
              <span class="flex items-center gap-1 text-xs {sc.color}">
                <sc.icon class="h-3 w-3" />
                {sc.label}
              </span>
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
