<script lang="ts">
  import { useList } from '@svadmin/core';
  import { getLocale } from '@svadmin/core/i18n';
  import { AutoTable, Badge, Button } from '@svadmin/ui';
  import * as Card from '@svadmin/ui/components/ui/card/index.js';
  import { Archive, Clock, FileText, Inbox, Mail, Paperclip, Plus, Send, ShieldAlert, Tag, Trash2 } from '@lucide/svelte';

  interface MailMessage {
    id: number;
    sender?: string;
    to?: string;
    subject: string;
    body: string;
    date?: string;
    sentAt?: string;
    updatedAt?: string;
    unread?: boolean;
  }

  let { resourceName = 'mail_inbox' } = $props<{ resourceName?: string }>();

  const locale = $derived(getLocale());
  const isZh = $derived(locale === 'zh-CN');
  const inboxQuery = useList({ resource: 'mail_inbox', pagination: { mode: 'off' } });
  const draftQuery = useList({ resource: 'mail_draft', pagination: { mode: 'off' } });
  const sentQuery = useList({ resource: 'mail_sent', pagination: { mode: 'off' } });
  const archiveQuery = useList({ resource: 'mail_archive', pagination: { mode: 'off' } });
  const snoozedQuery = useList({ resource: 'mail_snoozed', pagination: { mode: 'off' } });
  const spamQuery = useList({ resource: 'mail_spam', pagination: { mode: 'off' } });
  const trashQuery = useList({ resource: 'mail_trash', pagination: { mode: 'off' } });
  const query = $derived.by(() => {
    if (resourceName === 'mail_draft') return draftQuery;
    if (resourceName === 'mail_sent') return sentQuery;
    if (resourceName === 'mail_archive') return archiveQuery;
    if (resourceName === 'mail_snoozed') return snoozedQuery;
    if (resourceName === 'mail_spam') return spamQuery;
    if (resourceName === 'mail_trash') return trashQuery;
    return inboxQuery;
  });
  const messages = $derived((query.data?.data ?? []) as unknown as MailMessage[]);
  const selected = $derived(messages[0]);
  const unread = $derived(messages.filter((message) => message.unread).length);
  const labels = $derived([
    { name: isZh ? '运营' : 'Operations', count: inboxQuery.data?.total ?? 0 },
    { name: isZh ? '财务' : 'Finance', count: 1 },
    { name: isZh ? '资产' : 'Property', count: 1 },
  ]);
  const mailUtilities = $derived([
    { label: isZh ? '直接消息' : 'Direct Messages', hint: isZh ? '团队即时沟通' : 'team conversations', count: 3 },
    { label: isZh ? '支持' : 'Support', hint: isZh ? '客户和内部请求' : 'customer and internal requests', count: 2 },
    { label: isZh ? '设置' : 'Settings', hint: isZh ? '签名、规则、通知' : 'signature, rules, notifications', count: 4 },
    { label: isZh ? '反馈' : 'Feedback', hint: isZh ? '体验建议与回访' : 'experience notes and follow-up', count: 1 },
  ]);
  const categories = $derived([
    { label: isZh ? '优先处理' : 'Priority', tone: 'bg-destructive/10 text-destructive' },
    { label: isZh ? '对账' : 'Reconciliation', tone: 'bg-info/10 text-info' },
    { label: isZh ? '看房确认' : 'Tour confirmation', tone: 'bg-success/10 text-success' },
  ]);

  const folders = $derived([
    { label: isZh ? '收件箱' : 'Inbox', href: '#/mail_inbox', count: unread, Icon: Inbox },
    { label: isZh ? '草稿箱' : 'Drafts', href: '#/mail_draft', count: draftQuery.data?.total ?? 0, Icon: FileText },
    { label: isZh ? '已发送' : 'Sent', href: '#/mail_sent', count: sentQuery.data?.total ?? 0, Icon: Send },
    { label: isZh ? '归档' : 'Archive', href: '#/mail_archive', count: archiveQuery.data?.total ?? 0, Icon: Archive },
    { label: isZh ? '稍后提醒' : 'Snoozed', href: '#/mail_snoozed', count: snoozedQuery.data?.total ?? 0, Icon: Clock },
    { label: isZh ? '垃圾邮件' : 'Spam', href: '#/mail_spam', count: spamQuery.data?.total ?? 0, Icon: ShieldAlert },
    { label: isZh ? '废纸篓' : 'Trash', href: '#/mail_trash', count: trashQuery.data?.total ?? 0, Icon: Trash2 },
  ]);

  function messageDate(message: MailMessage): string {
    return message.date ?? message.sentAt ?? message.updatedAt ?? '';
  }
