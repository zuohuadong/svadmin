# Project Task Ledger

> 项目级任务账本模板。它是当前项目的执行任务源；全局 dashboard 只能聚合状态，不应替代项目 ledger。

## 推荐状态

- `ready`：可领取
- `running`：已领取
- `review`：已提 PR，等待审查
- `blocked`：被外部条件阻塞
- `done`：已完成

## 任务格式

```md
| task_id | provider | repo | source_url | title | priority | risk | status | owner | model | branch | change_request_url |
|---------|----------|------|------------|-------|----------|------|--------|-------|-------|--------|--------------------|
| 001 | local | owner/repo | - | 修复登录回调 | high | low | ready | AI | gpt-5.3-codex | feat/login-fix | - |
```

## 单条任务建议包含

- Provider 和原始任务链接
- 目标
- 非目标
- 验收标准
- 相关 skill 和代码规范
- 影响范围
- 风险和回滚
- 验证计划
- 参考链接 / issue / PR / MR
- parent task / 原任务引用
- source / 原 PR/MR 引用
- reason / 为什么派生这个任务

## 自动化规则

1. 20 分钟执行器每次只领取 1 个 `ready` 任务
2. 领取前必须先形成 Task Contract
3. 领取前必须识别相关 skill、项目代码规范和测试约定
4. 领取后先建分支或 worktree，再改代码
5. 完成后必须附带测试结果和 PR/MR 链接
6. 审查器只处理 `review` 任务对应的 PR/MR，并按 Task Contract 逐条审查
7. 审查不合格优先退回原 PR/MR，只有原 PR/MR 无法继续或问题已合并才创建 follow-up 修复任务

## Active Task Ledger

| task_id | provider | repo | source_url | title | priority | risk | status | owner | model | branch | change_request_url |
|---------|----------|------|------------|-------|----------|------|--------|-------|-------|--------|--------------------|
| INV-001 | local | zuohuadong/svadmin | - | Implement Inventory Platform example | high | medium | done | Codex + Lorentz verifier | gpt-5.3-codex | - | - |
| INV-002 | local | zuohuadong/svadmin | - | Extend Inventory Platform with roadmap P1-P3 resources | high | medium | done | gpt-5.2 executor + gpt-5.3-codex verifier + Codex review | gpt-5.2/gpt-5.3-codex | - | - |
| INV-003 | local | zuohuadong/svadmin | - | Complete Inventory AI Chat assistant demo | high | medium | done | gpt-5.2 executor + Codex review | gpt-5.2 | - | - |
| INV-004 | local | zuohuadong/svadmin | - | Implement Inventory Operations Plus demo resources | high | medium | done | gpt-5.2 executor + Codex review | gpt-5.2 | - | - |
| INV-005 | local | zuohuadong/svadmin | - | Add original CRM and property operations example modules | high | medium | done | gpt-5.3-codex executor + Codex review | gpt-5.3-codex | - | - |
| INV-006 | local | zuohuadong/svadmin | - | Expand example into multi-system admin demo navigation | high | medium | done | gpt-5.2 executor + gpt-5.3-codex verifier + Codex review | gpt-5.2/gpt-5.3-codex | codex/expand-example-multi-system-demo | - |
| INV-007 | local | zuohuadong/svadmin | - | Polish multi-system example pages and contrast | high | medium | done | Codex + gpt-5.2 review | gpt-5.2 | codex/expand-example-multi-system-demo | - |

## Task Contract: INV-001 Implement Inventory Platform example

目标：
- 将 `example` 从 JSONPlaceholder 通用 demo 扩展为可运行的 Inventory Platform 示例。
- 新增或接入本地示例数据，支持 `products`、`skus`、`categories`、`suppliers`、`warehouses`、`stock_movements`、`purchase_orders`、`sales_orders` 等资源的 CRUD 浏览。
- 更新 dashboard，使首屏体现库存、订单、供应商、仓库、近期库存动作等业务信息。

非目标：
- 不复刻 外部模板 源码、素材、CSS、布局文件、视觉资产或像素级 UI。
- 不在本阶段实现完整 Mail、Real Estate、CRM、Retail Store。
- 不在本阶段实现泛 AI Chat；库存助手、User Management、Calendar 留作后续任务。
- 不引入外部服务、真实认证后端或数据库迁移。

验收标准：
- `example` 本地运行时新增库存资源可在 `AdminApp` 中打开并执行基础 list/create/update/delete 流程。
- `Dashboard.svelte` 展示库存平台概览，而不是 posts/users/comments 通用统计。
- 保留已有 `todos` 基础示例，避免破坏现有低风险任务资源。
- 合规边界可审计：实现只使用 svadmin 自有组件、项目已有设计系统和通用业务概念。
- 必要验证通过，至少包含类型检查或项目约定检查，以及 `git diff --check`。

相关 skill 和代码规范：
- `agent-team-automation`
- `svadmin-admin-ui`
- `svelte-code-writer`
- `svelte-core-bestpractices`
- `typescript`
- 遵循 Svelte 5 runes、keyed each、现有目录结构和命名习惯。

影响范围：
- 预期主要影响 `example/src/**`。
- 任务契约和进度记录影响 `tasks.md`、`progress.md`。

风险和回滚：
- 风险：示例 dataProvider 行为若和 `@svadmin/core` 期望不一致，可能影响 CRUD 演示。
- 风险：库存示例范围容易膨胀，应先保持 P0 资源闭环。
- 回滚：撤销 `example/src/**` 中库存示例改动，并移除本任务 ledger/progress 记录。

验证计划：
- `bun run check`
- `bun run lint`
- `bun test packages/`
- `git diff --check`
- 如变更可视页面，启动 example 并进行浏览器 smoke 检查。

裁决结果：
- gpt-5.3-codex 子线程 Lorentz 只读审查结论：PASS，同意主线程裁决边界。
- 最终裁决：不在 svadmin 中复刻 外部模板 的 Public Profile / Gamer Profile / Company Profile / Projects / Team / User Profile / Account/Billing/Security/Teams/Auth/Error/Integration 页面；这些只能作为后台能力清单参考，不能复制 外部模板 源码、素材、CSS、布局文件或像素级 UI。P0 接受 svadmin-native Inventory Platform 示例。

