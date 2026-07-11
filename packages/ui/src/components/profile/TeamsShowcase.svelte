<script lang="ts">
  import { useTranslation } from '@svadmin/core/i18n';
  import * as Card from '../ui/card/index.js';
  import { Badge } from '../ui/badge/index.js';
  import { Button } from '../ui/button/index.js';
  import { Avatar } from '../ui/avatar/index.js';
  import { Users, ArrowRight } from '@lucide/svelte';

  const i18n = useTranslation();

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
  }

  interface Props {
    teams?: Team[];
  }

  let { teams = [] }: Props = $props();

  const initials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
</script>

<div class="space-y-4">
  <h3 class="text-lg font-semibold text-foreground">{i18n.t('publicProfile.teams')}</h3>

  {#if teams.length === 0}
    <div class="rounded-xl border border-dashed border-border/60 p-8 text-center">
      <p class="text-sm text-muted-foreground">{i18n.t('publicProfile.noTeams')}</p>
    </div>
  {:else}
    <div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
      {#each teams as team (team.id)}
        <Card.Card class="border-border/60 hover:border-primary/30 transition-colors">
          <Card.CardContent class="p-4 space-y-3">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-3">
                {#if team.color}
                  <div class="h-8 w-8 rounded-lg" style="background-color: {team.color}20;">
                    <Users class="h-4 w-4" style="color: {team.color}" />
                  </div>
                {:else}
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Users class="h-4 w-4" />
                  </div>
                {/if}
                <div>
                  <h4 class="font-semibold text-foreground">{team.name}</h4>
                  <p class="text-xs text-muted-foreground">{team.totalMembers} {i18n.t('publicProfile.projectMembers', { count: team.totalMembers })}</p>
                </div>
              </div>
              <Badge variant="secondary" class="shrink-0">
                <Users class="h-3 w-3 mr-1" />{team.totalMembers}
              </Badge>
            </div>

            <p class="text-sm text-muted-foreground line-clamp-2">{team.description}</p>

            <!-- Member avatars -->
            <div class="flex items-center gap-1">
              {#each team.members.slice(0, 5) as member (member.name)}
                {#if member.avatar}
                  <Avatar class="h-7 w-7 ring-1 ring-background">
                    <img src={member.avatar} alt={member.name} />
                  </Avatar>
                {:else}
                  <div class="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground ring-1 ring-background">
                    {initials(member.name)}
                  </div>
                {/if}
              {/each}
              {#if team.members.length > 5}
                <div class="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground ring-1 ring-background">
                  +{team.members.length - 5}
                </div>
              {/if}
            </div>

            <div class="pt-2 border-t">
              <Button variant="ghost" size="sm" class="w-full">
                {i18n.t('publicProfile.viewProfile')} <ArrowRight class="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </Card.CardContent>
        </Card.Card>
      {/each}
    </div>
  {/if}
</div>
