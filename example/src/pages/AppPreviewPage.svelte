<script lang="ts">
  import { navigate } from '@svadmin/core/router';
  import { getLocale } from '@svadmin/core/i18n';
  import { AutoTable, Badge, Button } from '@svadmin/ui';
  import * as Card from '@svadmin/ui/components/ui/card/index.js';
  import { Bot, CalendarDays, FileText, Settings, ShoppingBag, Wrench } from '@lucide/svelte';
  import type { Component } from 'svelte';

  type PreviewKey = 'project_planning' | 'store_admin' | 'store_services' | 'ai_prompt' | 'invoice_generator';

  interface PreviewCopy {
    eyebrow: string;
    title: string;
    description: string;
    action: string;
    readiness: string;
    metrics: Array<{ label: string; value: string; hint: string }>;
    capabilities: Array<{ title: string; description: string; status: string }>;
    roadmap: Array<{ title: string; meta: string; tone: string }>;
  }

  interface PreviewConfig {
    icon: Component<{ class?: string }>;
    en: PreviewCopy;
    zh: PreviewCopy;
  }

  let { resourceName = 'project_planning' } = $props<{ resourceName?: string }>();

  const locale = $derived(getLocale());
  const isZh = $derived(locale === 'zh-CN');

  const previews: Record<PreviewKey, PreviewConfig> = {
    project_planning: {
      icon: CalendarDays,
      en: {
        eyebrow: 'Soon · Project Planning',
        title: 'Project planning cockpit',
        description: 'Preview a planning workspace for milestones, owners, launch readiness, and evidence handoff.',
        action: 'Add milestone',
        readiness: 'Planning preview',
        metrics: [
          { label: 'Milestones', value: '3', hint: 'tracked in local data' },
          { label: 'Confidence', value: '75%', hint: 'average readiness' },
          { label: 'Next review', value: '7d', hint: 'handoff cadence' },
        ],
        capabilities: [
          { title: 'Milestone board', description: 'Group launch work by owner, due date, and status.', status: 'Ready' },
          { title: 'Evidence handoff', description: 'Collect browser smoke outputs and static verification notes.', status: 'Soon' },
          { title: 'Decision log', description: 'Record scope boundaries and reference-page mapping choices.', status: 'Soon' },
        ],
        roadmap: [
          { title: 'Launch checklist', meta: 'Owner + status + confidence', tone: 'Review' },
          { title: 'Mobile evidence pack', meta: 'Compact route screenshots', tone: 'Next' },
        ],
      },
      zh: {
        eyebrow: 'Soon · 项目计划',
        title: '项目计划驾驶舱',
        description: '预览里程碑、负责人、上线就绪度和证据交接的计划工作台。',
        action: '新增里程碑',
        readiness: '计划预览',
        metrics: [
          { label: '里程碑', value: '3', hint: '来自本地数据' },
          { label: '信心指数', value: '75%', hint: '平均就绪度' },
          { label: '下次复核', value: '7天', hint: '交接节奏' },
        ],
        capabilities: [
          { title: '里程碑看板', description: '按负责人、截止日期和状态组织上线工作。', status: '已就绪' },
          { title: '证据交接', description: '汇总浏览器 smoke 输出和静态验证记录。', status: 'Soon' },
          { title: '决策日志', description: '记录范围边界和参考页映射选择。', status: 'Soon' },
        ],
        roadmap: [
          { title: '上线检查清单', meta: '负责人 + 状态 + 信心', tone: '复核' },
          { title: '移动端证据包', meta: '紧凑路由截图', tone: '下一步' },
        ],
      },
    },
    store_admin: {
      icon: ShoppingBag,
      en: {
        eyebrow: 'Soon · Store Admin',
        title: 'Store admin preview',
        description: 'Model catalog moderation, merchant dashboards, and promotion workflows before the full store admin ships.',
        action: 'Add admin module',
        readiness: 'Admin preview',
        metrics: [
          { label: 'Modules', value: '3', hint: 'catalog, merchant, promo' },
          { label: 'Review queue', value: '2', hint: 'needs decision' },
          { label: 'Launch fit', value: '82%', hint: 'sample score' },
        ],
        capabilities: [
          { title: 'Catalog moderation', description: 'Review publish state and product enrichment gaps.', status: 'Ready' },
          { title: 'Promotion builder', description: 'Preview coupon guardrails and approval paths.', status: 'Soon' },
          { title: 'Merchant dashboard', description: 'Track refunds, orders, and fulfillment exceptions.', status: 'Soon' },
        ],
        roadmap: [
          { title: 'Moderation queue', meta: 'Content + publishing state', tone: 'Active' },
          { title: 'Promotion rules', meta: 'Margin and stacking guardrails', tone: 'Design' },
        ],
      },
      zh: {
        eyebrow: 'Soon · 商城管理端',
        title: '商城管理端预览',
        description: '在完整商城管理端上线前，先演示目录审核、商家看板和促销工作流。',
        action: '新增管理模块',
        readiness: '管理端预览',
        metrics: [
          { label: '模块', value: '3', hint: '目录、商家、促销' },
          { label: '复核队列', value: '2', hint: '需要决策' },
          { label: '上线匹配', value: '82%', hint: '示例评分' },
        ],
        capabilities: [
          { title: '目录审核', description: '检查发布状态和商品富化缺口。', status: '已就绪' },
          { title: '促销构建器', description: '预览优惠规则和审批路径。', status: 'Soon' },
          { title: '商家看板', description: '跟踪退款、订单和履约异常。', status: 'Soon' },
        ],
        roadmap: [
          { title: '审核队列', meta: '内容 + 发布状态', tone: '进行中' },
          { title: '促销规则', meta: '毛利与叠加约束', tone: '设计' },
        ],
      },
    },
    store_services: {
      icon: Wrench,
      en: {
        eyebrow: 'Soon · Store Services',
        title: 'Store services control room',
        description: 'Preview service boundaries for checkout orchestration, stock reservation, and notification workers.',
        action: 'Add service',
        readiness: 'Service preview',
        metrics: [
          { label: 'Services', value: '3', hint: 'edge, queue, worker' },
          { label: 'Latency budget', value: '293ms', hint: 'average target' },
          { label: 'Risks', value: '1', hint: 'queue capacity' },
        ],
        capabilities: [
          { title: 'Checkout orchestration', description: 'Coordinate tax, shipping, and payment preflight.', status: 'Planned' },
          { title: 'Reservation queue', description: 'Hold inventory while payment authorization settles.', status: 'Active' },
          { title: 'Notification worker', description: 'Deliver order, invoice, and shipping updates.', status: 'Review' },
        ],
        roadmap: [
          { title: 'Queue replay policy', meta: 'Retry + dead-letter rules', tone: 'Risk' },
          { title: 'Edge budget', meta: 'Sub-200ms checkout preflight', tone: 'Target' },
        ],
      },
      zh: {
        eyebrow: 'Soon · 商城服务端',
        title: '商城服务控制室',
        description: '预览结账编排、库存预占和通知工作器的服务边界。',
        action: '新增服务',
        readiness: '服务预览',
        metrics: [
          { label: '服务', value: '3', hint: '边缘、队列、工作器' },
          { label: '延迟预算', value: '293ms', hint: '平均目标' },
          { label: '风险', value: '1', hint: '队列容量' },
        ],
        capabilities: [
          { title: '结账编排', description: '协调税费、配送和支付前置检查。', status: '已规划' },
          { title: '库存预占队列', description: '在支付授权期间保留库存。', status: '进行中' },
          { title: '通知工作器', description: '发送订单、发票和配送更新。', status: '复核' },
        ],
        roadmap: [
          { title: '队列重放策略', meta: '重试 + 死信规则', tone: '风险' },
          { title: '边缘预算', meta: '结账前置检查低于 200ms', tone: '目标' },
        ],
      },
    },
    ai_prompt: {
      icon: Bot,
      en: {
        eyebrow: 'Soon · AI Prompt',
        title: 'AI prompt studio',
        description: 'Preview prompt categories for developer, business, educator, and creative workflows.',
        action: 'Add prompt',
        readiness: 'Prompt preview',
        metrics: [
          { label: 'Templates', value: '3', hint: 'sample prompts' },
          { label: 'Audiences', value: '4', hint: 'developer to creative' },
          { label: 'Usage', value: '129', hint: 'demo runs' },
        ],
        capabilities: [
          { title: 'Prompt library', description: 'Organize reusable prompts by audience and status.', status: 'Ready' },
          { title: 'Quality review', description: 'Track prompts that need evidence or tone checks.', status: 'Soon' },
          { title: 'Usage signals', description: 'Surface high-value prompts and stale templates.', status: 'Soon' },
        ],
        roadmap: [
          { title: 'Developer guide', meta: 'Refactor + verification prompt', tone: 'Review' },
          { title: 'Campaign draft', meta: 'Creative prompt template', tone: 'Live' },
        ],
      },
      zh: {
        eyebrow: 'Soon · AI 提示词',
        title: 'AI 提示词工作室',
        description: '预览开发、业务、教育和创意场景的提示词分类。',
        action: '新增提示词',
        readiness: '提示词预览',
        metrics: [
          { label: '模板', value: '3', hint: '示例提示词' },
          { label: '受众', value: '4', hint: '开发到创意' },
          { label: '使用', value: '129', hint: '演示运行' },
        ],
        capabilities: [
          { title: '提示词库', description: '按受众和状态组织可复用提示词。', status: '已就绪' },
          { title: '质量复核', description: '跟踪需要证据或语气检查的提示词。', status: 'Soon' },
          { title: '使用信号', description: '突出高价值提示词和过期模板。', status: 'Soon' },
        ],
        roadmap: [
          { title: '开发指南', meta: '重构 + 验证提示词', tone: '复核' },
          { title: '活动草稿', meta: '创意提示词模板', tone: '已上线' },
        ],
      },
    },
    invoice_generator: {
      icon: FileText,
      en: {
        eyebrow: 'Soon · Invoice Generator',
        title: 'Invoice generator preview',
        description: 'Preview invoice templates, run windows, delivery channels, and approval notes.',
        action: 'Add template',
        readiness: 'Invoice preview',
        metrics: [
          { label: 'Templates', value: '3', hint: 'order and statement flows' },
          { label: 'Channels', value: '3', hint: 'system, order, email' },
          { label: 'Next run', value: 'Jun 18', hint: 'nearest schedule' },
        ],
        capabilities: [
          { title: 'Template routing', description: 'Map templates to order, system, and email channels.', status: 'Ready' },
          { title: 'Approval notes', description: 'Capture credit memo review before generation.', status: 'Review' },
          { title: 'Statement batches', description: 'Prepare monthly account summaries.', status: 'Soon' },
        ],
        roadmap: [
          { title: 'Order invoice packet', meta: 'Buyer-facing shipment detail', tone: 'Active' },
          { title: 'Credit memo approval', meta: 'Review before issue', tone: 'Review' },
        ],
      },
      zh: {
        eyebrow: 'Soon · 发票生成器',
        title: '发票生成器预览',
        description: '预览发票模板、运行窗口、投递渠道和审批说明。',
        action: '新增模板',
        readiness: '发票预览',
        metrics: [
          { label: '模板', value: '3', hint: '订单和对账流程' },
          { label: '渠道', value: '3', hint: '系统、订单、邮件' },
          { label: '下次运行', value: '6月18日', hint: '最近排程' },
        ],
        capabilities: [
          { title: '模板路由', description: '将模板映射到订单、系统和邮件渠道。', status: '已就绪' },
          { title: '审批说明', description: '生成前记录贷项通知复核。', status: '复核' },
          { title: '对账批次', description: '准备月度账户摘要。', status: 'Soon' },
        ],
        roadmap: [
          { title: '订单发票包', meta: '面向买家的配送详情', tone: '进行中' },
          { title: '贷项审批', meta: '签发前复核', tone: '复核' },
        ],
      },
    },
  };

  const fallbackKey = 'project_planning' satisfies PreviewKey;
  const preview = $derived(previews[resourceName as PreviewKey] ?? previews[fallbackKey]);
  const copy = $derived(isZh ? preview.zh : preview.en);
  const Icon = $derived(preview.icon ?? Settings);