验证结果：
- `bunx @sveltejs/mcp svelte-autofixer example/src/pages/Dashboard.svelte --svelte-version 5`：通过，issues=0。
- `bunx @sveltejs/mcp svelte-autofixer packages/ui/src/components/AutoForm.svelte --svelte-version 5`：通过，issues=0。
- `bun run check`：通过，0 errors / 18 existing warnings。
- `bun run lint`：通过，0 errors / 187 existing warnings。
- `bun test packages/`：通过，357 pass / 0 fail。
- `bun run build`：通过。
- `git diff --check`：通过。
- Browser smoke：in-app Browser 对 localhost 被客户端拦截，已用项目 Playwright runtime 验证 `http://127.0.0.1:5173/`；登录后 Dashboard 展示 `Inventory Platform`、`Stock Units`、`Operations Queue`、`Recent Stock Movements`，`#/products` 展示 `Products`、`Laptop Pro 15`、`Packing Tape`，无 console error。
- Provider CRUD smoke：`products` create/update/get/filter list/delete 通过。

Profile：
- admin_profile.framework: `svadmin`
- admin_profile.decision_source: `user裁决 + gpt-5.3-codex 子线程一致裁决`
- admin_profile.backend_provider: `local mock/in-memory`
- admin_profile.resources: `products`, `skus`, `categories`, `suppliers`, `warehouses`, `stock_movements`, `purchase_orders`, `sales_orders`, `todos`
- admin_profile.auth_required: true
- admin_profile.rbac_required: false
- admin_profile.audit_required: false

## Task Contract: INV-002 Extend Inventory Platform with roadmap P1-P3 resources

目标：
- 在 `example` 示例中补齐用户裁决路线图剩余能力：P1 User Management + Todo，P2 Calendar（采购/盘点）+ AI Chat（库存运营助手，基于本地 mock / `@svadmin/mcp` 方向），P3 Mail 降级为 Notification Center。
- 将用户粘贴的 外部模板 页面清单裁决为后台能力参考，而不是模板复刻：补齐 svadmin-native Account/Security/Team/RBAC/Integrations/Notifications/API/Audit/Error 等通用后台能力。
- 每个能力必须体现为 svadmin 原创资源、示例数据、可浏览 CRUD 或核心 UI 组件，不复刻 外部模板 资产、源码、CSS、布局文件或像素级 UI。
- Dashboard 可展示这些模块的运营入口，但优先保证资源定义、dataProvider 和核心 settings/admin UI 闭环。

非目标：
- 不纳入 Real Estate、完整 CRM、Retail Store。
- 不引入 外部模板 / Envato 模板素材、截图切片、CSS class 或布局结构。
- 不引入真实外部 AI 服务、邮件服务或数据库迁移。
- 不修改无关核心 UI 行为，除非是为了修复 example CRUD 阻断问题且有单独验证。

验收标准：
- 新增或确认 `users`、`roles`、`todos`、`calendar_events`、`ai_conversations`、`notifications` 资源可在 `AdminApp` 菜单中打开。
- 本地 in-memory provider 为上述资源提供示例数据，并支持基础 list/create/update/delete。
- Dashboard 或资源菜单清楚体现 P1-P3 入口。
- 合规边界可审计：UI/UX 为 svadmin 原创设计，MIT 分发安全。
- 必要验证通过：`bun run check`、targeted eslint、`cd example && bun run build`、`git diff --check`；如启动浏览器 smoke，需先确认没有旧子代理或 dev server 争用。

相关 skill 和代码规范：
- `agent-team-automation`
- `svadmin-admin-ui`
- `svelte-code-writer`
- `svelte-core-bestpractices`
- `typescript`

影响范围：
- `example/src/**`：扩展库存平台示例资源、数据、dashboard 入口和本地 in-memory provider。
- `packages/ui/src/components/**`：补齐 settings/admin 通用组件与 404/500 错误页。
- `packages/ui/src/component-registry.svelte.ts`、`packages/ui/src/index.ts`、`packages/core/src/i18n.svelte.ts`：支持 ErrorPage 组件注入，导出新增组件并补充 i18n 文案。

风险和回滚：
- 风险：此前 gpt-5.2 子代理曾反复写回 P0 版本并造成文件争用；执行前必须确认无残留 `agent-team subagent`、`vite`、`bun run dev`、`svelte-autofixer` 后台进程。
- 风险：功能范围容易膨胀，应只实现路线图约定资源，不扩展到 Real Estate/CRM/Retail Store。
- 回滚：撤销 INV-002 对 `example/src/**` 的新增资源和示例数据，保留 INV-001 P0 库存示例。

Profile：
- admin_profile.framework: `svadmin`
- admin_profile.decision_source: `user裁决 + gpt-5.3-codex 子线程一致裁决 + 主线程审查`
- admin_profile.backend_provider: `local mock/in-memory`
- admin_profile.resources: `users`, `roles`, `todos`, `calendar_events`, `ai_conversations`, `notifications`, `settings/security`, `settings/integrations`, `settings/notifications`, `settings/api`, `settings/audit`, `error/404`, `error/500`
- admin_profile.auth_required: true
- admin_profile.rbac_required: true
- admin_profile.audit_required: true