</script>

<div class="space-y-6" data-app-page="mail-workspace">
  <section class="grid gap-4 lg:grid-cols-[1fr_0.72fr]">
    <Card.Root class="overflow-hidden border-primary/20">
      <Card.Header class="border-b">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge>{isZh ? '消息与邮件' : 'Messages & Mail'}</Badge>
            <Card.Title class="mt-3 text-2xl">{isZh ? '收件箱处理队列' : 'Inbox Processing Queue'}</Card.Title>
            <Card.Description>{isZh ? '把未读、草稿、归档和运营标签放在同一个工作流。' : 'Unify unread mail, drafts, archive, and operations tags in one workflow.'}</Card.Description>
          </div>
          <Button><Plus class="mr-2 h-4 w-4" />{isZh ? '写邮件' : 'Compose'}</Button>
        </div>
      </Card.Header>
      <Card.Content class="grid gap-3 p-5 sm:grid-cols-3">
        <div class="rounded-xl border bg-card p-4"><p class="text-xs text-muted-foreground">{isZh ? '未读' : 'Unread'}</p><p class="mt-2 text-2xl font-semibold">{unread}</p></div>
        <div class="rounded-xl border bg-card p-4"><p class="text-xs text-muted-foreground">{isZh ? '草稿' : 'Drafts'}</p><p class="mt-2 text-2xl font-semibold">{draftQuery.data?.total ?? 0}</p></div>
        <div class="rounded-xl border bg-card p-4"><p class="text-xs text-muted-foreground">{isZh ? '已归档' : 'Archived'}</p><p class="mt-2 text-2xl font-semibold">{archiveQuery.data?.total ?? 0}</p></div>
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Header><Card.Title class="flex items-center gap-2 text-base"><Tag class="h-4 w-4 text-primary" />{isZh ? '标签' : 'Labels'}</Card.Title></Card.Header>
      <Card.Content class="space-y-2">
        {#each labels as label (label.name)}
          <div class="flex items-center justify-between rounded-xl border px-3 py-2 text-sm"><span>{label.name}</span><Badge variant="outline">{label.count}</Badge></div>
        {/each}
      </Card.Content>
    </Card.Root>
  </section>

  <section class="grid gap-4 xl:grid-cols-[0.68fr_1fr_1.15fr]">
    <Card.Root class="overflow-hidden">
      <Card.Header class="border-b">
        <Card.Title class="flex items-center gap-2 text-base"><Mail class="h-5 w-5 text-primary" />{isZh ? '邮件中心' : 'Mail Center'}</Card.Title>
        <Card.Description>{isZh ? '文件夹、标签和运营消息统一处理。' : 'Folders, labels, and operational mail in one workflow.'}</Card.Description>
      </Card.Header>
      <Card.Content class="space-y-2 p-3">
        {#each folders as folder (folder.href)}
          <a href={folder.href} class="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:bg-muted/50">
            <span class="flex items-center gap-2"><folder.Icon class="h-4 w-4 text-muted-foreground" />{folder.label}</span>
            <Badge variant="outline">{folder.count}</Badge>
          </a>
        {/each}
        <div class="my-3 border-t"></div>
        <p class="px-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{isZh ? '协作' : 'Collaboration'}</p>
        {#each mailUtilities as item (item.label)}
          <button class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-muted/50">
            <span>
              <span class="block">{item.label}</span>
              <span class="text-xs text-muted-foreground">{item.hint}</span>
            </span>
            <Badge variant="outline">{item.count}</Badge>
          </button>
        {/each}
      </Card.Content>
    </Card.Root>

    <Card.Root class="overflow-hidden">
      <Card.Header class="border-b">
        <Card.Title class="text-base">{isZh ? '消息列表' : 'Message List'}</Card.Title>
        <Card.Description>{isZh ? '按未读、日期和主题快速分拣。' : 'Triage by unread state, date, and subject.'}</Card.Description>
      </Card.Header>
      <Card.Content class="p-0">
        <div class="divide-y">
          {#each messages as message (message.id)}
            <button class="block w-full px-4 py-3 text-left transition hover:bg-muted/40">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold">{message.subject}</p>
                  <p class="mt-1 truncate text-xs text-muted-foreground">{message.sender ?? message.to}</p>
                </div>
                {#if message.unread}<span class="mt-1 h-2 w-2 rounded-full bg-primary"></span>{/if}
              </div>
              <p class="mt-2 line-clamp-2 text-xs text-muted-foreground">{message.body}</p>
              <p class="mt-2 text-xs text-primary">{messageDate(message)}</p>
            </button>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>

    <Card.Root class="overflow-hidden border-primary/20">
      <Card.Header class="border-b">
        <Badge>{isZh ? '阅读面板' : 'Reading Pane'}</Badge>
        <Card.Title class="mt-3 text-xl">{selected?.subject ?? (isZh ? '暂无邮件' : 'No message selected')}</Card.Title>
        <Card.Description>{selected ? `${selected.sender ?? selected.to} · ${messageDate(selected)}` : ''}</Card.Description>
      </Card.Header>
      <Card.Content class="space-y-4 p-5">
        <p class="rounded-xl border bg-muted/25 p-4 text-sm leading-6 text-muted-foreground">
          {selected?.body ?? (isZh ? '当前文件夹暂无可读消息。' : 'There is no readable message in this folder.')}
        </p>
        <div class="rounded-xl border bg-background p-3">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{isZh ? '快速回复' : 'Quick reply'}</p>
          <p class="mt-2 text-sm text-muted-foreground">{isZh ? '收到，我会在今天的运营复盘前处理。' : 'Received. I will handle this before today\'s operations review.'}</p>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="rounded-xl border bg-background p-3">
            <p class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"><Paperclip class="h-3.5 w-3.5" />{isZh ? '附件' : 'Attachments'}</p>
            <p class="mt-2 text-sm text-muted-foreground">{isZh ? '本地示例：对账包、看房确认、盘点表。' : 'Demo metadata: reconciliation packet, tour confirmation, count sheet.'}</p>
          </div>
          <div class="rounded-xl border bg-background p-3">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{isZh ? '邮件元信息' : 'Mail metadata'}</p>
            <p class="mt-2 text-sm text-muted-foreground">{resourceName.replace('mail_', '')} · {selected?.unread ? (isZh ? '未读' : 'unread') : (isZh ? '已读' : 'read')}</p>
          </div>
        </div>
        <div class="rounded-xl border bg-background p-3">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{isZh ? '分类' : 'Categories'}</p>
          <div class="mt-3 flex flex-wrap gap-2">
            {#each categories as category (category.label)}
              <span class={`rounded-full px-2.5 py-1 text-xs font-medium ${category.tone}`}>{category.label}</span>
            {/each}
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <Button>{isZh ? '回复' : 'Reply'}</Button>
          <Button variant="outline">{isZh ? '转发' : 'Forward'}</Button>
          <Button variant="outline">{isZh ? '归档' : 'Archive'}</Button>
        </div>
      </Card.Content>
    </Card.Root>
  </section>

  <AutoTable {resourceName} />
</div>
