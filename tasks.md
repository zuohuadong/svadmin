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

## Task Contract: INV-001 Implement Inventory Platform example

目标：
- 将 `example` 从 JSONPlaceholder 通用 demo 扩展为可运行的 Inventory Platform 示例。
- 新增或接入本地示例数据，支持 `products`、`skus`、`categories`、`suppliers`、`warehouses`、`stock_movements`、`purchase_orders`、`sales_orders` 等资源的 CRUD 浏览。
- 更新 dashboard，使首屏体现库存、订单、供应商、仓库、近期库存动作等业务信息。

非目标：
- 不复刻 Metronic 源码、素材、CSS、布局文件、视觉资产或像素级 UI。
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
- 最终裁决：不在 svadmin 中复刻 Metronic 的 Public Profile / Gamer Profile / Company Profile / Projects / Team / User Profile / Account/Billing/Security/Teams/Auth/Error/Integration 页面；这些只能作为后台能力清单参考，不能复制 Metronic 源码、素材、CSS、布局文件或像素级 UI。P0 接受 svadmin-native Inventory Platform 示例。

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
- 将用户粘贴的 Metronic 页面清单裁决为后台能力参考，而不是模板复刻：补齐 svadmin-native Account/Security/Team/RBAC/Integrations/Notifications/API/Audit/Error 等通用后台能力。
- 每个能力必须体现为 svadmin 原创资源、示例数据、可浏览 CRUD 或核心 UI 组件，不复刻 Metronic 资产、源码、CSS、布局文件或像素级 UI。
- Dashboard 可展示这些模块的运营入口，但优先保证资源定义、dataProvider 和核心 settings/admin UI 闭环。

非目标：
- 不纳入 Real Estate、完整 CRM、Retail Store。
- 不引入 Metronic / Envato 模板素材、截图切片、CSS class 或布局结构。
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
- 合规边界：未使用 Metronic 源码、素材、CSS、布局文件、截图或像素级 UI；实现只覆盖业务能力和 svadmin 自有示例组件。

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
