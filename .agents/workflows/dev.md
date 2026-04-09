---
description: 全流程开发 — 分析、实现、测试、验证
---
// turbo-all

# Development Workflow

## 0. Pre-Execution Gate
- Is the request specific enough? (file paths, function names, error messages, issue numbers)
- If vague → use `/deep-review` first to clarify intent and scope
- If specific → proceed directly

## 1. Understand the Task
- Read relevant source files to understand current codebase
- Identify affected files and dependencies
- Check existing tests and documentation
- Gather codebase facts BEFORE asking the user (don't ask what you can discover)

## 2. Plan Changes
- Create implementation plan (use task_boundary PLANNING mode)
- Break task into small, independent sub-tasks
- If task is complex, use browser_subagent for parallel research
- For high-risk changes (auth, data migration, production): consider `/deep-review` first

## 3. Implement
- Make changes following the plan
- Use TypeScript, functional style, proper error handling
- Keep commits atomic (one logical change per commit)
- Use Lore Commit trailers for non-obvious decisions (especially `Rejected:` for abandoned approaches)

## 4. Verify (Mandatory — no evidence = not complete)
- Run existing tests: `npm test` or `bun test`
- Run type check: `npx tsc --noEmit` or `bun run typecheck`
- Run linter: `npm run lint` or `bun run lint`
- If UI changes, use browser_subagent to verify visually
- Capture fresh verification output as evidence

## 5. Completion Checklist
Before declaring the task done, confirm ALL applicable items:
- [ ] Requested behavior is fully implemented (no scope reduction)
- [ ] Type check passes with zero errors
- [ ] Related tests pass
- [ ] Build succeeds
- [ ] No debug/temporary code left behind
- [ ] Fresh verification evidence included in response

## 6. Commit
- Use Conventional Commits format: `feat:`, `fix:`, `refactor:`, etc.
- Include relevant issue/ticket numbers
- Add `Rejected:` trailer when you abandoned an alternative approach

## Notes
- For complex tasks: decompose into sub-tasks, use browser_subagent for parallel work
- For simple tasks: just do it directly, don't over-engineer the process
- Always check `progress.md` at project root if working in multi-agent mode
- Apply Reasoning Effort tiers: LOW for simple lookups, STANDARD for features, HIGH for architecture