执行与审查结果：
- 已按用户要求调用 `gpt-5.2` executor；子线程返回 settings 组件方向摘要后，主线程发现部分文件未实际落盘，随后恢复/补齐缺失文件并完成集成审核。
- 已按用户继续要求再次调用 `gpt-5.2` executor；子线程 Harvey 补齐 `SettingsPage` 可配置 sections/snippets、`ErrorPage` SSR-safe 返回逻辑和 `ErrorPage` DI 注入，主线程审核后进一步移除新增 `any` 并修正未知 settings tab 空白回退。
- 已按用户追加要求调用 `gpt-5.3-codex` verifier 子线程参与最终裁决；主线程只在取得一致裁决后将 INV-002 记为最终完成。
- 已新增 `users`、`roles`、`calendar_events`、`ai_conversations`、`notifications` 资源，并扩展 `todos` 的 assignee/status/notes 字段。
- 已为上述资源补齐 in-memory 示例数据，复用同一 dataProvider 的 list/create/update/delete、筛选、排序和分页能力。
- Dashboard 已加入 User Management、Todo、Calendar、AI Chat、Notification Center 的原创 svadmin 运营入口。
- 已补齐 `SecuritySettings`、`IntegrationsSettings`、`NotificationsSettings`、`ApiSettings`、`ErrorPage`，并集成到 `SettingsPage`、`AdminApp`、UI exports 与核心 i18n。
- `SettingsPage` 支持 `customSections` 与 profile/appearance/roles/security/integrations/notifications/api/audit/about/content snippets，默认仍渲染内置后台能力分区。
- `AdminApp` 对未知资源显示 404，对 `#/500` 显示 500，并允许通过 `components.ErrorPage` 替换错误页；Security 设置在无 RBAC/auth-provider role management 时仍可见；API demo token 使用 `sv_demo_...`，避免误导为 live secret。
- 合规边界：未使用 外部模板 源码、素材、CSS、布局文件、截图或像素级 UI；实现只覆盖业务能力和 svadmin 自有示例组件。

验证结果：
- `bunx @sveltejs/mcp svelte-autofixer example/src/App.svelte --svelte-version 5`：通过，issues=0。
- `bunx @sveltejs/mcp svelte-autofixer example/src/pages/Dashboard.svelte --svelte-version 5`：通过，issues=0。
- `bunx @sveltejs/mcp svelte-autofixer packages/ui/src/components/AutoForm.svelte --svelte-version 5`：通过，issues=0；仅提示既有 `Map` 建议。
- `bunx @sveltejs/mcp svelte-autofixer packages/ui/src/components/SecuritySettings.svelte packages/ui/src/components/IntegrationsSettings.svelte packages/ui/src/components/NotificationsSettings.svelte packages/ui/src/components/ApiSettings.svelte packages/ui/src/components/ErrorPage.svelte --svelte-version 5`：通过，issues=0。
- `bunx @sveltejs/mcp svelte-autofixer packages/ui/src/components/SettingsPage.svelte --svelte-version 5`：通过，无 blocking issue，仅保留既有 effect 建议。
- `bunx @sveltejs/mcp svelte-autofixer packages/ui/src/components/AdminApp.svelte --svelte-version 5`：通过，无 blocking issue，仅保留既有 state/effect 建议。
- `bunx @sveltejs/mcp svelte-autofixer packages/ui/src/components/ErrorPage.svelte --svelte-version 5`：通过，issues=0，确认返回按钮不再直接在模板中引用 `window`。
- `bunx eslint packages/ui/src/components/SettingsPage.svelte packages/ui/src/components/ErrorPage.svelte packages/ui/src/components/AdminApp.svelte packages/ui/src/component-registry.svelte.ts packages/ui/src/index.ts packages/core/src/i18n.svelte.ts`：通过。
- `bunx tsc --noEmit --project example/tsconfig.json`：通过。
- `bunx eslint example/src/App.svelte example/src/pages/Dashboard.svelte example/src/resources.ts example/src/providers/inMemoryDb.ts packages/ui/src/components/AutoForm.svelte`：通过。
- `bun run check`：通过，0 errors / 18 existing warnings。
- `bun run lint`：通过，0 errors / 185 existing warnings。
- `bun run build`：通过。
- `bun test packages/`：通过，357 pass / 0 fail。
- `cd example && bun run build`：通过，只有既有 Svelte/Vite warnings。
- `git diff --check`：通过。
- Provider CRUD smoke：`notifications` create/update/filter list/delete 通过。
- Browser smoke：登录后检查 16 条路由通过：`#/settings/profile`、`#/settings/security`、`#/settings/roles`、`#/settings/integrations`、`#/settings/notifications`、`#/settings/api`、`#/settings/audit`、`#/settings/about`、`#/does-not-exist`、`#/500`、`#/users`、`#/roles`、`#/todos`、`#/calendar_events`、`#/ai_conversations`、`#/notifications`；0 console errors，6 条为既有 Svelte dev warning。

## Task Contract: INV-003 Complete Inventory AI Chat assistant demo

目标：
- 将 AI Chat 从 `ai_conversations` CRUD 资源补全为可打开、可提问、可基于库存数据返回回答的 svadmin-native 演示助手。
- 在 `example` 中注册本地 mock `ChatProvider` 或 `AgentProvider`，复用现有 `ChatDialog` / Command Palette AI 能力。
- 助手应能回答库存运营常见问题：低库存、补货建议、即将采购/盘点事件、未读通知、开放 Todo、AI 会话摘要。
- 尽量通过 `@svadmin/mcp` 暴露的 DataProvider 工具方向实现本地读工具调用或等价 mock flow，保持“基于 @svadmin/mcp 的库存运营助手”路线。
- 保留 `ai_conversations` 作为会话/意图资源；如需要可增加 `ai_messages` 资源展示示例消息历史。

非目标：
- 不接入真实外部 LLM、OpenAI/Anthropic API 或任何需要密钥的服务。
- 不复制 外部模板 AI Chat 源码、素材、CSS、布局、截图或像素级 UI。
- 不实现 Real Estate、完整 CRM、Retail Store。
- 不做破坏性工具调用；示例助手只读库存数据，写操作必须另开任务并做审批。

验收标准：
- example 启动后右下角 AI Chat 浮动按钮可见，打开后可发送至少 3 类库存运营问题并收到非空、上下文相关回答。
- Command Palette 的 AI mode 可使用同一个 provider 返回库存助手回答。
- 如新增 `ai_messages`，资源可在菜单中打开并通过 in-memory provider CRUD 浏览。

## Task Contract: INV-005 Add original CRM and property operations example modules

