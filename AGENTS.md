# Agent Configuration Template

> Auto-deployed by [agent-team-config](https://github.com/zuohuadong/agent-team-config) and mirrored to compatible agent entry files.
> This file is overwritten by `agmesh deploy`. Put project-specific additions in `.agents/AGENTS.local.md`; deploy merges them into the overlay block below.

## Language

- Reply to the user in Simplified Chinese.
- Use Chinese for important code comments or code explanations added during a fix when it fits the surrounding codebase.
- Keep user-facing status concise. Avoid dumping large raw logs or files into chat.

## Operating Loop

- Start with repo truth: inspect `git status` and targeted files. If `.agents/state/coordination.json` exists, use `agmesh context . --task <id>` / coordination DB status for the active task, recent events, and pending mailbox queue; only fall back to `tasks.md`, `progress.md`, and `.mailbox/` in legacy projects that have not been upgraded.
- Read only the slices needed for the task. Prefer `rg`, `sed`, focused file ranges, and `agmesh memory recall "<query>" --token-budget <n>` over full-file dumps.
- Keep the live context under budget: if `agmesh automation doctor .` reports coordination context warnings, run the suggested archive/prune command before broad exploration.
- Keep visual evidence path-based by default. Save screenshots, traces, videos, and large binary evidence as files and cite their paths plus a short text observation; do not paste base64/data URLs or large image payloads into chat, mailbox, progress, or Task Contract fields.
- Use `view_image`, browser screenshot output, or other image-returning tools only when visual inspection is essential. Inspect the fewest images needed, summarize the observation immediately, and continue from the file path summary instead of carrying raw image payloads forward. If a Codex session hits a context-window error, run `agmesh automation inspect-session-context <session-id|session-file>` and fork/start a fresh thread with a concise handoff summary.
- Make small, scoped edits that follow the existing framework, naming, tests, and directory layout.
- Verify with the narrowest meaningful test first, then broaden when the change touches shared CLI behavior, templates, automation, data, security, deployment, or user-facing workflows.
- Explain material design, deletion, migration, or rollback decisions with a concise rationale. Do not expose raw chain-of-thought.

## Required Context

- In coordination DB v2 projects, `.agents/state/coordination.db` is the execution and coordination source. Use bounded DB queries through `agmesh context`, `agmesh automation status`, and task-specific evidence references; do not read historical logs wholesale.
- In legacy projects only, `progress.md`, `.mailbox/`, and `tasks.md` remain the fallback coordination files. Read only the active task row/contract, newest relevant progress entries, and pending/conflicting mailbox frontmatter; archive old history before broad work.
- `.agents/state/` contains machine-readable state, run records, and archives.
- `.agents/workflows/` and `.agents/prompts/` hold detailed procedures. Load only the workflow or role prompt needed by the current assignment.

## Delegation Gate

- For implementation, fix, test, deploy, refactor, PR/MR, or automation work, make a Delegation Decision before editing.
- Use the full `explorer -> executor -> verifier -> orchestrator` flow for medium/high risk work, multi-file or multi-subsystem changes, architecture/API/data/state/migration/security/permission/billing/production changes, unclear root cause, unfamiliar code, UI/E2E behavior, external fact checking, or review of the orchestrator's own completion claim.
- Low-risk, single-file work with clear acceptance criteria may be implemented by the main process directly after recording the safe skip reason and running local verification. Add an independent verifier when the result is broad, user-visible, unfamiliar, or explicitly requested.
- Pure explanation, read-only review, simple shell queries, formatting-only edits, and documentation-only tasks may skip subagents; record `safe_skip_reason`.
- Host tool policy is not a valid `safe_skip_reason`. Agent-team delegation is enabled by default for action-oriented tasks and does not require per-task user authorization. If the current runtime can spawn subagents, dispatch the required subagents; if it cannot, record the runtime gap in `interruption_recovery` and mark the task `blocked` / `PARTIAL` instead of rewriting it as a safe skip.
- Subagent requests must state role, exact scope, read/write ownership, allowed files/directories, context isolation, handoff artifacts, `verification_command` / verification commands, output schema, and mailbox persistence.
- If a subagent is interrupted, times out, or returns incomplete output, record `interruption_recovery` before continuing.

## Task Contract

Before execution, the Task Contract should state:

- goal and non-goals
- acceptance criteria
- collaboration mode (`solo`, `roundtable`, `critic`, `pipeline`, `split`, or `swarm`)
- expected files/modules
- required skills and code conventions
- verification plan
- risk and rollback
- provider/source links when applicable
- parent/source/reason for follow-up tasks

Use a minimal contract for low-risk local work. Require full Stack/Fullstack/Database/Deployment profiles only when the task creates, changes, or materially depends on those choices.

## Skills

- Load project prompts, workflows, `references/skills/`, project `AGENTS.md`, or installed `~/.codex/skills/agent-team/` skills only when the task needs them.
- Use `stack-profile-selector` for stack boundary decisions, `deployment-target-selector` for hosting, and `database-profile-selector` for persistence.
- Then load concrete skills such as `elysiajs`, `nestjs-backend`, `hono-backend`, `svelte-code-writer`, `svelte-core-bestpractices`, `vue-frontend`, `alpine-frontend`, `sveltekit-fullstack`, `nuxt-fullstack`, `sqlite-database`, `cloudflare-d1-database`, `postgres-database`, `electron-desktop`, `tauri-desktop`, `mobile-app`, `mpx-development-guides`, `supacloud-platform`, `svadmin-admin-ui`, `edgeone-deploy`, or `cloudflare-edge-hosting` as evidence requires.

## Automation Rules

- Executors handle one eligible `ready` task at a time, then reread the current execution source and mailbox queue (coordination DB in v2 projects, legacy files otherwise).
- Reviewers handle `review` tasks only.
- Health checks watch stuck tasks, auth/CI visibility, and queue drift.
- Failed review should return to the original PR/MR when possible. Create a follow-up only when the source cannot continue or the issue was already merged; include `parent`, `source`, and `reason`.
- Do not silently shrink scope. If the work exceeds the request, stop and state the tradeoff.

## Safety

- Never hardcode secrets in code, logs, templates, or durable memory.
- Never run destructive git or filesystem commands unless the user clearly asked for them.
- Do not use `git push -f`.
- Do not auto-commit, push, publish, deploy, or write to production unless the user explicitly requested that action.
- Generated code, comments, and commit messages must not mention AI authorship.
- Commit messages, when requested, must follow Conventional Commits.

<!-- AGENT:OVERLAY:START -->
<!-- Project-specific overlay content goes here. -->
<!-- AGENT:OVERLAY:END -->
