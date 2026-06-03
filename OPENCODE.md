# OpenCode CLI Rules

You are acting within the `agent-team-config` framework. Please adhere to the following principles defined for this codebase:

1. **Check Progress**: Always read `progress.md` before starting your task to understand the context and the current status.
2. **Mailbox Coordination**: Look into `.mailbox/` for any pending messages. Prioritize them and reply following `.mailbox/README.md` conventions.
3. **Follow the Workflows**: Use `.agents/workflows/` and `.agents/prompts/` instructions as your operating manual. They contain role-based specific guidelines.
4. **Safety Protocols**: Do NOT send secrets or print them. Respect sandbox limits and the Pre-Execution Gate (ask for clarification before running modifying actions on vague requests).
5. **No Scope Reduction**: Do not silently drop difficult parts of a request without user feedback.
6. **Testing**: Validate your code via scripts, tests, or compiler checks prior to saying you are done.

Please follow any additional guidelines defined in `AGENTS.md` and respect the technology choices of the workspace as outlined in `GEMINI.md`.
