---
description: Agent handoff workflow - generate structured handoff for next agent/workspace
---
// turbo-all

# Agent Handoff Workflow

Use this when finishing work in one workspace and another agent needs to continue.

## 1. Generate Handoff Document

Update `progress.md` at project root with:

```markdown
## [时间] [workspace名] - [状态: 完成/进行中/阻塞]

### 已完成
- 具体做了什么（列出修改的文件）

### 变更文件
- `path/to/file1` - 描述变更
- `path/to/file2` - 描述变更

### 待办/给下一个 Agent 的任务
- [ ] 具体需要做什么
- [ ] 需要注意什么

### 注意事项
- 任何可能影响其他模块的副作用
- 未解决的问题或已知的限制
```

## 2. Verify Handoff
- Ensure all changed files are saved
- Run tests to confirm current state is stable: `npm test`
- Commit work with clear message: `git add -A && git commit -m "wip: [description]"`

## 3. Signal Completion
- Update `progress.md` status to "完成" or "待接续"
- Notify user that handoff is ready

## Notes
- Keep handoff document concise - next agent should be able to understand in < 30 seconds
- Include enough context that the next agent doesn't need to re-analyze the whole codebase
- Don't include implementation details the next agent can read from the code itself