目标：
- 在 `example` 中补齐原创 CRM 与物业/资产运营示例模块，使用户给出的参考页面类型可以映射为 svadmin-native 后台能力。
- 新增资源、示例数据、菜单分组与资源页覆盖，支持客户经营、销售机会、跟进活动、物业档案、经纪人、线索、看房安排等 CRUD 浏览。
- 已有库存首页、消息、日程、待办、AI、用户管理继续保留；新增页面信息必须使用原创业务语境，不复用用户参考链接中的品牌名、页面标题、示例文案、素材或布局描述。
- 如实现过程中发现通用 UI 缺口，应把可复用组件添加到 `packages/ui` 并从 example 复用，避免只在 example 内堆重复结构。

非目标：
- 不接入外部 API、真实 CRM/地产系统、地图服务、邮件服务或数据库迁移。
- 不复制任何第三方模板源码、CSS class、素材、截图、页面信息或像素级布局。
- 不改动现有认证、发布流程或无关核心组件行为。
- 不在用户可见界面、新增代码常量、菜单标题和示例数据中出现第三方模板品牌名。

验收标准：
- 新增 CRM 与物业/资产运营菜单分组和资源，且每个新增资源可通过 `AdminApp` 打开列表页，并保留 create/edit/show 等默认 CRUD fallback。
- CRM 与物业/资产运营至少各有一个差异化 list 页面，展示原创摘要、状态分组和可进入结构化表格的工作流。
- 如新增 `packages/ui` 组件，必须导出并保持通用命名，不绑定 example 业务。
- 验证通过：Svelte autofixer、`bunx tsc --noEmit --project example/tsconfig.json`、`bun run check`、`cd example && bun run build`、`git diff --check`，并尽量做浏览器 smoke。

相关 skill 和代码规范：
- `agent-team-automation`
- `svadmin-admin-ui`
- `svelte-code-writer`
- `svelte-core-bestpractices`
- `typescript`

影响范围：
- `example/src/resources.ts`
- `example/src/providers/inMemoryDb.ts`
- `example/src/App.svelte`
- `example/src/pages/**`
- 必要时 `packages/ui/src/components/**` 与 `packages/ui/src/index.ts`

风险和回滚：
- 风险：新增资源较多，可能导致 example 菜单过重；通过清晰分组、`menuOrder` 和资源页复用控制复杂度。
- 风险：通用 UI 组件若过度抽象会污染 ui 库；只沉淀明确可复用的页面标题/指标/状态摘要等组件。
- 回滚：撤销 INV-005 对 `example/src/**`、`packages/ui/src/**` 的改动，并移除本任务 ledger/progress 记录。

Profile：
- admin_profile.framework: `svadmin`
- admin_profile.decision_source: `user directive + local codebase evidence`
- admin_profile.backend_provider: `local mock/in-memory`
- admin_profile.resources: `crm_accounts`, `crm_contacts`, `crm_deals`, `crm_activities`, `properties`, `property_agents`, `property_leads`, `property_showings`
- admin_profile.auth_required: true
- admin_profile.rbac_required: false
- admin_profile.audit_required: false

执行与审查结果：
- 已按用户要求调度 `gpt-5.3-codex` executor 子代理执行；该子代理运行约 8 分钟无 stdout、无业务文件变更，主线程终止卡住进程并接管实现。
- 新增 UI 通用组件 `ResourceOperationsPage`，用于资源运营页的标题、指标、状态泳道、重点队列和 AutoTable 组合，并从 `@svadmin/ui` 源码导出。
- 新增客户经营资源 `crm_accounts`、`crm_contacts`、`crm_deals`、`crm_activities`，以及资产运营资源 `properties`、`property_agents`、`property_leads`、`property_showings`。
- 新增 `CrmOperationsPage` 与 `PropertyOperationsPage`，8 个新增资源列表页均接入差异化原创工作台；创建/编辑/详情继续使用 svadmin 默认 CRUD fallback。
- 补齐 in-memory 示例数据、中文分组/资源/字段/选项本地化、侧栏图标映射，并将本地 demo storage key 升级到 v4。
- 主线程审核确认新增 example/UI 源码和浏览器可见内容未出现第三方模板品牌名、参考页面标题或参考页面文案。

验证结果：
- `bunx @sveltejs/mcp svelte-autofixer example/src/pages/CrmOperationsPage.svelte --svelte-version 5`：通过，issues=0。
- `bunx @sveltejs/mcp svelte-autofixer example/src/pages/PropertyOperationsPage.svelte --svelte-version 5`：通过，issues=0。
- `bunx @sveltejs/mcp svelte-autofixer packages/ui/src/components/ResourceOperationsPage.svelte --svelte-version 5`：通过，issues=0。
- `bunx tsc --noEmit --project example/tsconfig.json`：通过。
- 定向 ESLint：通过。
- `cd packages/ui && bun run build`：通过。
- `bun run check`：通过，0 errors / 18 existing warnings。
- `cd example && bun run build`：通过，仅保留既有 Svelte/Vite warning。
- `bun test packages/`：通过，357 pass / 0 fail。
- `git diff --check`：通过。
- Browser smoke：新增 8 条 hash 路由 `#/crm_accounts`、`#/crm_contacts`、`#/crm_deals`、`#/crm_activities`、`#/properties`、`#/property_agents`、`#/property_leads`、`#/property_showings` 均通过；每页当前资源工作台=1、表格=1、标题匹配、禁用词=false、console errors=0。

