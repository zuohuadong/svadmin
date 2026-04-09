---
description: Agent 交接 — 生成结构化交接文档给下一个 Agent/Workspace
---
// turbo-all

# Handoff Workflow

Use this when transferring work between agents, workspaces, or sessions.

## 1. Summarize Current State
Create a structured handoff document:
- **Task**: What was the original request
- **What was done**: Specific changes made (files, functions, configs)
- **What remains**: Concrete next steps with enough context to act
- **Blockers**: Any issues that prevented completion
- **Verification status**: What was tested and what wasn't (`Not-tested:` gaps)
- **Decision context**: Key decisions made and why (including `Rejected:` alternatives)

## 2. Write to Mailbox (if multi-agent)
- Create `.mailbox/<timestamp>-<slug>.md` with handoff content
- Set `to:` to target agent/workspace name (or `all`)
- Set `status: pending`

## 3. Update Progress
- Update `progress.md` with final status
- Format: `[时间] [workspace名] [状态:handoff] 描述`

## 4. Context Snapshot (for complex handoffs)
For tasks that need deep context preservation:
- Record the task statement and desired outcome
- List known facts and evidence discovered
- List constraints and unknowns
- Reference specific files and line ranges that are critical
- Include any specs or plans created during the session

## Notes
- The goal is to make the next agent effective WITHOUT re-reading everything
- Include file:line references, not vague descriptions
- If a decision was non-obvious, explain WHY not just WHAT
- Keep it concise: the handoff should be scannable in 30 seconds
