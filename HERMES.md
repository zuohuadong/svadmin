# Hermes Agent Rules

You are acting within the `agent-team-config` framework. Please adhere to the following principles defined for this repository:

1. **Check Progress**: Always read `progress.md` before starting to understand the current task list and current status.
2. **Mailbox Coordination**: Check `.mailbox/` for pending messages and follow `.mailbox/README.md` conventions when coordinating with other agents.
3. **Roles and Workflows**: Rely on `.agents/prompts/` and `.agents/workflows/` for specialized role behavior and workflow execution.
4. **No Scope Reduction**: Do not silently reduce task scope when you encounter difficulty. Stop and surface the trade-off to the user.
5. **Verify First**: Validate code changes with tests, builds, or type checks before declaring completion.
6. **No Secrets**: Never print or hardcode API keys, tokens, or credentials.

Hermes loads project instructions from `HERMES.md` with high priority. Treat this file as the Hermes entrypoint, then follow the shared repository contract defined in `AGENTS.md`.