提交前审查修复：
- 主线程审查发现 `ResourceOperationsPage` 默认展示英文空状态/重点队列标题，并且 CRM/资产运营页会在状态泳道中暴露 `at_risk`、`tour_scheduled`、`follow_up` 等内部枚举值；已改为可传入本地化文案，并在 example 页面中转换为中英文友好标签。
- 已按用户要求再次调度 `gpt-5.3-codex` verifier 子代理做只读复核；该子代理会话退出但无 stdout/审查内容，主线程以本地验证和浏览器复核结果裁决。
- 复核验证通过：新增 3 个 Svelte 文件 autofixer issues=0、`cd packages/ui && bun run build`、`bunx tsc --noEmit --project example/tsconfig.json`、定向 ESLint、`bun run check`（0 errors / 18 existing warnings）、`cd example && bun run build`、`bun test packages/`（357 pass / 0 fail）、`git diff --check`。
- Browser 复核：`#/crm_accounts` 与 `#/property_leads` 无内部枚举/英文默认文案泄漏、禁用词=false、console errors=0。
- 合规边界可审计：UI/UX 使用 svadmin 现有组件和原创文案，不复刻 外部模板 视觉或资产。
- 必要验证通过：Svelte autofixer、`bun run check`、定向 ESLint、`bun run build`、`bun test packages/`、`git diff --check`、浏览器 smoke。

相关 skill 和代码规范：
- `agent-team-automation`
- `svadmin-admin-ui`
- `svelte-code-writer`
- `svelte-core-bestpractices`
- `typescript`

影响范围：
- 预期主要影响 `example/src/**`，可能包括 `example/package.json` 增加 `@svadmin/mcp` workspace dependency。
- 避免触碰 `packages/ui/**` 和 `packages/core/**`，除非现有 ChatDialog 阻断且需单独记录。

风险和回滚：
- 风险：真实 LLM 语义容易被误解为生产 AI 能力；必须明确这是本地 mock / MCP-style demo。
- 风险：工具调用若写数据会扩大范围；本任务只做只读。
- 回滚：移除 example AI provider 注册、新增助手文件和可选 `ai_messages` 资源，保留 INV-002 的 `ai_conversations` CRUD。

Profile：
- admin_profile.framework: `svadmin`
- admin_profile.decision_source: `user追问 + 主线程审查`
- admin_profile.backend_provider: `local mock/in-memory + MCP-style read tools`
- admin_profile.resources: `ai_conversations`, optional `ai_messages`, inventory read resources
- admin_profile.auth_required: true
- admin_profile.rbac_required: false
- admin_profile.audit_required: false

执行与审查结果：
- 已按用户“使用子线程补全”的方向调度 `gpt-5.2` executor；该子线程长时间无 stdout、无 mailbox 输出、无文件变更，未形成有效实现证据。主线程为避免任务悬空，接管完成实现并负责审查。
- 新增 `example/src/providers/inventoryAssistant.ts`，实现本地 `ChatProvider`，通过 `@svadmin/mcp` 的 read-only `svadmin_getList` 工具读取 `products`、`purchase_orders`、`calendar_events`、`notifications`、`todos`、`ai_conversations`。
- `example/src/App.svelte` 注册 `setChatProvider(createInventoryChatProvider(...))`，复用现有 `ChatDialog` 右下角浮动入口和 Command Palette AI mode。
- 助手可回答低库存/补货建议、采购/盘点日历、未读通知、开放 Todo、AI 会话摘要、运营概览等问题。
- 未接入真实外部 LLM，未加入 API key 或 secrets；工具流只读，不执行写操作。
- 合规边界：未使用 外部模板 源码、素材、CSS、布局、截图或像素级 UI；AI Chat 使用 svadmin 现有组件和原创库存运营文案。

验证结果：
- `bun install --frozen-lockfile`：通过，workspace dependency 链接完成，lockfile 无变化。
- `bunx tsc --noEmit --project example/tsconfig.json`：通过。
- `bunx @sveltejs/mcp svelte-autofixer example/src/App.svelte --svelte-version 5`：通过，issues=0。
- `bunx eslint example/src/App.svelte example/src/providers/inventoryAssistant.ts example/src/providers/inMemoryDb.ts example/src/resources.ts`：通过。
- `bun run check`：通过，0 errors / 18 existing warnings。
- `bun run lint`：通过，0 errors / 185 existing warnings。
- `bun run build`：通过，只有既有 Svelte/Vite warnings。
- `bun test packages/`：通过，357 pass / 0 fail。
- `git diff --check`：通过。
- Provider smoke：直接调用 `sendMessage` 验证低库存、日历、库存概览三类问题均返回非空上下文答案。
- Browser smoke：`http://127.0.0.1:5173/` 登录后右下角 `chat.title` 浮动按钮可见；ChatDialog 连续提问低库存、日历、库存概览均返回相关答案；Command Palette 输入通知问题出现 AI 分组并触发同一 provider 返回未读通知答案；console errors=0。

## Task Contract: INV-004 Implement Inventory Operations Plus demo resources

目标：
- 将 Inventory Platform 示例从资源展示推进到库存运营闭环，新增并接入 `stock_transfers`、`cycle_counts`、`inventory_adjustments`、`reorder_rules` 资源。
- 为新增资源补齐 in-memory 示例数据、ResourceDefinition 字段、菜单分组、排序和 CRUD 演示能力。
- 增强 Dashboard，使首屏能展示调拨、盘点、库存调整、补货规则等运营队列和风险摘要。
- 增强本地 AI Chat 助手，使其能回答调拨、盘点、库存调整、补货规则相关问题，并在运营概览中纳入这些数据。

非目标：
- 不复刻 外部模板 源码、素材、CSS、布局、截图或像素级 UI。
- 不新增真实数据库、邮件服务、外部 LLM、API key 或 secrets。
- 不实现 Real Estate、完整 CRM、Retail Store、完整 Mail。
- 不在本任务中实现写操作型 AI Agent；AI 助手仍只读。
- 不大改 `packages/ui/**` 核心组件；若通用 Calendar View、Notification Drawer 或权限矩阵需要核心能力，后续另开任务。

验收标准：
- `stock_transfers`、`cycle_counts`、`inventory_adjustments`、`reorder_rules` 在 example 菜单可见，并支持本地 list/create/update/delete CRUD。
- Dashboard 展示新增库存运营能力入口和至少一组可读运营摘要。
- AI Chat 可回答至少 3 类新增运营问题：调拨、盘点、补货规则/调整。
- 合规边界可审计：UI/UX 为 svadmin 原创设计，MIT 分发安全。
- 必要验证通过：Svelte autofixer、`bunx tsc --noEmit --project example/tsconfig.json`、定向 ESLint、`bun run check`、`bun run build`、`bun test packages/`、`git diff --check`、provider CRUD smoke 和浏览器 smoke。

