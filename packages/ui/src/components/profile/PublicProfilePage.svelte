<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import * as Card from '../ui/card/index.js';
  import { Button } from '../ui/button/index.js';
  import { Badge } from '../ui/badge/index.js';
  import * as Tabs from '../ui/tabs/index.js';
  import ProjectsGrid from './ProjectsGrid.svelte';
  import ActivityTimeline from './ActivityTimeline.svelte';
  import TeamsShowcase from './TeamsShowcase.svelte';
  import { Award, Building2, Calendar, Copy, Gamepad2, Link, MapPin, MessageSquare, MoreHorizontal, ShieldCheck, Star, Trophy } from '@lucide/svelte';

  type ProfileVariant = 'default' | 'company' | 'gamer';
  type ProfileTab = 'projects' | 'activity' | 'teams';

  interface Props {
    variant?: ProfileVariant;
    initialTab?: ProfileTab;
    columns?: 2 | 3;
  }

  let { variant = 'default', initialTab = 'projects', columns = 2 }: Props = $props();
  let activeTab = $derived<ProfileTab>(initialTab);
  let following = $state(false);
  let copied = $state(false);

  const profileData = $derived.by(() => {
    if (variant === 'company') {
      return {
        name: '曜石数科',
        tagline: '企业协同、智能运营与数据治理平台',
        industry: 'Enterprise Software',
        employees: 1250,
        founded: '2015',
        website: 'obsidian.example',
        location: 'Shanghai, CN',
        followers: 8420,
        following: 312,
        onlineLabel: 'Verified business',
        badgeLabel: 'ISO 27001',
        stats: [
          { label: t('profile.employees'), value: '1,250' },
          { label: t('publicProfile.projects'), value: '48' },
          { label: t('publicProfile.teams'), value: '12' },
          { label: 'SLA', value: '99.95%' },
        ],
        tags: ['SaaS', 'Enterprise', 'Data', 'AI'],
        highlights: [
          { label: '经营周期', value: 'Q2 / FY26' },
          { label: '活跃客户', value: '284' },
          { label: '合规覆盖', value: '8 regions' },
        ],
      };
    }
    if (variant === 'gamer') {
      return {
        name: 'ShadowFox',
        tagline: '职业玩家与内容创作者',
        gamerTag: 'ShadowFox#7742',
        level: 42,
        rank: 'Diamond II',
        website: 'shadowfox.live',
        location: 'Seoul, KR',
        followers: 24600,
        following: 180,
        onlineLabel: 'Live now',
        badgeLabel: 'Season MVP',
        stats: [
          { label: t('profile.gamesPlayed'), value: '1,284' },
          { label: t('profile.winRate'), value: '68%' },
          { label: t('profile.rank'), value: 'Diamond II' },
          { label: 'KDA', value: '4.8' },
        ],
        tags: ['FPS', 'RPG', 'Streaming', 'Esports'],
        highlights: [
          { label: '赛季积分', value: '8,920' },
          { label: '连胜', value: '11' },
          { label: '成就', value: '36' },
        ],
      };
    }
    return {
      name: 'Alex Chen',
      tagline: '全栈工程师与开源维护者',
      location: 'Shanghai, CN',
      website: 'alexchen.dev',
      joinedDate: '2023',
      followers: 1234,
      following: 567,
      onlineLabel: 'Available',
      badgeLabel: 'Core maintainer',
      stats: [
        { label: t('publicProfile.projects'), value: '24' },
        { label: t('publicProfile.followers'), value: '1.2K' },
        { label: t('publicProfile.following'), value: '567' },
        { label: 'OSS', value: '18' },
      ],
      tags: ['TypeScript', 'Svelte', 'Node.js', 'Open Source'],
      highlights: [
        { label: '当前冲刺', value: 'Platform UI' },
        { label: '本周提交', value: '32' },
        { label: '响应时间', value: '1.8h' },
      ],
    };
  });

  const demoProjects = [
    { id: '1', name: 'Dashboard Redesign', description: 'Modern admin dashboard with real-time analytics and customizable widgets.', members: 8, tasks: 34, status: 'active' as const, tags: ['UI', 'Analytics'], progress: 76, dueDate: 'Jun 28', priority: 'High' as const, memberList: [{ name: 'Alex Chen' }, { name: 'Sarah Kim' }, { name: 'Lisa Wang' }, { name: 'Tom Brown' }] },
    { id: '2', name: 'API Gateway v2', description: 'High-performance API gateway with rate limiting and circuit breaker patterns.', members: 5, tasks: 21, status: 'active' as const, tags: ['Backend', 'Infra'], progress: 58, dueDate: 'Jul 04', priority: 'Medium' as const, memberList: [{ name: 'Emma Davis' }, { name: 'James Wilson' }, { name: 'Mike Johnson' }] },
    { id: '3', name: 'Mobile App', description: 'Cross-platform mobile application for team approvals, push alerts, and field operations.', members: 12, tasks: 56, status: 'completed' as const, tags: ['Mobile', 'React'], progress: 100, dueDate: 'May 16', priority: 'Low' as const, memberList: [{ name: 'Yuki Tanaka' }, { name: 'Frank Zhao' }, { name: 'Grace Liu' }, { name: 'Alice Li' }] },
    { id: '4', name: 'Data Pipeline', description: 'Real-time data processing pipeline for event streaming and operational telemetry.', members: 3, tasks: 18, status: 'on-hold' as const, tags: ['Data', 'Streaming'], progress: 33, dueDate: 'Paused', priority: 'Medium' as const, memberList: [{ name: 'Nora Sun' }, { name: 'Derek Lin' }] },
    { id: '5', name: 'Identity Center', description: 'Centralized account security, device posture, and access governance workspace.', members: 6, tasks: 29, status: 'active' as const, tags: ['Security', 'IAM'], progress: 64, dueDate: 'Jul 12', priority: 'High' as const, memberList: [{ name: 'Ivy Chen' }, { name: 'Oscar Wu' }, { name: 'Mia Zhao' }] },
    { id: '6', name: 'Reporting Studio', description: 'Curated executive reports with saved views, scheduled exports, and anomaly notes.', members: 4, tasks: 17, status: 'active' as const, tags: ['Reports', 'BI'], progress: 49, dueDate: 'Jul 22', priority: 'Medium' as const, memberList: [{ name: 'Leo Wang' }, { name: 'Rita Huang' }] },
  ];

  const demoActivities = [
    { id: '1', group: 'Today' as const, type: 'posted' as const, user: 'Alex Chen', content: 'Published the operations dashboard review with updated card density, table contrast, and list drill-downs.', timestamp: '2 hours ago', comments: 6, reactions: 18, attachment: 'dashboard-review.pdf', status: 'review' as const },
    { id: '2', group: 'Today' as const, type: 'commented' as const, user: 'Sarah Kim', target: 'API Gateway PR #42', content: 'Added response caching notes and marked the retry policy section as resolved.', timestamp: '5 hours ago', comments: 3, reactions: 11, status: 'resolved' as const },
    { id: '3', group: 'This week' as const, type: 'created' as const, user: 'Emma Davis', target: 'Identity Center project', timestamp: '1 day ago', comments: 2, reactions: 9, attachment: 'access-matrix.csv', status: 'open' as const },
    { id: '4', group: 'This week' as const, type: 'joined' as const, user: 'Lisa Wang', target: 'Design Systems Guild', timestamp: '3 days ago', comments: 1, reactions: 14 },
    { id: '5', group: 'Earlier' as const, type: 'starred' as const, user: 'Alex Chen', target: 'svadmin/svadmin', timestamp: '1 week ago', comments: 0, reactions: 28 },
    { id: '6', group: 'Earlier' as const, type: 'posted' as const, user: 'Mike Johnson', content: 'Closed the sprint retrospective with owner mapping for all delayed tasks.', timestamp: '2 weeks ago', comments: 4, reactions: 16, status: 'resolved' as const },
  ];

  const demoTeams = [
    { id: '1', name: 'Frontend Platform', description: 'Core UI component library, design tokens, and admin page patterns.', members: [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Carol' }, { name: 'Diana' }], totalMembers: 8, color: '#2563eb', health: 92, openWork: 14, permissions: ['UI', 'Release', 'Review'], status: 'active' as const },
    { id: '2', name: 'Backend Services', description: 'API development, event delivery, and integration reliability.', members: [{ name: 'Dave' }, { name: 'Eve' }, { name: 'Frank' }], totalMembers: 5, color: '#059669', health: 84, openWork: 9, permissions: ['API', 'Deploy', 'Logs'], status: 'active' as const },
    { id: '3', name: 'Design Ops', description: 'User research, interface polish, and product quality rituals.', members: [{ name: 'Grace' }, { name: 'Hank' }, { name: 'Ivy' }, { name: 'Judy' }], totalMembers: 6, color: '#d97706', health: 78, openWork: 7, permissions: ['Design', 'Docs'], status: 'hiring' as const },
    { id: '4', name: 'Security Guild', description: 'Access review, audit readiness, and data boundary decisions.', members: [{ name: 'Kevin' }, { name: 'Mia' }], totalMembers: 4, color: '#dc2626', health: 69, openWork: 11, permissions: ['Audit', 'IAM', 'Policy'], status: 'active' as const },
  ];

  function initials(name: string): string {
    return name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2);
  }

  function handleCopyContact() {
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 1600);
  }
