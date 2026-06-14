<script lang="ts">
  import { useList } from '@svadmin/core';
  import { getLocale } from '@svadmin/core/i18n';
  import { AutoTable, Badge, Button } from '@svadmin/ui';
  import * as Card from '@svadmin/ui/components/ui/card/index.js';
  import { BarChart3, Bot, CalendarDays, CheckCircle2, Circle, Flag, ListTodo, Tag } from '@lucide/svelte';

  interface Todo {
    id: number;
    title: string;
    priority: string;
    status: string;
    dueDate: string;
    completed: boolean;
    notes: string;
  }

  let { resourceName = 'todos' } = $props<{ resourceName?: string }>();

  const locale = $derived(getLocale());
  const isZh = $derived(locale === 'zh-CN');
  const query = useList({ resource: 'todos', pagination: { mode: 'off' }, sorters: [{ field: 'dueDate', order: 'asc' }] });
  const todos = $derived((query.data?.data ?? []) as unknown as Todo[]);
  const lanes = $derived([
    { key: 'open', title: isZh ? '待开始' : 'Open' },
    { key: 'in_progress', title: isZh ? '进行中' : 'In Progress' },
    { key: 'blocked', title: isZh ? '阻塞' : 'Blocked' },
    { key: 'done', title: isZh ? '已完成' : 'Done' },
  ]);
  const completedCount = $derived(todos.filter((todo) => todo.completed).length);
  const highPriorityCount = $derived(todos.filter((todo) => todo.priority === 'high').length);
  const progress = $derived(todos.length ? Math.round(completedCount / todos.length * 100) : 0);
  const priorityGroups = $derived(['high', 'medium', 'low'].map((priority) => ({
    priority,
    count: todos.filter((todo) => todo.priority === priority).length,
  })));
  const todayTasks = $derived(todos.filter((todo) => todo.dueDate <= '2026-06-14' && !todo.completed).length);
  const upcomingTasks = $derived(todos.filter((todo) => todo.dueDate > '2026-06-14' && !todo.completed).length);
  const taskLists = $derived([
    { label: isZh ? '全部任务' : 'All Tasks', count: todos.length, Icon: ListTodo },
    { label: isZh ? '今日' : 'Today', count: todayTasks, Icon: CalendarDays },
    { label: isZh ? '即将到来' : 'Upcoming', count: upcomingTasks, Icon: CalendarDays },
    { label: isZh ? '优先级' : 'Priority', count: highPriorityCount, Icon: Flag },
    { label: isZh ? '已完成' : 'Completed', count: completedCount, Icon: CheckCircle2 },
  ]);
  const tags = $derived([
    { label: isZh ? '工作' : 'Work', count: todos.length },
    { label: isZh ? '个人' : 'Personal', count: 1 },
    { label: isZh ? '团队' : 'Team', count: usersFallback(todos.length) },
    { label: isZh ? '目标' : 'Goals', count: highPriorityCount },
  ]);

  function usersFallback(count: number): number {
    return Math.max(1, count - 1);
  }

  function priorityLabel(priority: string): string {
    if (!isZh) return priority;
    if (priority === 'high') return '高';
    if (priority === 'medium') return '中';
    if (priority === 'low') return '低';
    return priority;
  }
</script>