</script>

<div class="space-y-6" data-app-page="app-preview" data-preview-resource={resourceName}>
  <section class="grid gap-4 xl:grid-cols-[1fr_0.34fr]">
    <Card.Root class="overflow-hidden border-primary/20">
      <Card.Header class="border-b">
        <Badge>{copy.eyebrow}</Badge>
        <Card.Title class="mt-3 flex items-center gap-3 text-2xl">
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon class="h-6 w-6" />
          </span>
          {copy.title}
        </Card.Title>
        <Card.Description>{copy.description}</Card.Description>
      </Card.Header>
      <Card.Content class="grid gap-3 p-5 md:grid-cols-3">
        {#each copy.metrics as metric (metric.label)}
          <div class="rounded-xl border bg-card p-4">
            <p class="text-xs text-muted-foreground">{metric.label}</p>
            <p class="mt-2 text-2xl font-semibold">{metric.value}</p>
            <p class="mt-1 text-xs text-muted-foreground">{metric.hint}</p>
          </div>
        {/each}
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Content class="space-y-4 p-5">
        <Badge variant="secondary">{copy.readiness}</Badge>
        <p class="text-sm text-muted-foreground">
          {isZh ? '这个入口先作为 example 的可落地预览，保留完整 CRUD、表格和信息架构。' : 'This entry is a practical example preview with CRUD, tables, and information architecture in place.'}
        </p>
        <Button class="w-full" onclick={() => navigate(`/${resourceName}/create`)}>{copy.action}</Button>
      </Card.Content>
    </Card.Root>
  </section>

  <section class="grid gap-4 lg:grid-cols-[1fr_0.82fr]">
    <Card.Root class="overflow-hidden">
      <Card.Header class="border-b">
        <Card.Title class="text-base">{isZh ? '能力矩阵' : 'Capability Matrix'}</Card.Title>
        <Card.Description>{isZh ? '每个 Soon 应用都有可跟进的能力、状态和记录。' : 'Each Soon app keeps trackable capabilities, status, and records.'}</Card.Description>
      </Card.Header>
      <Card.Content class="grid gap-3 p-5 md:grid-cols-3">
        {#each copy.capabilities as capability (capability.title)}
          <div class="rounded-xl border p-4">
            <div class="flex items-center justify-between gap-3">
              <p class="font-semibold">{capability.title}</p>
              <Badge variant="outline">{capability.status}</Badge>
            </div>
            <p class="mt-2 text-sm text-muted-foreground">{capability.description}</p>
          </div>
        {/each}
      </Card.Content>
    </Card.Root>

    <Card.Root class="overflow-hidden">
      <Card.Header class="border-b">
        <Card.Title class="text-base">{isZh ? '路线图关注' : 'Roadmap Focus'}</Card.Title>
      </Card.Header>
      <Card.Content class="space-y-3 p-5">
        {#each copy.roadmap as item (item.title)}
          <div class="rounded-xl border p-4">
            <div class="flex items-center justify-between gap-3">
              <p class="font-semibold">{item.title}</p>
              <Badge>{item.tone}</Badge>
            </div>
            <p class="mt-1 text-xs text-muted-foreground">{item.meta}</p>
          </div>
        {/each}
      </Card.Content>
    </Card.Root>
  </section>

  <Card.Root class="overflow-hidden">
    <Card.Header class="border-b">
      <Card.Title class="text-base">{isZh ? '预览数据' : 'Preview Records'}</Card.Title>
      <Card.Description>{isZh ? '底部仍然保留 svadmin 资源表格，用于演示列表、创建、编辑和详情。' : 'The svadmin resource table remains available for list, create, edit, and show flows.'}</Card.Description>
    </Card.Header>
    <Card.Content class="p-0">
      <AutoTable {resourceName} />
    </Card.Content>
  </Card.Root>
</div>