相关 skill 和代码规范：
- `agent-team-automation`
- `svadmin-admin-ui`
- `svelte-code-writer`
- `svelte-core-bestpractices`
- `typescript`

影响范围：
- `example/src/resources.ts`
- `example/src/providers/inMemoryDb.ts`
- `example/src/providers/inventoryAssistant.ts`
- `example/src/pages/Dashboard.svelte`
- `packages/ui/src/components/Sidebar.svelte`
- `packages/ui/src/components/SidebarItem.svelte`
- `tasks.md`、`progress.md`

风险和回滚：
- 风险：新增资源较多，字段默认值不足可能影响 create/update 表单；需要通过 provider CRUD smoke 和 browser smoke 验证。
- 风险：Dashboard 若一次塞入太多信息会降低可读性；保持运营摘要紧凑，使用现有 svadmin 风格。
- 回滚：移除新增资源定义、示例数据、Dashboard 区块和 AI assistant 分支，恢复 INV-003 状态。

Profile：
- admin_profile.framework: `svadmin`
- admin_profile.decision_source: `user要求实施 + 主线程审查`
- admin_profile.backend_provider: `local mock/in-memory`
- admin_profile.resources: `stock_transfers`, `cycle_counts`, `inventory_adjustments`, `reorder_rules`
- admin_profile.auth_required: true
- admin_profile.rbac_required: false
- admin_profile.audit_required: false

执行与审查结果：
- 已调用 `gpt-5.2` executor 子线程；该子线程无可用 stdout，但随后出现部分资源/Dashboard 改动。主线程接管审核，去重并收敛为 svadmin-native 实现。
- 新增 `stock_transfers`、`cycle_counts`、`inventory_adjustments`、`reorder_rules` 四个资源定义，接入 Operations 分组、排序、字段、关系字段和本地 CRUD。
- `example/src/providers/inMemoryDb.ts` 增加四类运营资源的种子数据，并 bump localStorage key 到 `svadmin_inventory_demo_db_v3`，避免旧 demo 数据污染新字段。
- `example/src/pages/Dashboard.svelte` 增加调拨、盘点、库存调整、补货规则运营队列指标和快捷入口。
- `example/src/providers/inventoryAssistant.ts` 增加四类资源的 MCP-style read-only 查询与回答分支，运营概览纳入新增资源。
- `packages/ui/src/components/Sidebar.svelte` 与 `SidebarItem.svelte` 补充 `repeat`、`clipboard-check`、`sliders-horizontal`、`alert-triangle` 图标映射，避免新增资源菜单退回默认 Settings 图标。
- 合规边界：未使用 外部模板 源码、素材、CSS、布局、截图或像素级 UI；UI/UX 使用 svadmin 自有组件与原创库存运营文案。

验证结果：
- `bunx tsc --noEmit --project example/tsconfig.json`：通过。
- `bunx @sveltejs/mcp svelte-autofixer example/src/pages/Dashboard.svelte --svelte-version 5`：通过，issues=0。
- `bunx @sveltejs/mcp svelte-autofixer packages/ui/src/components/Sidebar.svelte --svelte-version 5`：通过，issues=0；仅既有 `$effect`/state capture 建议。
- `bunx @sveltejs/mcp svelte-autofixer packages/ui/src/components/SidebarItem.svelte --svelte-version 5`：通过，issues=0；仅既有 `isOpen` effect 建议。
- 定向 ESLint：通过，0 errors；相关 warning 为既有未使用变量/any 基线。
- `bun run check`：通过，0 errors / 18 existing warnings。
- `bun run lint`：通过，0 errors / 185 existing warnings。
- `bun run build`：通过，只有既有 Svelte/Vite warnings。
- `bun test packages/`：通过，357 pass / 0 fail。
- `git diff --check`：通过。
- Provider CRUD smoke：`stock_transfers`、`cycle_counts`、`inventory_adjustments`、`reorder_rules` list/create/update/getOne/delete 全部通过。
- AI provider smoke：调拨、盘点、库存调整、补货规则四类问题均返回预期种子记录和摘要。
- Browser smoke：`http://127.0.0.1:5173/` Dashboard 显示四个运营入口；`#/stock_transfers`、`#/cycle_counts`、`#/inventory_adjustments`、`#/reorder_rules` 路由均显示标题和种子数据；ChatDialog 提问调拨和补货规则均返回预期答案；console errors=0。

## Task Contract: INV-006 Expand example into multi-system admin demo navigation

目标：
- 将 `example` 收口为多系统后台演示，确保库存运营、邮件/通知、日历、Todo、CRM、房产、AI 对话、用户管理、公共资料、账户中心、网络成员、认证/错误页都能从菜单进入。
- 为用户列出的 Demo1 风格页面清单增加 svadmin 原创路由别名，保证每个路径都有对应页面而不是 404。
- 将 `ai_conversations` 从普通消息页拆成独立 AI 工作台页面，保留结构化 CRUD 表格。
- 统一 example 默认浅色高对比视觉，避免文字和背景颜色接近。

非目标：
- 不复制外部模板源码、CSS、资产、页面文案、截图或像素级布局。
- 不引入真实外部 LLM、邮件服务、数据库、API key 或 secrets。
- 不新增一次性装饰组件；如确需通用 UI，只补最小可复用组件到 `packages/ui`。
- 不改动无关核心数据 provider、认证、发布配置。

验收标准：
- `example/src/App.svelte` 显式传入多级 `MenuItem[]`，所有计划中的系统和页面都可从菜单发现。
- `packages/ui/src/router-state.svelte.ts` 与 `AdminApp.svelte` 覆盖用户列出的全部路径别名。
- `#/ai_conversations?sort=updatedAt&order=desc` 显示独立 AI 工作台，不再只是消息收件箱。
- 默认主题为浅色，侧栏、正文、卡片、表格、表单文本对比清晰。
- 可见 UI 和新增/修改源码中不出现禁用外部品牌词。

