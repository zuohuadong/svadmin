<script lang="ts">
  import { getLocale } from '@svadmin/core/i18n';
  import { navigate } from '@svadmin/core/router';
  import { useList } from '@svadmin/core';
  import { AutoTable, Badge, Button } from '@svadmin/ui';
  import * as Card from '@svadmin/ui/components/ui/card/index.js';
  import * as Tabs from '@svadmin/ui/components/ui/tabs/index.js';
  import { Bell, Bot, MessageCircle, Send } from '@lucide/svelte';

  let { resourceName } = $props<{ resourceName: string }>();

  const locale = $derived(getLocale());
  const tr = (en: string, zh: string) => locale === 'zh-CN' ? zh : en;
  const isAi = $derived(resourceName === 'ai_conversations');
  const query = useList({ get resource() { return resourceName; }, pagination: { mode: 'off' } });
  const records = $derived((query.data?.data ?? []) as Record<string, unknown>[]);
  const unread = $derived(records.filter((record) => record.read === false));
</script>

<div class="space-y-6">
  <section class="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm shadow-slate-900/[0.03]">
    <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <Badge class="mb-4 rounded-full bg-primary/10 text-primary hover:bg-primary/10">{isAi ? tr('Intelligence', '智能助手') : tr('Inbox', '消息收件箱')}</Badge>
        <h1 class="text-3xl font-semibold tracking-tight">{isAi ? tr('AI conversation hub', 'AI 会话中心') : tr('Notification center', '通知中心')}</h1>
        <p class="mt-2 max-w-2xl text-sm text-muted-foreground">
          {isAi ? tr('Review operational assistant threads alongside the editable conversation records.', '在可编辑会话记录旁查看运营助手线程。') : tr('Prioritize critical alerts, unread messages, and operational broadcasts.', '优先处理严重告警、未读消息和运营广播。')}
        </p>
      </div>
      <Button class="rounded-xl" onclick={() => navigate(`/${resourceName}/create`)}>
        {#if isAi}
          <Bot class="h-4 w-4" data-icon="inline-start" />
        {:else}
          <Bell class="h-4 w-4" data-icon="inline-start" />
        {/if}
        {isAi ? tr('New thread', '新建会话') : tr('New notice', '新建通知')}
      </Button>
    </div>
  </section>

  <div class="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
    <Card.Root class="rounded-[2rem] border-border/70 bg-card">
      <Card.Header>
        <Card.Title>{isAi ? tr('Conversation stream', '会话流') : tr('Inbox priority', '收件优先级')}</Card.Title>
      </Card.Header>
      <Card.Content>
        <Tabs.Root value="primary">
          <Tabs.List class="mb-4 grid w-full grid-cols-3 rounded-2xl bg-muted/50">
            <Tabs.Trigger value="primary">{isAi ? tr('Open', '打开') : tr('Unread', '未读')}</Tabs.Trigger>
            <Tabs.Trigger value="all">{tr('All', '全部')}</Tabs.Trigger>
            <Tabs.Trigger value="critical">{isAi ? tr('Resolved', '已解决') : tr('Critical', '严重')}</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="primary" class="space-y-3">
            {#each (isAi ? records.filter((record) => record.status === 'open') : unread) as record (String(record.id))}
              <div class="rounded-2xl border border-border/60 bg-muted/20 p-4">
                <div class="flex items-center justify-between gap-3">
                  <p class="font-medium">{record.title}</p>
                  <Badge variant="outline">{isAi ? record.status : record.severity}</Badge>
                </div>
                <p class="mt-1 text-xs text-muted-foreground">{isAi ? record.lastMessage : record.body}</p>
              </div>
            {:else}
              <p class="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">{tr('Nothing needs attention.', '暂无需要处理的消息。')}</p>
            {/each}
          </Tabs.Content>
          <Tabs.Content value="all" class="space-y-3">
            {#each records as record (String(record.id))}
              <div class="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
                <MessageCircle class="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p class="font-medium">{record.title}</p>
                  <p class="text-xs text-muted-foreground">{isAi ? record.updatedAt : record.createdAt}</p>
                </div>
              </div>
            {/each}
          </Tabs.Content>
          <Tabs.Content value="critical" class="space-y-3">
            {#each records.filter((record) => isAi ? record.status === 'resolved' : record.severity === 'critical') as record (String(record.id))}
              <div class="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <p class="font-medium">{record.title}</p>
                <p class="mt-1 text-xs text-muted-foreground">{isAi ? record.lastMessage : record.body}</p>
              </div>
            {:else}
              <p class="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">{tr('No matching records.', '暂无匹配记录。')}</p>
            {/each}
          </Tabs.Content>
        </Tabs.Root>
      </Card.Content>
    </Card.Root>

    <div class="space-y-4">
      {#if isAi}
        <Card.Root class="rounded-[2rem] border-primary/20 bg-primary/5">
          <Card.Content class="flex items-start gap-4 p-5">
            <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Bot class="h-5 w-5" /></span>
            <div>
              <p class="font-semibold">{tr('Assistant ready', '助手已就绪')}</p>
              <p class="mt-1 text-sm text-muted-foreground">{tr('Ask about low stock, transfers, cycle counts, or reorder rules from the floating chat.', '可以从右下角聊天询问低库存、调拨、盘点或补货规则。')}</p>
            </div>
          </Card.Content>
        </Card.Root>
      {:else}
        <Card.Root class="rounded-[2rem] border-primary/20 bg-primary/5">
          <Card.Content class="flex items-start gap-4 p-5">
            <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Send class="h-5 w-5" /></span>
            <div>
              <p class="font-semibold">{tr('Broadcast workspace', '通知工作台')}</p>
              <p class="mt-1 text-sm text-muted-foreground">{tr('Use the table below for structured notification records while this inbox highlights urgency.', '下方表格用于维护结构化通知记录，这里突出处理优先级。')}</p>
            </div>
          </Card.Content>
        </Card.Root>
      {/if}
      <AutoTable {resourceName} />
    </div>
  </div>
</div>
