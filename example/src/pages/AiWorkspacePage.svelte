<script lang="ts">
  import { useList } from '@svadmin/core';
  import { getLocale } from '@svadmin/core/i18n';
  import { AutoTable, Badge, Button } from '@svadmin/ui';
  import * as Card from '@svadmin/ui/components/ui/card/index.js';
  import { Bot, Boxes, BrainCircuit, BriefcaseBusiness, Code2, GraduationCap, Heart, History, MessageSquare, Palette, Pin, Send, Settings, Share2, Sparkles, Trash2 } from '@lucide/svelte';

  interface Conversation {
    id: number;
    title: string;
    intent: string;
    status: string;
    lastMessage: string;
    updatedAt: string;
  }

  let { resourceName = 'ai_conversations' } = $props<{ resourceName?: string }>();

  const locale = $derived(getLocale());
  const isZh = $derived(locale === 'zh-CN');
  const query = useList({ resource: 'ai_conversations', pagination: { mode: 'off' }, sorters: [{ field: 'updatedAt', order: 'desc' }] });
  const conversations = $derived((query.data?.data ?? []) as unknown as Conversation[]);
  const active = $derived(conversations[0]);
  const openCount = $derived(conversations.filter((item) => item.status !== 'resolved').length);
  const resolvedCount = $derived(conversations.filter((item) => item.status === 'resolved').length);
  const waitingCount = $derived(conversations.filter((item) => item.status === 'waiting').length);

  const prompts = $derived([
    isZh ? '汇总低库存和补货动作' : 'Summarize low-stock actions',
    isZh ? '解释今日盘点风险' : 'Explain today count risk',
    isZh ? '生成供应商跟进邮件' : 'Draft supplier follow-up',
    isZh ? '检查本周运营异常' : 'Check weekly exceptions',
  ]);
  const templates = $derived([
    {
      key: 'developer',
      title: isZh ? '开发者' : 'Developer',
      description: isZh ? '生成数据 provider 调试清单、接口契约和异常复现步骤。' : 'Generate provider diagnostics, API contracts, and repro steps.',
      Icon: Code2,
    },
    {
      key: 'business',
      title: isZh ? '业务' : 'Business',
      description: isZh ? '把库存、订单、客户和待办汇总成可执行的日会简报。' : 'Turn inventory, orders, customers, and tasks into an actionable standup brief.',
      Icon: BriefcaseBusiness,
    },
    {
      key: 'educator',
      title: isZh ? '培训' : 'Educator',
      description: isZh ? '为新成员生成操作路径、字段解释和演练问题。' : 'Create onboarding flows, field explanations, and practice questions.',
      Icon: GraduationCap,
    },
    {
      key: 'creative',
      title: isZh ? '创意' : 'Creative',
      description: isZh ? '改写客户通知、邮件草稿和页面空状态文案。' : 'Rewrite customer notices, mail drafts, and empty-state copy.',
      Icon: Palette,
    },
  ]);
  const threadStats = $derived([
    {
      label: isZh ? '会话' : 'Threads',
      value: conversations.length,
      hint: isZh ? `${openCount} 个活跃对话` : `${openCount} active chats`,
    },
    {
      label: isZh ? '已解决' : 'Resolved',
      value: resolvedCount,
      hint: isZh ? '已关闭答案' : 'closed answers',
    },
    {
      label: isZh ? '等待中' : 'Waiting',
      value: waitingCount,
      hint: isZh ? '需要更多上下文' : 'needs context',
    },
  ]);
  const promptFocus = $derived([
    {
      label: isZh ? '补货' : 'Replenishment',
      value: conversations.filter((item) => item.intent === 'replenishment').length,
      hint: isZh ? '库存提示词' : 'inventory prompts',
    },
    {
      label: isZh ? '预测' : 'Forecast',
      value: conversations.filter((item) => item.intent === 'forecast').length,
      hint: isZh ? '计划提示词' : 'planning prompts',
    },
    {
      label: isZh ? '知识库' : 'Policy',
      value: conversations.filter((item) => item.intent === 'policy_help' || item.intent === 'exception_review').length,
      hint: isZh ? '知识与异常复核' : 'knowledge and exception review',
    },
  ]);
  const modelChoices = $derived([
    { name: 'svadmin local', active: true, hint: isZh ? '本地只读数据' : 'local read-only data' },
    { name: isZh ? '运营推理' : 'Operations reasoning', active: false, hint: isZh ? '可替换 provider' : 'swappable provider' },
    { name: isZh ? '知识库问答' : 'Knowledge Q&A', active: false, hint: isZh ? '示例路由' : 'demo route' },
  ]);
  const pinnedThreads = $derived(conversations.slice(0, 1).map((thread) => ({
    ...thread,
    meta: isZh ? '10 条消息' : '10 msgs',
  })));
  const recentThreads = $derived(conversations.slice(1, 4));
  const quickActions = $derived([
    { label: isZh ? '收藏' : 'Favorites', value: 2, Icon: Heart },
    { label: isZh ? '清空历史' : 'Clear History', value: isZh ? '安全确认' : 'confirm', Icon: Trash2 },
    { label: isZh ? '聊天历史' : 'Chat History', value: conversations.length, Icon: History },
    { label: isZh ? 'AI 设置' : 'AI Settings', value: isZh ? '本地' : 'local', Icon: Settings },
  ]);

  function statusLabel(status: string): string {
    if (!isZh) return status;
    if (status === 'open') return '进行中';
    if (status === 'waiting') return '等待上下文';
    if (status === 'resolved') return '已解决';
    return status;
  }

  function intentLabel(intent: string): string {
    if (!isZh) return intent;
    if (intent === 'replenishment') return '补货';
    if (intent === 'forecast') return '预测';
    if (intent === 'exception_review') return '异常复核';
    if (intent === 'policy_help') return '策略问答';
    return intent;
  }