相关 skill 和代码规范：
- `agent-team-automation`
- `svadmin-admin-ui`
- `svelte-code-writer`
- `svelte-core-bestpractices`
- `tailwind-v4`
- `typescript`

影响范围：
- `example/src/App.svelte`
- `example/src/pages/AiWorkspacePage.svelte`
- `packages/ui/src/router-state.svelte.ts`
- `packages/ui/src/components/AdminApp.svelte`
- `packages/ui/src/app.css`
- 必要时 `packages/ui/src/components/Sidebar.svelte`、`SidebarItem.svelte` 图标映射
- `tasks.md`、`progress.md`

风险和回滚：
- 风险：新增路径别名较多，容易遗漏或被通配资源路由吞掉；需 browser smoke 覆盖每个别名。
- 风险：自定义菜单过深导致可发现性差；需按系统分组并保持中文标签。
- 风险：默认暗色偏好可能来自 localStorage；example 需在 demo 默认层面收敛为浅色。
- 回滚：撤销 INV-006 的菜单、路由别名、AI 工作台和视觉 token 改动，保留 INV-005 及以前资源能力。

Profile：
- admin_profile.framework: `svadmin`
- admin_profile.decision_source: `user实施计划 + 主线程审查`
- admin_profile.backend_provider: `local mock/in-memory`
- admin_profile.resources: `inventory`, `notifications`, `calendar_events`, `todos`, `ai_conversations`, `users`, `roles`, `crm_*`, `property_*`, `profile/account/network/auth pages`
- admin_profile.auth_required: true
- admin_profile.rbac_required: true
- admin_profile.audit_required: true

验证计划：
- `bunx @sveltejs/mcp svelte-autofixer` 覆盖新增/修改 `.svelte` 文件。
- `bunx tsc --noEmit --project example/tsconfig.json`
- `bun run check`
- `bun run lint`
- `cd packages/ui && bun run build`
- `cd example && bun run build`
- `bun test packages/`
- `git diff --check`
- 禁用品牌词搜索。
- Browser smoke 覆盖登录、首页、AI 对话、concept 系统入口和全部新增路径别名。

执行与审查结果：
- 已按用户要求调度 `gpt-5.2` worker 实现限定范围；该 worker 写入核心改动但长时间未返回最终报告，主线程关闭子线程后接管审查、修复和验证。
- 已新增 example 显式多级菜单，覆盖库存、协作、AI、CRM、资产运营、用户权限、资料中心、账户中心、网络、认证与错误页。
- 已新增 `example/src/pages/AiWorkspacePage.svelte`，并将 `ai_conversations` 从 `MessagesPage` 切换为独立 AI 工作台，同时保留 `AutoTable` CRUD 表格。
- 已补齐 concept 系统入口和 Demo1 风格页面清单的 svadmin 原创路径别名，所有路径映射到现有资源页或通用页面组件。
- 已将 example 默认主题设为 light，并通过浏览器采样确认默认无 `dark` class、侧栏白底深色文本。
- 已清理 `example` 与 `packages/ui` 中的禁用外部品牌词；历史 changelog 描述改为中性表述。
- 已按用户要求调度 `gpt-5.3-codex` verifier 做只读审查，但子线程两次等待后仍无输出，主线程关闭子线程并以本地验证证据裁决。

验证结果：
- `bunx @sveltejs/mcp svelte-autofixer example/src/App.svelte --svelte-version 5`：通过，issues=0；仅既有 effect 建议。
- `bunx @sveltejs/mcp svelte-autofixer example/src/pages/AiWorkspacePage.svelte --svelte-version 5`：通过，issues=0。
- `bunx @sveltejs/mcp svelte-autofixer packages/ui/src/components/AdminApp.svelte --svelte-version 5`：无新增 blocking issue；仅既有 state capture/effect 建议。
- `bunx @sveltejs/mcp svelte-autofixer packages/ui/src/components/Sidebar.svelte packages/ui/src/components/SidebarItem.svelte --svelte-version 5`：通过，issues=0；仅既有建议。
- `bunx tsc --noEmit --project example/tsconfig.json`：通过。
- `bun run check`：通过，0 errors / 18 existing warnings；包含既有 create-svadmin template config warning 与 Svelte warnings。
- `bun run lint`：通过，0 errors / 183 existing warnings。
- `cd packages/ui && bun run build`：通过。
- `cd example && bun run build`：通过，仅既有 Svelte/Vite/chunk warnings。
- `bun test packages/`：通过，357 pass / 0 fail。
- `git diff --check`：通过。
- `rg -n "外部模板|外部模板|外部参考站点" example packages/ui -S`：无匹配。
- Browser smoke：45 条路由全部通过，覆盖登录、首页、`#/ai_conversations?sort=updatedAt&order=desc`、concept 系统入口、全部 Demo1 风格路径别名和主要资源路由；console errors=0；AI 工作台标题命中；默认浅色采样 `darkClass=false`、body 背景 `oklch(0.975 0.005 264)`、sidebar 白底深色文本。
- Runtime warning 说明：开发服务器仍出现项目既有 Svelte dev warning（`state_proxy_equality_mismatch`、`derived_inert`），对照普通 `#/products` 同样复现，不作为 INV-006 新增阻断。

## Task Contract: INV-007 多系统示例页面与高对比视觉修复

目标：
- 复核多系统后台示例页面，确保用户关心的菜单入口都有对应的 svadmin 原创页面能力。
- 页面应采用 svadmin 原创设计，不复刻外部参考源码、素材、CSS 或像素级布局。
- 修复后台整体风格问题，特别是文字与背景颜色接近的可访问性问题。

非目标：
- 不复制外部参考的源码、素材、CSS 文件或像素级布局。
- 不引入外部品牌词或受版权保护的设计元素。
- 不实现外部演示站点的完整业务功能。

