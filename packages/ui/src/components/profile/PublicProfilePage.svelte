<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import * as Card from '../ui/card/index.js';
  import { Button } from '../ui/button/index.js';
  import { Badge } from '../ui/badge/index.js';
  import * as Tabs from '../ui/tabs/index.js';
  import ProjectsGrid from './ProjectsGrid.svelte';
  import ActivityTimeline from './ActivityTimeline.svelte';
  import TeamsShowcase from './TeamsShowcase.svelte';
  import { MapPin, Link, Calendar, MoreHorizontal } from '@lucide/svelte';

  type ProfileVariant = 'default' | 'company' | 'gamer';
  type ProfileTab = 'projects' | 'activity' | 'teams';

  interface Props {
    variant?: ProfileVariant;
    initialTab?: ProfileTab;
    columns?: 2 | 3;
  }

  let { variant = 'default', initialTab = 'projects', columns = 2 }: Props = $props();
  let activeTab = $derived<ProfileTab>(initialTab);

  // Demo profile data based on variant
  const profileData = $derived.by(() => {
    if (variant === 'company') {
      return {
        name: 'Acme Corporation',
        tagline: 'Building the future of enterprise software',
        industry: 'Technology',
        employees: 1250,
        founded: '2015',
        website: 'acme.com',
        location: 'San Francisco, CA',
        followers: 8420,
        following: 312,
        stats: [
          { label: t('profile.employees'), value: '1,250' },
          { label: t('publicProfile.projects'), value: '48' },
          { label: t('publicProfile.teams'), value: '12' },
        ],
        tags: ['SaaS', 'Enterprise', 'Cloud', 'AI'],
      };
    } else if (variant === 'gamer') {
      return {
        name: 'ShadowFox',
        tagline: 'Pro gamer & content creator',
        gamerTag: 'ShadowFox#7742',
        level: 42,
        rank: 'Diamond II',
        location: 'Seoul, KR',
        followers: 24600,
        following: 180,
        stats: [
          { label: t('profile.gamesPlayed'), value: '1,284' },
          { label: t('profile.winRate'), value: '68%' },
          { label: t('profile.rank'), value: 'Diamond II' },
        ],
        tags: ['FPS', 'RPG', 'Streaming', 'Esports'],
      };
    }
    return {
      name: 'Alex Chen',
      tagline: 'Full-stack developer & open source enthusiast',
      location: 'Shanghai, CN',
      website: 'alexchen.dev',
      joinedDate: '2023',
      followers: 1234,
      following: 567,
      stats: [
        { label: t('publicProfile.projects'), value: '24' },
        { label: t('publicProfile.followers'), value: '1.2K' },
        { label: t('publicProfile.following'), value: '567' },
      ],
      tags: ['TypeScript', 'Svelte', 'Node.js', 'Open Source'],
    };
  });

  // Demo data
  const demoProjects = [
    { id: '1', name: 'Dashboard Redesign', description: 'Modern admin dashboard with real-time analytics and customizable widgets.', members: 8, tasks: 34, status: 'active' as const, tags: ['UI', 'Analytics'] },
    { id: '2', name: 'API Gateway v2', description: 'High-performance API gateway with rate limiting and circuit breaker patterns.', members: 5, tasks: 21, status: 'active' as const, tags: ['Backend', 'Infra'] },
    { id: '3', name: 'Mobile App', description: 'Cross-platform mobile application built with React Native.', members: 12, tasks: 56, status: 'completed' as const, tags: ['Mobile', 'React'] },
    { id: '4', name: 'Data Pipeline', description: 'Real-time data processing pipeline for event streaming.', members: 3, tasks: 18, status: 'on-hold' as const, tags: ['Data', 'Streaming'] },
  ];

  const demoActivities = [
    { id: '1', type: 'posted' as const, user: 'Alex Chen', content: 'Just shipped the new dashboard redesign with real-time analytics support.', timestamp: '2 hours ago' },
    { id: '2', type: 'commented' as const, user: 'Alex Chen', target: 'API Gateway PR #42', content: 'Looks great, just a few minor suggestions on error handling.', timestamp: '5 hours ago' },
    { id: '3', type: 'created' as const, user: 'Alex Chen', target: 'Mobile App project', timestamp: '1 day ago' },
    { id: '4', type: 'joined' as const, user: 'Alex Chen', target: 'Design Systems Guild', timestamp: '3 days ago' },
    { id: '5', type: 'starred' as const, user: 'Alex Chen', target: 'svadmin/svadmin', timestamp: '1 week ago' },
  ];

  const demoTeams = [
    { id: '1', name: 'Frontend Platform', description: 'Building the core UI component library and design system.', members: [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Carol' }], totalMembers: 8, color: '#3b82f6' },
    { id: '2', name: 'Backend Services', description: 'API development, microservices architecture, and infrastructure.', members: [{ name: 'Dave' }, { name: 'Eve' }], totalMembers: 5, color: '#10b981' },
    { id: '3', name: 'Design', description: 'User experience research and visual design.', members: [{ name: 'Frank' }, { name: 'Grace' }, { name: 'Hank' }, { name: 'Ivy' }], totalMembers: 6, color: '#f59e0b' },
  ];
</script>

<div class="space-y-6" data-svadmin-content-page="public-profile">
  <!-- Cover + Profile Header -->
  <Card.Card class="overflow-hidden border-border/60">
    <div class="h-40 bg-gradient-to-r from-primary/25 via-primary/15 to-accent/20 relative">
      <div class="absolute inset-0 opacity-[0.06]" style="background-image: radial-gradient(circle, currentColor 1px, transparent 1px); background-size: 24px 24px;"></div>
    </div>
    <Card.CardContent class="relative px-6 pb-5">
      <div class="-mt-12 flex flex-col sm:flex-row sm:items-end gap-4">
        <div class="ring-4 ring-card rounded-2xl overflow-hidden shrink-0">
          <div class="flex h-24 w-24 items-center justify-center bg-primary/10 text-primary text-3xl font-bold">
            {profileData.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold text-foreground">{profileData.name}</h2>
          {#if profileData.tagline}
            <p class="text-muted-foreground">{profileData.tagline}</p>
          {/if}
          <div class="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {#if profileData.location}
              <span class="flex items-center gap-1"><MapPin class="h-3.5 w-3.5" />{profileData.location}</span>
            {/if}
            {#if profileData.website}
              <span class="flex items-center gap-1"><Link class="h-3.5 w-3.5" />{profileData.website}</span>
            {/if}
            {#if 'joinedDate' in profileData && profileData.joinedDate}
              <span class="flex items-center gap-1"><Calendar class="h-3.5 w-3.5" />{t('publicProfile.joinedDate', { date: profileData.joinedDate })}</span>
            {/if}
          </div>
        </div>
        <div class="flex gap-2 shrink-0">
          <Button size="sm">{t('publicProfile.editProfile')}</Button>
          <Button size="sm" variant="outline">{t('publicProfile.sendMessage')}</Button>
          <Button size="sm" variant="ghost"><MoreHorizontal class="h-4 w-4" /></Button>
        </div>
      </div>

      <!-- Stats -->
      {#if profileData.stats.length > 0}
        <div class="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
          {#each profileData.stats as stat (stat.label)}
            <div class="text-center">
              <div class="text-xl font-bold text-foreground">{stat.value}</div>
              <div class="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          {/each}
        </div>
      {/if}

      <!-- Tags -->
      {#if profileData.tags.length > 0}
        <div class="mt-3 flex flex-wrap gap-1.5">
          {#each profileData.tags as tag (tag)}
            <Badge variant="outline" class="text-xs">{tag}</Badge>
          {/each}
        </div>
      {/if}
    </Card.CardContent>
  </Card.Card>

  <!-- Tabs: Projects / Activity / Teams -->
  <Tabs.Root value={activeTab}>
    <Tabs.List class="w-full justify-start border-b">
      <Tabs.Trigger value="projects" active={activeTab === 'projects'} onclick={() => activeTab = 'projects'} class="gap-1.5">{t('publicProfile.projects')}</Tabs.Trigger>
      <Tabs.Trigger value="activity" active={activeTab === 'activity'} onclick={() => activeTab = 'activity'} class="gap-1.5">{t('publicProfile.activity')}</Tabs.Trigger>
      <Tabs.Trigger value="teams" active={activeTab === 'teams'} onclick={() => activeTab = 'teams'} class="gap-1.5">{t('publicProfile.teams')}</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="projects" active={activeTab === 'projects'} class="mt-4">
      <ProjectsGrid {columns} projects={demoProjects} />
    </Tabs.Content>
    <Tabs.Content value="activity" active={activeTab === 'activity'} class="mt-4">
      <ActivityTimeline activities={demoActivities} />
    </Tabs.Content>
    <Tabs.Content value="teams" active={activeTab === 'teams'} class="mt-4">
      <TeamsShowcase teams={demoTeams} />
    </Tabs.Content>
  </Tabs.Root>
</div>