</script>

<div class="space-y-6" data-app-page="ai-workspace">
  <section class="rounded-2xl border bg-card p-5 shadow-sm">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Badge>{isZh ? '智能助手' : 'AI Assistant'}</Badge>
        <h2 class="mt-3 flex items-center gap-2 text-2xl font-semibold text-foreground">
          <BrainCircuit class="h-6 w-6 text-primary" />
          {isZh ? 'AI 助手工作区' : 'AI Workspace'}
        </h2>
        <p class="mt-2 text-sm text-muted-foreground">
          {isZh ? '查看助手对话、运营提示词、模板和模型路由示例。' : 'Review assistant conversations, operations prompts, templates, and model routing examples.'}
        </p>
      </div>
      <Button><Sparkles class="mr-2 h-4 w-4" />{isZh ? '新建对话' : 'New chat'}</Button>
    </div>
  </section>

  <section class="grid gap-3 md:grid-cols-3">
    {#each threadStats as stat (stat.label)}
      <Card.Root>
        <Card.Content class="p-5">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{stat.label}</p>
          <p class="mt-2 text-3xl font-semibold">{stat.value}</p>
          <p class="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
        </Card.Content>
      </Card.Root>
    {/each}
  </section>

  <section class="grid gap-4 xl:grid-cols-[0.82fr_1.18fr_0.72fr]">
    <Card.Root class="overflow-hidden">
      <Card.Header class="border-b">
        <Card.Title class="flex items-center gap-2 text-base"><Bot class="h-5 w-5 text-primary" />{isZh ? 'AI 对话' : 'AI Chat'}</Card.Title>
        <Card.Description>{isZh ? '按意图、状态和最近更新时间管理运营助手会话。' : 'Manage assistant threads by intent, status, and recency.'}</Card.Description>
      </Card.Header>
      <Card.Content class="p-0">
        <div class="border-b bg-muted/20 p-4">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{isZh ? '模型' : 'AI Model'}</p>
          <div class="mt-3 grid gap-2">
            {#each modelChoices as model (model.name)}
              <button class="flex items-center justify-between rounded-xl border bg-card px-3 py-2 text-left text-sm transition hover:border-primary/40">
                <span>
                  <span class="block font-medium">{model.name}</span>
                  <span class="text-xs text-muted-foreground">{model.hint}</span>
                </span>
                {#if model.active}<Badge>{isZh ? '当前' : 'Active'}</Badge>{/if}
              </button>
            {/each}
          </div>
        </div>
        <div class="border-b p-4">
          <p class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"><Pin class="h-3.5 w-3.5" />{isZh ? '置顶' : 'Pinned'}</p>
          {#each pinnedThreads as thread (thread.id)}
            <div class="mt-3 rounded-xl border bg-primary/5 p-3">
              <p class="truncate text-sm font-semibold">{thread.title}</p>
              <p class="mt-1 text-xs text-muted-foreground">{thread.meta}</p>
            </div>
          {/each}
        </div>
        <div class="border-b p-4">
          <p class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"><History class="h-3.5 w-3.5" />{isZh ? '最近' : 'Recent'}</p>
          <div class="mt-3 space-y-2">
            {#each recentThreads as thread (thread.id)}
              <p class="truncate rounded-lg bg-muted/30 px-3 py-2 text-xs text-muted-foreground">{thread.title}</p>
            {/each}
          </div>
        </div>
        <div class="divide-y">
          {#each conversations as thread (thread.id)}
            <button class="block w-full px-4 py-3 text-left transition hover:bg-muted/45">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold">{thread.title}</p>
                  <p class="mt-1 truncate text-xs text-muted-foreground">{thread.lastMessage}</p>
                </div>
                <Badge variant="outline">{statusLabel(thread.status)}</Badge>
              </div>
              <p class="mt-2 text-xs text-primary">{intentLabel(thread.intent)} · {thread.updatedAt}</p>
            </button>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>

    <Card.Root class="overflow-hidden border-primary/25 bg-gradient-to-br from-primary/8 via-card to-card">
      <Card.Header class="border-b">
        <div class="flex items-center justify-between gap-3">
          <div>
            <Badge>{isZh ? '智能工作台' : 'AI Workspace'}</Badge>
            <Card.Title class="mt-3 text-2xl">{isZh ? '用本地运营数据发起一次分析' : 'Start an analysis from local operations data'}</Card.Title>
            <Card.Description class="mt-2">{isZh ? '示例助手只读取本地 mock 数据，不需要外部密钥。' : 'The demo assistant reads local mock data only and requires no external key.'}</Card.Description>
          </div>
          <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Sparkles class="h-6 w-6" /></span>
        </div>
      </Card.Header>
      <Card.Content class="space-y-4 p-5">
        <div class="rounded-2xl rounded-tl-sm border bg-background p-4 shadow-sm">
          <p class="text-sm font-semibold">{isZh ? '助手' : 'Assistant'}</p>
          <p class="mt-2 text-sm text-muted-foreground">
            {active?.lastMessage ?? (isZh ? '选择一个模板，我会把库存、待办、日历和通知串起来回答。' : 'Pick a template and I will connect inventory, todos, calendar, and notifications.')}
          </p>
        </div>
        <div class="grid gap-2 sm:grid-cols-2">
          {#each prompts as prompt (prompt)}
            <button class="rounded-xl border bg-card px-3 py-2 text-left text-sm transition hover:border-primary/50 hover:bg-primary/5">{prompt}</button>
          {/each}
        </div>
        <div class="flex flex-col gap-2 rounded-2xl border bg-background p-2 sm:flex-row">
          <div class="min-h-11 flex-1 rounded-xl bg-muted/35 px-4 py-3 text-sm text-muted-foreground">
            {isZh ? '输入一个运营问题，例如：哪些商品需要补货？' : 'Ask an operations question, for example: what needs replenishment?'}
          </div>
          <Button><Send class="mr-2 h-4 w-4" />{isZh ? '发送' : 'Send'}</Button>
        </div>
      </Card.Content>
    </Card.Root>

    <div class="grid gap-4">
      <Card.Root>
        <Card.Content class="p-5">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{isZh ? '模型路由' : 'Model route'}</p>
          <p class="mt-2 text-2xl font-semibold">svadmin local</p>
          <p class="mt-1 text-xs text-muted-foreground">{isZh ? '只读、安全、可替换 provider' : 'read-only, safe, swappable provider'}</p>
        </Card.Content>
      </Card.Root>
      <Card.Root>
        <Card.Content class="grid gap-3 p-5">
          <div class="flex items-center justify-between"><span class="flex items-center gap-2 text-sm"><MessageSquare class="h-4 w-4" />{isZh ? '开放对话' : 'Open threads'}</span><Badge>{openCount}</Badge></div>
          <div class="flex items-center justify-between"><span class="flex items-center gap-2 text-sm"><Boxes class="h-4 w-4" />{isZh ? '数据域' : 'Data domains'}</span><Badge variant="outline">6</Badge></div>
          <div class="flex items-center justify-between"><span class="flex items-center gap-2 text-sm"><BrainCircuit class="h-4 w-4" />{isZh ? '模板' : 'Templates'}</span><Badge variant="outline">{templates.length}</Badge></div>
        </Card.Content>
      </Card.Root>
      <Card.Root>
        <Card.Header class="pb-3">
          <Card.Title class="text-base">{isZh ? '快捷动作' : 'Quick Actions'}</Card.Title>
        </Card.Header>
        <Card.Content class="grid gap-2">
          {#each quickActions as action (action.label)}
            <button class="flex items-center justify-between rounded-xl border bg-card px-3 py-2 text-left text-sm transition hover:border-primary/40">
              <span class="flex items-center gap-2"><action.Icon class="h-4 w-4 text-muted-foreground" />{action.label}</span>
              <Badge variant="outline">{action.value}</Badge>
            </button>
          {/each}
          <Button variant="outline" class="mt-2 w-full"><Share2 class="mr-2 h-4 w-4" />{isZh ? '分享对话' : 'Share Chat'}</Button>
        </Card.Content>
      </Card.Root>
    </div>
  </section>

  <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    {#each templates as template (template.key)}
      <Card.Root class="overflow-hidden">
        <Card.Content class="space-y-4 p-5">
          <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><template.Icon class="h-5 w-5" /></span>
          <div>
            <h2 class="text-base font-semibold">{template.title}</h2>
            <p class="mt-2 text-sm leading-6 text-muted-foreground">{template.description}</p>
          </div>
          <Button variant="outline" class="w-full">{isZh ? '使用模板' : 'Use template'}</Button>
        </Card.Content>
      </Card.Root>
    {/each}
  </section>

  <section class="grid gap-4 lg:grid-cols-[0.78fr_1.22fr]">
    <Card.Root>
      <Card.Header>
        <Card.Title class="text-base">{isZh ? '提示词关注' : 'Prompt Focus'}</Card.Title>
        <Card.Description>{isZh ? '按补货、预测、知识库复核助手会话的用途。' : 'Review assistant usage across replenishment, forecast, and policy prompts.'}</Card.Description>
      </Card.Header>
      <Card.Content class="space-y-3">
        {#each promptFocus as item (item.label)}
          <div class="rounded-xl border bg-card p-3">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-sm font-semibold">{item.label}</p>
                <p class="mt-1 text-xs text-muted-foreground">{item.hint}</p>
              </div>
              <Badge variant="outline">{item.value}</Badge>
            </div>
          </div>
        {/each}
      </Card.Content>
    </Card.Root>
    <Card.Root class="overflow-hidden">
      <Card.Header class="border-b">
        <Card.Title class="text-base">{isZh ? 'AI 对话记录' : 'AI Conversation Records'}</Card.Title>
        <Card.Description>{isZh ? '下方表格保留标准 svadmin 列、排序、导出和新建能力。' : 'The table below keeps svadmin columns, sorting, export, and create actions.'}</Card.Description>
      </Card.Header>
      <Card.Content class="p-0">
        <div class="divide-y">
          {#each conversations as thread (thread.id)}
            <div class="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto_auto] md:items-center">
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold">{thread.title}</p>
                <p class="mt-1 truncate text-xs text-muted-foreground">{thread.lastMessage}</p>
              </div>
              <Badge variant="outline">{intentLabel(thread.intent)}</Badge>
              <span class="text-xs text-muted-foreground">{thread.updatedAt}</span>
            </div>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>
  </section>

  <AutoTable {resourceName} />
</div>