<div class="space-y-6" data-app-page="todo-workspace">
  <section class="grid gap-4 lg:grid-cols-[1fr_0.78fr_0.78fr]">
    <Card.Root class="overflow-hidden border-primary/20">
      <Card.Header class="border-b">
        <Badge>{isZh ? '全部任务' : 'All Tasks'}</Badge>
        <Card.Title class="mt-3 flex items-center gap-2 text-2xl"><ListTodo class="h-6 w-6 text-primary" />{isZh ? '每日执行进度' : 'Daily Execution Progress'}</Card.Title>
        <Card.Description>{isZh ? '汇总所有任务、优先级和阻塞状态，适合班前会快速巡检。' : 'Summarize all tasks, priorities, and blockers for a fast standup review.'}</Card.Description>
      </Card.Header>
      <Card.Content class="space-y-4 p-5">
        <div class="flex items-end justify-between gap-4"><p class="text-4xl font-semibold">{progress}%</p><p class="text-sm text-muted-foreground">{completedCount}/{todos.length} {isZh ? '已完成' : 'completed'}</p></div>
        <div class="h-2 rounded-full bg-muted"><div class="h-2 rounded-full bg-primary" style:width={`${progress}%`}></div></div>
      </Card.Content>
    </Card.Root>
    <Card.Root><Card.Content class="p-5"><Flag class="h-5 w-5 text-primary" /><p class="mt-3 text-sm text-muted-foreground">{isZh ? '高优先级' : 'High Priority'}</p><p class="mt-1 text-3xl font-semibold">{highPriorityCount}</p><p class="mt-1 text-xs text-muted-foreground">{isZh ? '个任务需要当天处理' : 'tasks need same-day attention'}</p></Card.Content></Card.Root>
    <Card.Root><Card.Content class="p-5"><BarChart3 class="h-5 w-5 text-primary" /><p class="mt-3 text-sm text-muted-foreground">{isZh ? '优先级分布' : 'Priority Mix'}</p><div class="mt-4 space-y-2">{#each priorityGroups as group (group.priority)}<div class="flex items-center justify-between text-sm"><span>{priorityLabel(group.priority)}</span><Badge variant="outline">{group.count}</Badge></div>{/each}</div></Card.Content></Card.Root>
  </section>

  <section class="grid gap-4 xl:grid-cols-[0.72fr_1.28fr_0.72fr]">
    <Card.Root>
      <Card.Header class="border-b">
        <Card.Title class="flex items-center gap-2 text-base"><ListTodo class="h-5 w-5 text-primary" />{isZh ? '待办列表' : 'Todo Lists'}</Card.Title>
        <Card.Description>{isZh ? '按清单、标签和优先级组织每日作业。' : 'Organize daily work by list, tag, and priority.'}</Card.Description>
      </Card.Header>
      <Card.Content class="space-y-2 p-3">
        {#each taskLists as list (list.label)}
          <button class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-muted/45">
            <span class="flex items-center gap-2"><list.Icon class="h-4 w-4 text-muted-foreground" />{list.label}</span>
            <Badge variant="outline">{list.count}</Badge>
          </button>
        {/each}
        <div class="my-3 border-t"></div>
        <p class="px-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{isZh ? '标签' : 'Tags'}</p>
        {#each tags as tag (tag.label)}
          <button class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-muted/45">
            <span class="flex items-center gap-2"><Tag class="h-4 w-4 text-muted-foreground" />{tag.label}</span>
            <Badge variant="outline">{tag.count}</Badge>
          </button>
        {/each}
      </Card.Content>
    </Card.Root>

    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {#each lanes as lane (lane.key)}
        <Card.Root class="overflow-hidden">
          <Card.Header class="border-b px-4 py-3"><Card.Title class="text-sm">{lane.title}</Card.Title></Card.Header>
          <Card.Content class="space-y-3 p-3">
            {#each todos.filter((todo) => todo.status === lane.key || (lane.key === 'done' && todo.completed)) as todo (todo.id)}
              <article class="rounded-xl border bg-card p-3 shadow-sm">
                <div class="flex items-start gap-2">
                  {#if todo.completed}<CheckCircle2 class="mt-0.5 h-4 w-4 text-success" />{:else}<Circle class="mt-0.5 h-4 w-4 text-muted-foreground" />{/if}
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-semibold">{todo.title}</p>
                    <p class="mt-1 line-clamp-2 text-xs text-muted-foreground">{todo.notes}</p>
                    <div class="mt-3 flex items-center justify-between gap-2"><Badge variant="outline">{priorityLabel(todo.priority)}</Badge><span class="text-xs text-primary">{todo.dueDate}</span></div>
                  </div>
                </div>
              </article>
            {/each}
          </Card.Content>
        </Card.Root>
      {/each}
    </div>

    <Card.Root class="overflow-hidden border-primary/20">
      <Card.Header class="border-b"><Card.Title class="flex items-center gap-2 text-base"><Bot class="h-5 w-5 text-primary" />{isZh ? '任务助手' : 'Task Assistant'}</Card.Title></Card.Header>
      <Card.Content class="space-y-4 p-4">
        <div class="rounded-2xl border bg-background p-4">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{isZh ? '专注进度' : 'Focus progress'}</p>
          <div class="mt-3 flex items-end justify-between gap-3">
            <p class="text-2xl font-semibold">{completedCount + highPriorityCount} / {todos.length + highPriorityCount}</p>
            <Badge variant="outline">{isZh ? '今日节奏' : 'today pace'}</Badge>
          </div>
          <div class="mt-3 h-2 rounded-full bg-muted"><div class="h-2 rounded-full bg-primary" style:width={`${Math.min(100, progress + 18)}%`}></div></div>
        </div>
        <p class="rounded-2xl rounded-tl-sm border bg-muted/25 p-4 text-sm text-muted-foreground">{isZh ? '建议先处理高优先级库存告警，再确认供应商到货窗口。' : 'Start with high-priority stock alerts, then confirm supplier delivery windows.'}</p>
        <Button class="w-full">{isZh ? '生成今日计划' : 'Generate day plan'}</Button>
      </Card.Content>
    </Card.Root>
  </section>

  <AutoTable {resourceName} />
</div>
