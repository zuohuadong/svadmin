---
description: 并行研究 — 同时调查多个来源并综合分析
---
// turbo-all

# Research Workflow

Use this when you need to gather information from multiple sources before making decisions.

## 1. Define Research Questions
- Clearly state what you need to find out
- List specific questions that need answers

## 2. Parallel Research
- Use browser_subagent to research multiple topics simultaneously
- Use search_web for quick factual lookups
- Use read_url_content for reading documentation

## 3. Synthesize Results
- Compare findings from different sources
- Identify consensus vs conflicting information
- Document key findings in a concise summary

## 4. Make Recommendation
- Based on research, provide a clear recommendation
- Include trade-offs and alternatives considered
- If the decision is significant, ask user for confirmation before proceeding

## Notes
- Maximum 3 browser_subagent calls in parallel to avoid overwhelming
- Prefer read_url_content over browser_subagent for simple page reads (faster)
- Always cite sources
