<script lang="ts">
  import { getLocale } from '@svadmin/core/i18n';
  import { useList, useCreate, useUpdate, getChatProvider } from '@svadmin/core';
  import type { ChatMessage } from '@svadmin/core';
  import { AutoTable, Badge, Button, Input } from '@svadmin/ui';
  import * as Card from '@svadmin/ui/components/ui/card/index.js';
  import { Bot, Send, Plus, Search, Sparkles, RefreshCw, ChevronRight } from '@lucide/svelte';

  interface AiConversationRecord {
    id?: string | number;
    title?: string;
    intent?: string;
    status?: string;
    lastMessage?: string;
    updatedAt?: string;
  }

  let { resourceName = 'ai_conversations' } = $props<{ resourceName?: string }>();

  const locale = $derived(getLocale());
  const tr = (en: string, zh: string) => locale === 'zh-CN' ? zh : en;

  // Query database records for session history
  const listQuery = useList({
    get resource() { return resourceName; },
    pagination: { mode: 'off' }
  });
  const records = $derived((listQuery.data?.data ?? []) as unknown as AiConversationRecord[]);

  // Mutations to keep chat in sync with DB
  const createMutation = useCreate();
  const updateMutation = useUpdate();

  // Filters & State
  let searchText = $state('');
  let selectedIntent = $state('all');
  let selectedStatus = $state('all');
  let selectedSessionId = $state<string | number | null>(null);
  let messageInput = $state('');
  let isStreaming = $state(false);

  // Chat message history
  let chatMessages = $state<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: tr(
        'Hello! I am the SVAdmin intelligent inventory operator. Ask me about low stock alerts, stock transfers, cycle counts, or auto-replenishment rules.',
        '您好！我是 SVAdmin 智能库存运营助手。我可以协助您分析低库存商品、校对盘点差异、查询调拨单或管理补货规则。请问有什么我可以帮您的？'
      ),
      timestamp: Date.now()
    }
  ]);

  // Map intents to localized strings
  const intentLabels: Record<string, string> = {
    replenishment: tr('Replenishment', '自动补货'),
    forecast: tr('Forecast', '采购预测'),
    exception_review: tr('Exception Review', '盘点核销'),
    policy_help: tr('Policy Help', '规则指南')
  };

  // Map statuses to localized strings
  const statusLabels: Record<string, string> = {
    open: tr('Open', '进行中'),
    waiting: tr('Waiting', '挂起中'),
    resolved: tr('Resolved', '已解决')
  };

  function getIntentLabel(intent?: string): string {
    return intent ? (intentLabels[intent] ?? intent) : tr('Unknown', '未知');
  }

  function getStatusLabel(status?: string): string {
    return status ? (statusLabels[status] ?? status) : tr('Unknown', '未知');
  }

  function getRecordKey(item: AiConversationRecord): string {
    return String(item.id ?? `${item.title ?? 'conversation'}-${item.updatedAt ?? 'draft'}`);
  }

  const filteredRecords = $derived.by(() => {
    return records.filter((r) => {
      const matchesIntent = selectedIntent === 'all' || r.intent === selectedIntent;
      const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
      const matchesSearch = !searchText || 
        r.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        r.lastMessage?.toLowerCase().includes(searchText.toLowerCase());
      return matchesIntent && matchesStatus && matchesSearch;
    });
  });

  function selectSession(id: string | number | undefined) {
    if (id === undefined) return;
    selectedSessionId = id;
    const session = records.find((r) => String(r.id) === String(id));
    if (session) {
      chatMessages = [
        {
          id: `msg-load-${Date.now()}-1`,
          role: 'assistant',
          content: tr(
            `Session loaded: [${getIntentLabel(session.intent)}]`,
            `已加载会话类别: [${getIntentLabel(session.intent)}]`
          ),
          timestamp: Date.now() - 2000
        }
      ];
      if (session.lastMessage) {
        chatMessages.push({
          id: `msg-load-${Date.now()}-2`,
          role: 'user',
          content: tr(`Retrieve context for: ${session.title}`, `检索关于“${session.title}”的会话上下文。`),
          timestamp: Date.now() - 1000
        });
        chatMessages.push({
          id: `msg-load-${Date.now()}-3`,
          role: 'assistant',
          content: session.lastMessage,
          timestamp: Date.now()
        });
      }
    }
  }

  function startNewSession() {
    selectedSessionId = null;
    chatMessages = [
      {
        id: `msg-new-${Date.now()}`,
        role: 'assistant',
        content: tr(
          'Started a new intelligent workspace thread. What inventory operation should we perform?',
          '已开启全新智能工作台线程。我们可以针对商品低库存、调拨或采购预测等进行问答式分析。'
        ),
        timestamp: Date.now()
      }
    ];
  }

  function guessIntent(text: string): string {
    const norm = text.toLowerCase();
    if (norm.includes('补') || norm.includes('库存') || norm.includes('stock') || norm.includes('min') || norm.includes('low')) return 'replenishment';
    if (norm.includes('盘') || norm.includes('差异') || norm.includes('count') || norm.includes('variance') || norm.includes('核销')) return 'exception_review';
    if (norm.includes('采') || norm.includes('预测') || norm.includes('销') || norm.includes('forecast') || norm.includes('plan')) return 'forecast';
    return 'policy_help';
  }

  async function handleSendMessage(text: string) {
    if (!text.trim() || isStreaming) return;
    const userText = text.trim();
    messageInput = '';

    chatMessages = [
      ...chatMessages,
      { id: `msg-user-${Date.now()}`, role: 'user', content: userText, timestamp: Date.now() }
    ];
    isStreaming = true;

    try {
      const provider = getChatProvider();
      let reply = '';
      if (provider) {
        const response = await provider.sendMessage(chatMessages);
        if (typeof response === 'string') {
          reply = response;
        } else {
          for await (const chunk of response) {
            reply += chunk;
          }
        }
      } else {
        reply = tr(
          'Intelligent inventory provider is connecting. Here is a mocked response reflecting the status.',
          '智能助手提供商未就绪。请确认在右下角悬浮窗或控制台启动了本地 Mock 服务。'
        );
      }

      chatMessages = [
        ...chatMessages,
        { id: `msg-assistant-${Date.now()}`, role: 'assistant', content: reply, timestamp: Date.now() }
      ];

      // Update in db
      if (selectedSessionId) {
        updateMutation.mutation.mutate({
          resource: resourceName,
          id: selectedSessionId,
          variables: {
            lastMessage: reply,
            updatedAt: new Date().toISOString()
          }
        });
      } else {
        // Create new session record
        createMutation.mutation.mutate({
          resource: resourceName,
          variables: {
            title: userText.length > 20 ? userText.slice(0, 20) + '...' : userText,
            intent: guessIntent(userText),
            status: 'open',
            lastMessage: reply,
            updatedAt: new Date().toISOString()
          }
        }, {
          onSuccess: (result: unknown) => {
            const created = result as { data?: { id?: string | number } };
            if (created.data?.id) {
              selectedSessionId = created.data.id;
            }
          }
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : tr('Unknown error', '未知错误');
      chatMessages = [
        ...chatMessages,
        {
          id: `msg-error-${Date.now()}`,
          role: 'assistant',
          content: tr(
            `The local assistant could not complete this request: ${message}`,
            `本地助手暂时无法完成本次请求：${message}`
          ),
          timestamp: Date.now()
        }
      ];
    } finally {
      isStreaming = false;
    }
  }

  const recommendedPrompts = [
    {
      text: tr('Show products below minimum stock threshold', '有哪些商品处于低库存状态？'),
      intent: 'replenishment'
    },
    {
      text: tr('Check active cycle counts and their variance status', '显示当前需要审批的库存盘点与差异'),
      intent: 'exception_review'
    },
    {
      text: tr('Check upcoming calendar events for receiving schedule', '查询本周的采购及收货日程计划'),
      intent: 'forecast'
    },
    {
      text: tr('How to define reorder rules and lead times?', '如何配置自动补货与前置期规则？'),
      intent: 'policy_help'
    }
  ];
</script>

<div class="space-y-6">
  <!-- Top Cockpit Section -->
  <section class="overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-sm shadow-slate-900/[0.03]">
    <div class="relative p-6 sm:p-8">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.08),transparent_24rem)]"></div>
      <div class="relative max-w-4xl">
        <Badge class="mb-4 rounded-full bg-primary/10 text-primary hover:bg-primary/10">{tr('AI Intelligence Desk', '智能工作台')}</Badge>
        <h1 class="text-3xl font-semibold tracking-tight text-foreground">{tr('Intelligent Inventory Workspace', '智能库存运营中心')}</h1>
        <p class="mt-2 text-sm text-muted-foreground">
          {tr('Analyze stock discrepancies, plan warehouse transfers, draft purchase orders, or consult business rules using local database context.', '通过集成 MCP 仓库系统的智能助手，实时检索低库存告警、调拨方案、盘点状态并直接校准异常记录。')}
        </p>
      </div>
    </div>
  </section>

  <!-- Interactive Workspace Grid -->
  <div class="grid gap-4 xl:grid-cols-[300px_1fr]">
    
    <!-- Left Pane: Session History & Filter -->
    <Card.Root class="rounded-3xl border-border/70 bg-card/95 flex flex-col h-[650px] overflow-hidden">
      <Card.Header class="p-4 border-b">
        <div class="flex items-center justify-between">
          <Card.Title class="text-sm font-semibold">{tr('Conversations', '会话历史')}</Card.Title>
          <Button variant="ghost" size="icon-sm" onclick={startNewSession} class="rounded-xl h-8 w-8 hover:bg-muted" title={tr('New thread', '新建会话')}>
            <Plus class="h-4 w-4" />
          </Button>
        </div>
        
        <!-- Search -->
        <div class="relative mt-2">
          <Search class="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            bind:value={searchText} 
            placeholder={tr('Search...', '搜索会话...')} 
            class="pl-8 h-8 text-xs rounded-xl" 
          />
        </div>
      </Card.Header>

      <Card.Content class="p-2 flex-1 overflow-y-auto space-y-4">
        <!-- Filter Intent -->
        <div class="px-2 space-y-1.5">
          <span class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{tr('Filter Intent', '意图筛选')}</span>
          <div class="flex flex-wrap gap-1">
            <button 
              class="px-2 py-0.5 text-[10px] rounded-lg transition-colors {selectedIntent === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}"
              onclick={() => selectedIntent = 'all'}
            >
              {tr('All', '全部')}
            </button>
            {#each Object.entries(intentLabels) as [key, val] (key)}
              <button 
                class="px-2 py-0.5 text-[10px] rounded-lg transition-colors {selectedIntent === key ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}"
                onclick={() => selectedIntent = key}
              >
                {val}
              </button>
            {/each}
          </div>
        </div>

        <!-- Filter Status -->
        <div class="px-2 space-y-1.5">
          <span class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{tr('Filter Status', '状态筛选')}</span>
          <div class="flex flex-wrap gap-1">
            <button 
              class="px-2 py-0.5 text-[10px] rounded-lg transition-colors {selectedStatus === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}"
              onclick={() => selectedStatus = 'all'}
            >
              {tr('All', '全部')}
            </button>
            {#each Object.entries(statusLabels) as [key, val] (key)}
              <button 
                class="px-2 py-0.5 text-[10px] rounded-lg transition-colors {selectedStatus === key ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}"
                onclick={() => selectedStatus = key}
              >
                {val}
              </button>
            {/each}
          </div>
        </div>

        <div class="border-t pt-2 space-y-1">
          {#each filteredRecords as item (getRecordKey(item))}
            {@const isSelected = String(selectedSessionId) === String(item.id)}
            <button
              class="w-full text-left p-2.5 rounded-xl transition-all flex flex-col gap-1 border
                {isSelected ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-background hover:bg-muted/30 border-border/50 text-foreground'}"
              onclick={() => selectSession(item.id)}
            >
              <div class="flex items-center justify-between gap-1.5">
                <span class="font-medium text-xs truncate flex-1">{item.title}</span>
                <Badge variant="outline" class="text-[9px] px-1 py-0 h-4 border-primary/25 text-primary bg-primary/5">
                  {getIntentLabel(item.intent)}
                </Badge>
              </div>
              {#if item.lastMessage}
                <p class="text-[10px] text-muted-foreground line-clamp-1">{item.lastMessage}</p>
              {/if}
              <div class="flex items-center justify-between text-[9px] text-muted-foreground/80 mt-1">
                <span>{getStatusLabel(item.status)}</span>
                <span>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : ''}</span>
              </div>
            </button>
          {:else}
            <div class="p-4 text-center text-xs text-muted-foreground">
              {tr('No sessions found.', '没有找到相关会话。')}
            </div>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>

    <!-- Center Pane: Chat workspace -->
    <Card.Root class="rounded-3xl border-border/70 bg-card/95 flex flex-col h-[650px] overflow-hidden">
      <!-- Chat Header -->
      <Card.Header class="p-4 border-b flex flex-row items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Bot class="h-5 w-5" />
          </div>
          <div>
            <Card.Title class="text-sm font-semibold">{tr('Operation Copilot', '运营助理协同')}</Card.Title>
            <Card.Description class="text-[10px]">{tr('Syncing with inventory database', '集成实时库存仓储数据源')}</Card.Description>
          </div>
        </div>
        {#if selectedSessionId}
          <div class="flex items-center gap-2">
            <Badge variant="outline" class="text-[10px] border-primary/20 text-primary bg-primary/5">
              ID: {selectedSessionId}
            </Badge>
          </div>
        {/if}
      </Card.Header>

      <!-- Chat Messages Container -->
      <Card.Content class="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {#each chatMessages as msg (msg.id)}
          <div class="flex gap-3 {msg.role === 'user' ? 'justify-end' : 'justify-start'}">
            {#if msg.role !== 'user'}
              <div class="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Bot class="h-4 w-4" />
              </div>
            {/if}
            
            <div class="max-w-[80%] rounded-2xl p-3 text-sm border
              {msg.role === 'user' 
                ? 'bg-primary text-primary-foreground border-primary/10 shadow-sm' 
                : 'bg-muted/40 border-border/70 text-foreground'}"
            >
              <!-- Message content with preserve line breaks -->
              <p class="whitespace-pre-line leading-relaxed text-xs">{msg.content}</p>
            </div>
          </div>
        {/each}

        {#if isStreaming}
          <div class="flex gap-3 justify-start">
            <div class="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Bot class="h-4 w-4" />
            </div>
            <div class="bg-muted/40 border border-border/70 rounded-2xl p-3 flex items-center gap-2 text-xs text-muted-foreground">
              <RefreshCw class="h-3 w-3 animate-spin text-primary" />
              <span>{tr('Analyzing inventory data...', '正在分析仓库数据...')}</span>
            </div>
          </div>
        {/if}

        <!-- Recommended Questions (shown if history is short or newly started) -->
        {#if chatMessages.length <= 2 && !isStreaming}
          <div class="mt-6 border-t pt-4 space-y-2 shrink-0">
            <div class="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
              <Sparkles class="h-3.5 w-3.5 text-primary" />
              <span>{tr('Recommended Queries', '推荐的运营分析问题')}</span>
            </div>
            <div class="grid gap-2 sm:grid-cols-2">
              {#each recommendedPrompts as prompt (prompt.text)}
                <button
                  class="text-left p-3 rounded-xl border border-border/60 bg-background hover:bg-muted/40 text-xs font-medium transition-all flex items-start justify-between gap-1"
                  onclick={() => handleSendMessage(prompt.text)}
                >
                  <span class="flex-1 text-[11px] leading-snug">{prompt.text}</span>
                  <ChevronRight class="h-3.5 w-3.5 text-muted-foreground/60 shrink-0 mt-0.5" />
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </Card.Content>

      <!-- Chat Input Area -->
      <div class="p-3 border-t bg-background shrink-0">
        <form 
          onsubmit={(e) => { e.preventDefault(); handleSendMessage(messageInput); }} 
          class="flex items-center gap-2"
        >
          <Input 
            bind:value={messageInput} 
            placeholder={tr('Ask the operator assistant...', '输入库存分析请求，例如：“盘点差异”...')} 
            class="flex-1 h-9 rounded-xl text-xs"
            disabled={isStreaming}
          />
          <Button type="submit" size="sm" class="rounded-xl h-9" disabled={isStreaming || !messageInput.trim()}>
            <Send class="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>
    </Card.Root>

  </div>

  <!-- Bottom Data Grid (CRUD Table) -->
  <div class="border-t pt-6">
    <div class="mb-4">
      <h2 class="text-lg font-semibold tracking-tight text-foreground">{tr('Conversation Records Database', '会话数据库明细')}</h2>
      <p class="text-xs text-muted-foreground mt-0.5">{tr('Create, update, or resolve assistant conversation records directly in the grid.', '在下表中可直接对 AI 会话记录进行增删改查及状态调整。')}</p>
    </div>
    <AutoTable {resourceName} />
  </div>
</div>
