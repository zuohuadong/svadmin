<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import * as Card from '../ui/card/index.js';
  import { Badge } from '../ui/badge/index.js';
  import { Button } from '../ui/button/index.js';
  import { Input } from '../ui/input/index.js';
  import { ArrowRight, CalendarDays, CheckCircle2, Search, SlidersHorizontal, Users } from '@lucide/svelte';

  interface ProjectMember {
    name: string;
  }

  interface Project {
    id: string;
    name: string;
    description: string;
    members: number;
    tasks: number;
    status: 'active' | 'completed' | 'on-hold';
    tags?: string[];
    image?: string;
    progress?: number;
    dueDate?: string;
    priority?: 'High' | 'Medium' | 'Low';
    memberList?: ProjectMember[];
  }

  interface Props {
    columns?: 2 | 3;
    projects?: Project[];
  }

  let { columns = 2, projects = [] }: Props = $props();
  let searchQuery = $state('');
  let statusFilter = $state<'all' | Project['status']>('all');

  const statusConfig = {
    active: { color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20', label: 'Active' },
    completed: { color: 'bg-blue-500/10 text-blue-700 border-blue-500/20', label: 'Completed' },
    'on-hold': { color: 'bg-amber-500/10 text-amber-700 border-amber-500/20', label: 'On Hold' },
  };

  const priorityConfig = {
    High: 'text-red-700 bg-red-500/10',
    Medium: 'text-sky-700 bg-sky-500/10',
    Low: 'text-slate-700 bg-slate-500/10',
  };

  const gridCols = $derived(columns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2');
  const filteredProjects = $derived.by(() => {
    const query = searchQuery.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesQuery = !query
        || project.name.toLowerCase().includes(query)
        || project.description.toLowerCase().includes(query)
        || project.tags?.some((tag) => tag.toLowerCase().includes(query));
      return matchesStatus && matchesQuery;
    });
  });

  function initials(name: string): string {
    return name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2);
  }
</script>

<div class="space-y-4">
  <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <div>
      <h3 class="text-lg font-semibold text-foreground">
        {columns === 2 ? t('publicProfile.projects2Col') : t('publicProfile.projects3Col')}
      </h3>
      <p class="mt-1 text-sm text-muted-foreground">Portfolio health, delivery progress, and ownership coverage.</p>
    </div>
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div class="relative min-w-56">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input class="h-9 pl-9" bind:value={searchQuery} placeholder={t('common.search')} />
      </div>
      <div class="flex overflow-hidden rounded-lg border border-border bg-background">
        {#each ['all', 'active', 'completed', 'on-hold'] as status (status)}
          <button
            class="h-9 px-3 text-xs font-medium transition-colors {statusFilter === status ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}"
            onclick={() => statusFilter = status as typeof statusFilter}
          >
            {status === 'all' ? 'All' : statusConfig[status as Project['status']].label}
          </button>
        {/each}
      </div>
    </div>
  </div>

  {#if filteredProjects.length === 0}
    <div class="rounded-xl border border-dashed border-border/70 bg-muted/20 p-8 text-center">
      <p class="text-sm text-muted-foreground">{t('publicProfile.noProjects')}</p>
    </div>
  {:else}
    <div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2 {gridCols}">
      {#each filteredProjects as project (project.id)}
        {@const progress = project.progress ?? 0}
        <Card.Card class="group overflow-hidden border-border/70 bg-card transition-colors hover:border-primary/35">
          <Card.CardContent class="space-y-4 p-5">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 space-y-1">
                <div class="flex flex-wrap items-center gap-2">
                  <h4 class="truncate font-semibold text-foreground">{project.name}</h4>
                  {#if project.priority}
                    <span class="rounded-full px-2 py-0.5 text-[10px] font-semibold {priorityConfig[project.priority]}">{project.priority}</span>
                  {/if}
                </div>
                <p class="line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
              </div>
              <span class="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold {statusConfig[project.status].color}">
                {statusConfig[project.status].label}
              </span>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="font-medium text-foreground">Delivery</span>
                <span class="font-mono text-muted-foreground">{progress}%</span>
              </div>
              <div class="h-2 overflow-hidden rounded-full bg-muted">
                <div class="h-full rounded-full bg-primary transition-all duration-300" style="width: {progress}%"></div>
              </div>
            </div>

            {#if project.tags && project.tags.length > 0}
              <div class="flex flex-wrap gap-1">
                {#each project.tags as tag (tag)}
                  <Badge variant="outline" class="text-[10px]">{tag}</Badge>
                {/each}
              </div>
            {/if}

            <div class="grid gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground sm:grid-cols-3">
              <span class="flex items-center gap-1.5"><Users class="h-3.5 w-3.5" />{t('publicProfile.projectMembers', { count: project.members })}</span>
              <span class="flex items-center gap-1.5"><CheckCircle2 class="h-3.5 w-3.5" />{t('publicProfile.projectTasks', { count: project.tasks })}</span>
              <span class="flex items-center gap-1.5"><CalendarDays class="h-3.5 w-3.5" />{project.dueDate ?? 'Open'}</span>
            </div>

            <div class="flex items-center justify-between gap-3 border-t border-border/70 pt-3">
              <div class="flex -space-x-2">
                {#each (project.memberList ?? []).slice(0, 4) as member (member.name)}
                  <span class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-primary/10 text-[10px] font-semibold text-primary">
                    {initials(member.name)}
                  </span>
                {/each}
                {#if project.members > (project.memberList?.length ?? 0)}
                  <span class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-semibold text-muted-foreground">
                    +{project.members - (project.memberList?.length ?? 0)}
                  </span>
                {/if}
              </div>
              <div class="flex items-center gap-1">
                <Button variant="ghost" size="icon-sm" aria-label="Filter project">
                  <SlidersHorizontal class="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon-sm" aria-label="Open project">
                  <ArrowRight class="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card.CardContent>
        </Card.Card>
      {/each}
    </div>
  {/if}
</div>
