<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import * as Card from '../ui/card/index.js';
  import { Badge } from '../ui/badge/index.js';
  import { Button } from '../ui/button/index.js';
  import { Avatar } from '../ui/avatar/index.js';
  import { CheckCircle2, FileText, Heart, MessageSquare, Plus, Reply, Star, UserPlus } from '@lucide/svelte';
  import type { Component } from 'svelte';

  interface ActivityItem {
    id: string;
    type: 'posted' | 'commented' | 'joined' | 'created' | 'starred';
    user: string;
    avatar?: string;
    content?: string;
    target?: string;
    timestamp: string;
    group?: 'Today' | 'This week' | 'Earlier';
    comments?: number;
    reactions?: number;
    attachment?: string;
    status?: 'resolved' | 'open' | 'review';
  }

  interface Props {
    activities?: ActivityItem[];
  }

  let { activities = [] }: Props = $props();
  let visibleCount = $state(6);

  const typeConfig: Record<ActivityItem['type'], { icon: Component; color: string; action: string }> = {
    posted: { icon: MessageSquare, color: 'bg-blue-500/10 text-blue-700', action: t('publicProfile.activityPosted') },
    commented: { icon: Reply, color: 'bg-emerald-500/10 text-emerald-700', action: t('publicProfile.activityCommented') },
    joined: { icon: UserPlus, color: 'bg-violet-500/10 text-violet-700', action: t('publicProfile.activityJoined') },
    created: { icon: Plus, color: 'bg-amber-500/10 text-amber-700', action: t('publicProfile.activityCreated') },
    starred: { icon: Star, color: 'bg-yellow-500/10 text-yellow-700', action: t('publicProfile.activityCreated') },
  };

  const statusConfig = {
    resolved: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    open: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    review: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  };

  const visibleActivities = $derived(activities.slice(0, visibleCount));
  const groupedActivities = $derived.by(() => {
    const groups: Array<{ label: string; items: ActivityItem[] }> = [];
    for (const activity of visibleActivities) {
      const label = activity.group ?? 'Earlier';
      const group = groups.find((item) => item.label === label);
      if (group) group.items.push(activity);
      else groups.push({ label, items: [activity] });
    }
    return groups;
  });

  function initials(name: string): string {
    return name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2);
  }
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <div>
      <h3 class="text-lg font-semibold text-foreground">{t('publicProfile.activity')}</h3>
      <p class="mt-1 text-sm text-muted-foreground">Recent updates, comments, reviews, and team changes.</p>
    </div>
    <Badge variant="secondary">{activities.length}</Badge>
  </div>

  {#if activities.length === 0}
    <div class="rounded-xl border border-dashed border-border/70 bg-muted/20 p-8 text-center">
      <p class="text-sm text-muted-foreground">{t('publicProfile.noActivity')}</p>
    </div>
  {:else}
    <Card.Card class="border-border/70 bg-card">
      <Card.CardContent class="p-0">
        <div class="divide-y divide-border/70">
          {#each groupedActivities as group (group.label)}
            <section class="p-4">
              <div class="mb-4 flex items-center gap-3">
                <span class="rounded-full border border-border/70 bg-muted/30 px-2.5 py-1 text-xs font-semibold text-foreground">{group.label}</span>
                <span class="h-px flex-1 bg-border/70"></span>
              </div>

              <div class="space-y-3">
                {#each group.items as activity (activity.id)}
                  {@const config = typeConfig[activity.type] ?? typeConfig.posted}
                  <article class="grid gap-3 rounded-lg border border-border/60 bg-background p-4 sm:grid-cols-[auto_1fr]">
                    <div class="relative">
                      {#if activity.avatar}
                        <Avatar class="h-10 w-10">
                          <img src={activity.avatar} alt={activity.user} />
                        </Avatar>
                      {:else}
                        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {initials(activity.user)}
                        </div>
                      {/if}
                      <span class="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card {config.color}">
                        <config.icon class="h-3 w-3" />
                      </span>
                    </div>

                    <div class="min-w-0 space-y-3">
                      <div class="flex flex-wrap items-start justify-between gap-2">
                        <div class="min-w-0">
                          <p class="text-sm">
                            <strong class="text-foreground">{activity.user}</strong>
                            <span class="text-muted-foreground"> {config.action} </span>
                            {#if activity.target}
                              <strong class="text-foreground">{activity.target}</strong>
                            {/if}
                          </p>
                          <p class="mt-0.5 text-xs text-muted-foreground">{activity.timestamp}</p>
                        </div>
                        {#if activity.status}
                          <span class="rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize {statusConfig[activity.status]}">{activity.status}</span>
                        {/if}
                      </div>

                      {#if activity.content}
                        <p class="rounded-lg bg-muted/25 p-3 text-sm leading-relaxed text-muted-foreground">{activity.content}</p>
                      {/if}

                      {#if activity.attachment}
                        <div class="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                          <span class="flex min-w-0 items-center gap-2 text-sm text-foreground">
                            <FileText class="h-4 w-4 text-muted-foreground" />
                            <span class="truncate">{activity.attachment}</span>
                          </span>
                          <CheckCircle2 class="h-4 w-4 shrink-0 text-emerald-600" />
                        </div>
                      {/if}

                      <div class="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Button variant="ghost" size="sm" class="h-8 px-2">
                          <MessageSquare class="h-3.5 w-3.5" />
                          {activity.comments ?? 0}
                        </Button>
                        <Button variant="ghost" size="sm" class="h-8 px-2">
                          <Heart class="h-3.5 w-3.5" />
                          {activity.reactions ?? 0}
                        </Button>
                      </div>
                    </div>
                  </article>
                {/each}
              </div>
            </section>
          {/each}
        </div>
      </Card.CardContent>
    </Card.Card>

    {#if visibleCount < activities.length}
      <div class="flex justify-center">
        <Button variant="outline" onclick={() => visibleCount = Math.min(visibleCount + 4, activities.length)}>
          {t('common.showMore')}
        </Button>
      </div>
    {/if}
  {/if}
</div>