</script>

<div class="space-y-6">
  <Card.Card class="overflow-hidden border-border/70 bg-card">
    <div class="relative h-36 bg-[linear-gradient(120deg,oklch(0.96_0.02_250),oklch(0.92_0.025_190),oklch(0.96_0.02_85))]">
      <div class="absolute inset-x-0 bottom-0 h-px bg-border/80"></div>
    </div>
    <Card.CardContent class="relative px-5 pb-5 sm:px-6">
      <div class="-mt-12 flex flex-col gap-4 lg:flex-row lg:items-end">
        <div class="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border-4 border-card bg-primary/10 text-2xl font-bold text-primary shadow-sm">
          {initials(profileData.name)}
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="text-2xl font-semibold text-foreground">{profileData.name}</h2>
            <Badge variant="secondary" class="gap-1">
              {#if variant === 'company'}
                <Building2 class="h-3 w-3" />
              {:else if variant === 'gamer'}
                <Gamepad2 class="h-3 w-3" />
              {:else}
                <ShieldCheck class="h-3 w-3" />
              {/if}
              {profileData.badgeLabel}
            </Badge>
            <span class="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
              {profileData.onlineLabel}
            </span>
          </div>
          <p class="mt-1 text-sm text-muted-foreground">{profileData.tagline}</p>
          <div class="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
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
        <div class="flex flex-wrap gap-2">
          <Button size="sm" variant={following ? 'outline' : 'default'} onclick={() => following = !following}>
            <Star class="h-4 w-4" />
            {following ? 'Following' : 'Follow'}
          </Button>
          <Button size="sm" variant="outline" onclick={handleCopyContact}>
            <Copy class="h-4 w-4" />
            {copied ? t('common.copied') : t('common.copy')}
          </Button>
          <Button size="sm" variant="ghost" aria-label="More actions">
            <MoreHorizontal class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {#each profileData.stats as stat (stat.label)}
          <div class="rounded-lg border border-border/60 bg-muted/20 p-3">
            <div class="text-xl font-semibold text-foreground">{stat.value}</div>
            <div class="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        {/each}
      </div>

      <div class="mt-4 flex flex-wrap gap-1.5">
        {#each profileData.tags as tag (tag)}
          <Badge variant="outline" class="text-xs">{tag}</Badge>
        {/each}
      </div>
    </Card.CardContent>
  </Card.Card>

  <div class="grid gap-6 xl:grid-cols-[1fr_18rem]">
    <div class="min-w-0">
      <Tabs.Root value={activeTab}>
        <Tabs.List class="w-full justify-start border-b">
          <Tabs.Trigger value="projects" active={activeTab === 'projects'} onclick={() => activeTab = 'projects'}>{t('publicProfile.projects')}</Tabs.Trigger>
          <Tabs.Trigger value="activity" active={activeTab === 'activity'} onclick={() => activeTab = 'activity'}>{t('publicProfile.activity')}</Tabs.Trigger>
          <Tabs.Trigger value="teams" active={activeTab === 'teams'} onclick={() => activeTab = 'teams'}>{t('publicProfile.teams')}</Tabs.Trigger>
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

    <aside class="space-y-4">
      <Card.Card class="border-border/70 bg-card">
        <Card.CardHeader>
          <Card.CardTitle class="text-base">Profile signals</Card.CardTitle>
        </Card.CardHeader>
        <Card.CardContent class="space-y-3">
          {#each profileData.highlights as item (item.label)}
            <div class="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
              <span class="text-xs text-muted-foreground">{item.label}</span>
              <span class="text-sm font-semibold text-foreground">{item.value}</span>
            </div>
          {/each}
        </Card.CardContent>
      </Card.Card>

      <Card.Card class="border-border/70 bg-card">
        <Card.CardContent class="space-y-3 p-4">
          <div class="flex items-center gap-2 text-sm font-semibold text-foreground">
            {#if variant === 'company'}
              <Building2 class="h-4 w-4 text-primary" />
              Business readiness
            {:else if variant === 'gamer'}
              <Trophy class="h-4 w-4 text-primary" />
              Competitive form
            {:else}
              <Award class="h-4 w-4 text-primary" />
              Contributor quality
            {/if}
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="text-muted-foreground">Trust score</span>
              <span class="font-mono text-foreground">{variant === 'gamer' ? 88 : variant === 'company' ? 94 : 91}%</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-muted">
              <div class="h-full rounded-full bg-primary" style="width: {variant === 'gamer' ? 88 : variant === 'company' ? 94 : 91}%"></div>
            </div>
          </div>
          <Button variant="outline" size="sm" class="w-full">
            <MessageSquare class="h-4 w-4" />
            {t('publicProfile.sendMessage')}
          </Button>
        </Card.CardContent>
      </Card.Card>
    </aside>
  </div>
</div>
