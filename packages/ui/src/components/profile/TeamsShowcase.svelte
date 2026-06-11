<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import * as Card from '../ui/card/index.js';
  import { Badge } from '../ui/badge/index.js';
  import { Button } from '../ui/button/index.js';
  import { Avatar } from '../ui/avatar/index.js';
  import { ArrowRight, CheckCircle2, GitPullRequest, ShieldCheck, Users } from '@lucide/svelte';

  interface TeamMember {
    name: string;
    avatar?: string;
    role?: string;
  }

  interface Team {
    id: string;
    name: string;
    description: string;
    members: TeamMember[];
    totalMembers: number;
    color?: string;
    health?: number;
    openWork?: number;
    permissions?: string[];
    status?: 'active' | 'hiring' | 'paused';
  }

  interface Props {
    teams?: Team[];
  }

  let { teams = [] }: Props = $props();

  const statusConfig = {
    active: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    hiring: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    paused: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  };

  function initials(name: string): string {
    return name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2);
  }
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <div>
      <h3 class="text-lg font-semibold text-foreground">{t('publicProfile.teams')}</h3>
      <p class="mt-1 text-sm text-muted-foreground">Team ownership, permissions, workload, and operating health.</p>
    </div>
    <Badge variant="secondary">{teams.length}</Badge>
  </div>

  {#if teams.length === 0}
    <div class="rounded-xl border border-dashed border-border/70 bg-muted/20 p-8 text-center">
      <p class="text-sm text-muted-foreground">{t('publicProfile.noTeams')}</p>
    </div>
  {:else}
    <div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
      {#each teams as team (team.id)}
        {@const health = team.health ?? 0}
        {@const status = team.status ?? 'active'}
        <Card.Card class="border-border/70 bg-card transition-colors hover:border-primary/35">
          <Card.CardContent class="space-y-4 p-5">
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-start gap-3">
                <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary" style:background-color={team.color ? `${team.color}1a` : undefined} style:color={team.color}>
                  <Users class="h-5 w-5" />
                </div>
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <h4 class="truncate font-semibold text-foreground">{team.name}</h4>
                    <span class="rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize {statusConfig[status]}">{status}</span>
                  </div>
                  <p class="mt-1 line-clamp-2 text-sm text-muted-foreground">{team.description}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" aria-label="Open team">
                <ArrowRight class="h-4 w-4" />
              </Button>
            </div>

            <div class="grid gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground sm:grid-cols-3">
              <span class="flex items-center gap-1.5"><Users class="h-3.5 w-3.5" />{team.totalMembers} seats</span>
              <span class="flex items-center gap-1.5"><GitPullRequest class="h-3.5 w-3.5" />{team.openWork ?? 0} open</span>
              <span class="flex items-center gap-1.5"><CheckCircle2 class="h-3.5 w-3.5" />{health}% health</span>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="font-medium text-foreground">Operating health</span>
                <span class="font-mono text-muted-foreground">{health}%</span>
              </div>
              <div class="h-2 overflow-hidden rounded-full bg-muted">
                <div class="h-full rounded-full bg-primary" style="width: {health}%"></div>
              </div>
            </div>

            <div class="flex flex-wrap gap-1">
              {#each (team.permissions ?? []).slice(0, 4) as permission (permission)}
                <Badge variant="outline" class="text-[10px]">
                  <ShieldCheck class="h-3 w-3" />
                  {permission}
                </Badge>
              {/each}
            </div>

            <div class="flex items-center justify-between gap-3 border-t border-border/70 pt-3">
              <div class="flex -space-x-2">
                {#each team.members.slice(0, 5) as member (member.name)}
                  {#if member.avatar}
                    <Avatar class="h-8 w-8 border-2 border-card">
                      <img src={member.avatar} alt={member.name} />
                    </Avatar>
                  {:else}
                    <span class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-primary/10 text-[10px] font-semibold text-primary">
                      {initials(member.name)}
                    </span>
                  {/if}
                {/each}
                {#if team.totalMembers > team.members.length}
                  <span class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-semibold text-muted-foreground">
                    +{team.totalMembers - team.members.length}
                  </span>
                {/if}
              </div>
              <Button variant="outline" size="sm">
                {t('publicProfile.viewProfile')}
              </Button>
            </div>
          </Card.CardContent>
        </Card.Card>
      {/each}
    </div>
  {/if}
</div>
