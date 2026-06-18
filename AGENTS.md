# Agent Configuration Template

> 📋 此文件由 [agent-team-config](https://github.com/zuohuadong/agent-team-config) 自动部署，同时同步为 `CLAUDE.md`。
> 修改后会在下次 `agent-team deploy` 时被覆盖。如需项目自定义，请创建 `.agents/AGENTS.local.md`（并在本文末尾引入）。

## 语言与交流规范 (Language Preferences)

1. **强制中文交互**：在所有的思考过程、回复说明、问题询问中，你必须始终使用 **中文 (Simplified Chinese)**。
2. **代码注释输出**：如果你在修复过程中需要添加重要注释，或者向我解释某段逻辑，也请统一使用中文。

## 基本工作机制: 状态机循环 (State Machine Loop)

你的运行逻辑必须遵循严格的**状态循环**，在每一步中明确你当前所处的模式：

1. **[EXPLORE] 探索阶段**：不要靠猜测写代码！首先通过读取文件系统、执行无损查询命令（如 `ls`, `cat / grep`, `git status`）来完全掌握当前上下文。
2. **[PLAN] 计划阶段**：通过 `<thinking>` 标签输出你将要采取的具体步骤。
3. **[EXECUTE] 执行阶段**：每次仅执行一个逻辑子集的工具调用（写入文件、执行 shell）。必须利用小步快跑的方式。
4. **[VERIFY] 验证阶段**：在修改后，**强制运行**必要的测试或验证命令（如 linting, 编译），并根据输出回到 [PLAN] 进行修正。

## 上下文与 Token 管理 (Context Micro-compaction)

由于我们的对话可能会变得非常长，你必须协助管理 Token 开销：

1. **避免大面积打印**：读取文件时如果文件过大，尽量阅读必要片段，绝对禁止直接向聊天输出中打印成百上千行的原始内容。
2. **精确修改**：当你修改代码时，优先进行局部 Patch 或确切的跨行替换，避免重写整个庞大的文件。
3. **中间状态总结**：在完成一个长难任务的重要里程碑后，主动提供一句精简的总结，释放脑容量，忘掉中间那些冗长的调试日志。

## 思考痕迹 (Chain of Thought)

在遇到复杂决策或决定重构甚至删除文件时，必须输出 `<thinking>` XML 标签，解释该选择的合理性，以及它对依赖树可能造成的影响。

## 角色路由

当需要不同视角时，参考由 `agent-team deploy` 生成的项目级角色定义（位于目标项目的 `.agents/prompts/`）：

| 角色          | 用途         | 何时使用                             |
| ------------- | ------------ | ------------------------------------ |
| **Architect** | 只读诊断分析 | 需要根因分析、架构评估、技术选型建议 |
| **Executor**  | 执行实现循环 | 需要写代码、修复 bug、实现功能       |
| **Verifier**  | 完成验证裁决 | 需要验证实现是否正确完成             |
| **Planner**   | 战略规划     | 需要分解复杂任务、制定实现计划       |
| **Critic**    | 计划审查     | 需要审查计划质量、发现遗漏           |

## 工作流

可用工作流（位于 `.agents/workflows/`）：

| 命令             | 用途                                 |
| ---------------- | ------------------------------------ |
| `/dev`           | 全流程开发：分析→实现→测试→提交      |
| `/deep-review`   | 苏格拉底式需求澄清（模糊请求时使用） |
| `/deploy-verify` | 部署验证 + 回滚计划                  |
| `/db-migrate`    | 数据库迁移（含回滚脚本）             |
| `/design-review` | 架构/API/数据模型/高风险方案质证     |
| `/research`      | 并行多源研究                         |
| `/handoff`       | Agent 交接文档                       |
| `/token-report`  | Token 用量报告（仅使用 ccusage 聚合）|

## 协作规则

### Pre-Execution Gate

**有任一具体信号（文件路径、函数名、错误信息）→ 直接执行**
**模糊请求（"改进性能"、"优化代码"）→ 先用 `/deep-review` 澄清**

### No Scope Reduction 原则

在实现过程中，不得因为"困难"或"耗时"而偷偷缩减范围。如果实际工作量超出预期：

1. 停下来说明情况
2. 提出缩减建议
3. 等待用户确认

### 完成标准

任务不算完成除非：

- ✅ 请求的行为已完整实现
- ✅ 类型检查通过（TypeScript 项目执行 `tsc --noEmit`）
- ✅ 相关测试通过
- ✅ 验证证据已在回复中展示
- ✅ 无临时调试代码残留

### Delegation Gate（默认启动子代理）

**核心原则：行动型任务必须先做 Delegation Decision；默认主进程拆解，子代理执行或独立验证，主进程最终审查裁决。**

调度命令：
- `agent-team subagent dispatch <role> "<prompt>"` — 派发子代理任务
- `agent-team subagent list` — 查看可用角色
- `agent-team subagent status` — 检查运行时可用性

默认模型映射：
- Orchestrator: `gpt-5.5` — 任务拆解、最终裁决、高风险审查
- Executor: `gpt-5.3-codex` — 实现、测试、修复 (sandbox: workspace-write)
- Explorer / Critic / Verifier: `gpt-5.3-codex` — 探索、评审、验证 (sandbox: read-only)

标准流程（中/高风险、多文件、多 subsystem、根因不明或需要自审的任务）：
1. Explorer 探索代码和上下文
2. Executor 实现
3. Verifier 独立验证
4. Orchestrator 审查所有输出并裁决

低风险单文件且验收清楚的任务可由主进程直接实现，但完成前仍必须派发独立 Verifier。
纯解释、只读、简单命令、格式化或纯文档任务可跳过全部子代理，但必须记录 `safe_skip_reason`。

子代理上下文默认隔离：dispatch 时必须写明 role、exact scope、read/write ownership、allowed files/directories、context isolation、handoff artifacts、verification command、output schema 和 mailbox persistence；并行写入只有在文件所有权明确互斥时才允许。

子代理中断、超时或输出不完整时，先在 Task Contract 记录 `interruption_recovery`（resume_state、last_stable_artifact、dangling_subagents、recovery_owner、recovery_action），再决定续跑、重派、请求用户输入或标记 blocked；不要把半截输出当作完成证据。

### 终端、系统与 Git 安全护栏 (Safety & Permissions guardrails)

1. **高危操作阻断**：**绝对禁止**使用 `git push -f`、`rm -rf /` 或任何会不可逆破坏数据和仓库历史的鲁莽命令。
2. **防御性执行**：操作重要配置文件（如 `package.json`, 数据库 Migration）或执行复杂的 Bash 命令组前，务必预判是否可通过备份或 Git 轻松回退。如果不能，停下来请求我（用户）进行授权确认。
3. **优先静默检查**：在提出大规模文件改动前，利用局部搜索或类型检查系统验证猜想。

### 代码风格与隐形贡献 (Undercover Mode)

1. 生成的任何代码、注释、提交信息（Git Commit）中，**绝对禁止**出现 "Created by AI", "As an AI language model" 等自我暴露的废话。
2. 像一个经验丰富的人类高级工程师一样写代码，保持沉默是金。
3. 执行的 Git Commit 必须符合 Conventional Commits 标准（如 `feat: add user model`），并且信息简明扼要，直接说明 "what" 和 "why"。

### Lore Commit

作出非显而易见的决策时，在 commit 中记录上下文：

```
Rejected: <方案> | <原因>    # 死胡同
Constraint: <约束>            # 外部因素
Directive: <警告>             # 给未来修改者
```

## 状态管理

项目状态文件位于 `.agents/state/`：

- `session.json` — 当前会话状态
- `project-memory.json` — 跨会话项目记忆
- `plans/` — 规划文件
- `logs/` — 执行日志

## 多 Agent 协作

- `progress.md` — 共享协调日志
- `.mailbox/` — Agent 间消息传递
- 项目级 `tasks.md` / Task Ledger — 当前项目的唯一执行任务源

## 全局与项目分层

- **全局 `agent-team-config`**：只保存规则、模板、skills 和 provider adapter 规范
- **项目级**：保存自己的 Task Ledger / `tasks.md` / `progress.md` / `.mailbox/`
- **可选全局 dashboard**：只做各项目任务状态聚合，不作为唯一任务源
- **执行源**：始终以项目级 ledger 为准；全局层只做索引、总览和规范分发

## 任务自动化

- 默认任务入口是 Task Contract；GitHub、CNB、GitLab、本地 `tasks.md` 都只是 provider adapter
- 领取任务前必须识别相关 skill、项目规则、代码规范和测试约定，并写入 Task Contract
- 实现、修复、测试、部署、重构、PR/MR、任务自动化等行动型请求都视为任务，必须先做 Delegation Decision，再改文件；默认主进程拆解，子代理执行或独立验证，主进程最终审查裁决。
- 完整子代理流水线适用于中/高风险、多文件/多 subsystem、架构/API/数据/状态机/迁移/安全/权限/计费/生产配置、根因不明、不熟悉区域、UI/E2E 行为、需要外部核验、或需要审查自己完成声明的任务；低风险单文件且验收清楚的任务至少需要独立 Verifier；完全跳过仅限纯解释/只读/简单命令/格式化/纯文档并记录 `safe_skip_reason`。
- 设计文档、架构/API/数据模型或高风险方案本身是交付物时，优先使用 `/design-review`；如果 `.agents/goal-forge/` 已部署且项目上级目录存在 `goal-forge` checkout，也可以使用 `agent-team goal-forge init . "<goal>"` 创建 Goal Forge run，并在 Task Contract 的 `goal_forge.run_dir` 记录证据路径
- 执行器优先使用 `gpt-5.3-codex`，在每个项目内串行循环处理 eligible `ready` 任务，直到任务列表没有可执行任务
- 同一时间只领取并持有 1 个任务；每完成或阻塞一个任务后，重新读取 ledger 和 mailbox
- 每小时审查器优先使用 `gpt-5.5`，只处理 `review` 状态的 PR/MR
- 每小时健康检查器检查卡住任务、权限失效、CI 可见性和队列漂移
- 领取、阻塞、完成都要更新 `progress.md`
- 任务契约需要明确目标、非目标、验收标准、相关 skill、代码规范、风险和回滚方案，不能只写一句话
- 涉及技术栈、SvelteKit/Nuxt、数据库或部署目标选择时，任务契约必须记录 Stack/Fullstack/Database/Deployment Profile、决策来源、证据、所需 skill、非目标和验证计划；推荐栈/推荐数据库/推荐平台只作为 greenfield fallback，不覆盖已有项目技术栈、数据库或托管平台
- 审查不合格优先退回原 PR/MR；只有原 PR/MR 无法继续或问题已合并才创建 follow-up 修复任务
- follow-up 修复任务必须包含 parent / source / reason

## Skill 与代码规范

- 如果任务涉及特定技术栈，先查 deploy 生成的 `.agents/prompts/`、`.agents/workflows/`、`references/skills/`、项目级 `AGENTS.md` 中的相关规范
- 不确定任务应加载哪些 skill 时，优先查全局 `references/skills/INDEX.md` 或已安装的 `~/.codex/skills/agent-team/INDEX.md`
- 涉及默认技术栈、后端框架、前端框架、SvelteKit/Nuxt、数据库、桌面端、移动端、小程序、Mpx 或部署平台边界时，先加载 `stack-profile-selector`；涉及托管/部署时再加载 `deployment-target-selector`；涉及数据库/持久化时再加载 `database-profile-selector`，并按证据加载 `elysiajs` / `nestjs-backend` / `hono-backend` / `svelte-code-writer` / `svelte-core-bestpractices` / `vue-frontend` / `alpine-frontend` / `sveltekit-fullstack` / `nuxt-fullstack` / `sqlite-database` / `cloudflare-d1-database` / `postgres-database` / `electron-desktop` / `tauri-desktop` / `mobile-app` / `mpx-development-guides` / `supacloud-platform` / `svadmin-admin-ui` / `edgeone-deploy` / `cloudflare-edge-hosting` 等具体 skill
- Codex 环境下优先使用已安装的 `~/.codex/skills/agent-team/` 技能，不要绕过本地 skill 自行发明规范
- 修改代码时遵循既有框架、目录结构、命名、测试和提交习惯
- PR/MR 审查必须检查是否遗漏相关 skill 或违反项目代码规范

<!-- AGENT:OVERLAY:START -->
<!-- 项目特定的 overlay 内容可以在这里添加 -->
<!-- AGENT:OVERLAY:END -->