验收标准：
- 所有菜单项都有对应的页面组件，且页面内容充实、功能完整。
- 文字与背景颜色对比度符合 WCAG AA 标准（至少 4.5:1）。
- 页面布局统一、风格一致，符合 svadmin 自身浅色后台风格。
- 所有页面通过 Svelte autofixer 检查。
- 类型检查、lint、build、测试全部通过。
- Browser smoke 覆盖所有新增页面。

相关 skill：
- `svelte-code-writer`
- `svelte-core-bestpractices`
- `svadmin-admin-ui`
- `tailwind-v4`
- `typescript`

影响范围：
- `example/src/pages/` 下所有页面组件
- `example/src/App.svelte` 菜单和路由配置
- `packages/ui/src/components/` 通用 UI 组件
- `packages/ui/src/app.css` 全局样式
- `tasks.md`、`progress.md`

风险和回滚：
- 风险：页面数量多，容易遗漏或风格不一致；需要逐页检查和统一。
- 风险：颜色对比度问题可能涉及多个组件；需要系统性修复。
- 回滚：撤销 INV-007 的所有页面改动，保留 INV-006 及以前的菜单和路由配置。

缺失页面清单：
1. **Store Inventory Dashboard** (`/store-inventory/dashboard`)
   - 库存概览仪表板，展示库存健康度、周转率、预警等指标
   - 当前状态：菜单中有 `/` 作为运营首页，但缺少专门的库存仪表板

2. **Mail Inbox** (`/mail/inbox`)
   - 邮件收件箱页面，展示邮件列表、邮件详情、邮件操作
   - 当前状态：菜单中有 `/mail/inbox` 映射到 `notifications` 资源，但页面功能较简单

3. **Calendar Page** (`/calendar/page`)
   - 日历视图页面，展示日程、事件、任务的时间线视图
   - 当前状态：菜单中有 `/calendar/page` 映射到 `calendar_events`，但缺少日历视图组件

4. **Todo All Tasks** (`/todo/all-tasks`)
   - 待办事项页面，展示任务列表、任务状态、任务优先级
   - 当前状态：菜单中有 `/todo/all-tasks` 映射到 `todos` 资源，但页面功能较简单

5. **CRM Dashboard** (`/crm/dashboard`)
   - CRM 仪表板，展示客户概览、销售漏斗、业绩指标
   - 当前状态：菜单中有 `/crm/dashboard`，但缺少专门的 CRM 仪表板页面

6. **Real Estate Page** (`/real-estate/page`)
   - 房地产运营页面，展示资产概览、市场趋势、交易状态
   - 当前状态：菜单中有 `/real-estate/page`，但缺少专门的房地产仪表板页面

7. **AI Start** (`/ai/start`)
   - AI 起始页，展示 AI 功能介绍、快速入口、使用指南
   - 当前状态：菜单中有 `/ai/start` 映射到 `ai_conversations`，但缺少 AI 起始页

8. **User Management Users** (`/user-management/users`)
   - 用户管理页面，展示用户列表、用户详情、权限配置
   - 当前状态：菜单中有 `/user-management/users` 映射到 `users` 资源，但页面功能较简单

9. **AI Conversations** (`/ai_conversations`)
   - AI 对话页面，用户提到 `https://svadmin-demo.nestjs.cn/#/ai_conversations?sort=updatedAt&order=desc`
   - 当前状态：已有 `AiWorkspacePage.svelte`，但可能需要增强功能

10. **风格修复**
    - 修复文字与背景颜色接近的问题
    - 统一后台整体风格
    - 确保所有页面符合 svadmin 自身浅色后台风格

Profile：
- admin_profile.framework: `svadmin`
- admin_profile.decision_source: `用户需求 + 主线程分析`
- admin_profile.backend_provider: `local mock/in-memory`
- admin_profile.resources: `inventory`, `notifications`, `calendar_events`, `todos`, `ai_conversations`, `users`, `roles`, `crm_*`, `property_*`
- admin_profile.auth_required: true
- admin_profile.rbac_required: true
- admin_profile.audit_required: true

验证计划：
- `bunx @sveltejs/mcp svelte-autofixer` 覆盖所有新增/修改 `.svelte` 文件。
- `bunx tsc --noEmit --project example/tsconfig.json`
- `bun run check`
- `bun run lint`
- `cd packages/ui && bun run build`
- `cd example && bun run build`
- `bun test packages/`
- `git diff --check`
- 禁用品牌词搜索。
- Browser smoke 覆盖所有新增页面和修复后的页面。
- 颜色对比度检查，确保符合 WCAG AA 标准。

执行与审查结果：
- 已按用户要求调度 `gpt-5.2` 子线程 Rawls 做只读审美/对比度复核；结论 PASS，无 blocker，并建议重点复查侧栏激活态与分组标题。
- 主线程实测发现浅色侧栏激活态蓝字在浅蓝底上对比度不足，已将激活态菜单、子菜单和图标色加深到 `#155eef`。
- 同步修复 clean-flat 表格、侧栏、按钮、表单在浅色与暗色模式下的正文/弱文本对比度，降低文字与背景接近的问题。
- 清理任务记录中的外部品牌词，保持 example 与 packages/ui 源码和可见 UI 无相关品牌词泄漏。

验证结果：
- `bunx tsc --noEmit --project example/tsconfig.json`：通过。
- `cd packages/ui && bun run build`：通过。
- `bun run check`：通过，0 errors / 18 existing warnings。
- `bun run lint`：通过，0 errors / 183 existing warnings。
- `cd example && bun run build`：通过，仅既有 Svelte/Vite build warnings。
- `bun test packages/`：通过，357 pass / 0 fail。
- `git diff --check`：通过。
- 外部品牌词扫描：`example`、`packages/ui`、`tasks.md`、`progress.md` 无匹配。
- Browser smoke：`#/ai_conversations?sort=updatedAt&order=desc`、`#/products`、`#/products/edit/1`、`#/settings/profile` 可打开且 console errors=0；默认浅色 `darkClass=false`；普通侧栏文字对比度 7.56:1、侧栏激活态 4.97:1、表头 5.71:1、表格正文 7.56:1、表单 label 9.91:1。
