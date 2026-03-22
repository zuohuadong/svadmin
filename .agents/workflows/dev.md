---
description: Full development workflow - analyze, implement, test, verify
---
// turbo-all

# Development Workflow

## 1. Understand the Task
- Read relevant source files to understand current codebase
- Identify affected files and dependencies
- Check existing tests and documentation

## 2. Plan Changes
- Create implementation plan (use task_boundary PLANNING mode)
- Break task into small, independent sub-tasks
- If task is complex, use browser_subagent for parallel research

## 3. Implement
- Make changes following the plan
- Use TypeScript, functional style, proper error handling
- Keep commits atomic (one logical change per commit)

## 4. Verify
- Run existing tests: `npm test` or `bun test`
- Run type check: `npx tsc --noEmit` or `bun run typecheck`
- Run linter: `npm run lint` or `bun run lint`
- If UI changes, use browser_subagent to verify visually

## 5. Commit
- Use Conventional Commits format: `feat:`, `fix:`, `refactor:`, etc.
- Include relevant issue/ticket numbers

## Notes
- For complex tasks: decompose into sub-tasks, use browser_subagent for parallel work
- For simple tasks: just do it directly, don't over-engineer the process
- Always check `progress.md` at project root if working in multi-agent mode
