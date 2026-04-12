// Chat & Agent provider — headless interface for AI integration
//
// Two abstraction levels:
//   1. ChatProvider  — simple message-in / text-out  (backward compatible)
//   2. AgentProvider — tool calling, approval gates, generative UI events
//
// Inspired by Vercel AI SDK 6 agent abstractions.

/** Describes an actionable button rendered in assistant messages (tool-call UX). */
export interface ChatAction {
  label: string;
  /** Optional variant for styling (e.g. 'destructive' renders red) */
  variant?: 'default' | 'destructive' | 'outline';
  /** Arbitrary payload forwarded to the onAction handler */
  payload?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  /** Tool-call action buttons rendered below the message bubble */
  actions?: ChatAction[];
}

/** Admin context automatically injected into chat system messages. */
export interface ChatContext {
  currentResource?: string;
  selectedRecordId?: string;
  currentView?: 'list' | 'edit' | 'create' | 'show';
  pathname?: string;
}

/**
 * ChatProvider interface for integrating AI chat into admin panels.
 * Implement `sendMessage` to connect to any AI backend (OpenAI, self-hosted, etc.)
 *
 * Return a `string` for non-streaming responses, or an `AsyncGenerator<string>`
 * for streaming (SSE / chunked) responses.
 */
export interface ChatProvider {
  sendMessage(
    messages: ChatMessage[],
    options?: { signal?: AbortSignal },
  ): Promise<string> | AsyncGenerator<string, void, unknown>;
}

// ─── Agent Provider (extends ChatProvider concept) ─────────────
//
// An AgentProvider emits typed events instead of raw strings, enabling:
//   • Tool calling — Agent invokes admin operations (CRUD, custom)
//   • Approval gates — Dangerous tools require user confirmation before execution
//   • Generative UI — Agent returns component name + props for dynamic rendering

/** JSON-Schema-compatible parameter definition for an admin tool. */
export interface AdminToolParameter {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  enum?: string[];
  required?: boolean;
}

/**
 * A tool that the Agent can invoke within the admin panel.
 *
 * @example
 * ```ts
 * const deletePostTool: AdminTool = {
 *   name: 'deletePosts',
 *   description: 'Delete posts matching a filter',
 *   parameters: {
 *     status: { type: 'string', description: 'Filter by status', enum: ['draft', 'archived'] },
 *   },
 *   needsApproval: true,
 *   execute: async (params) => {
 *     const result = await dataProvider.deleteMany({ resource: 'posts', ids: params.ids });
 *     return { success: true, data: result };
 *   },
 * };
 * ```
 */
export interface AdminTool {
  /** Unique tool name (e.g. 'getList', 'deleteRecords', 'generateReport') */
  name: string;
  /** Human-readable description for LLM tool-use prompting */
  description: string;
  /** JSON-Schema-style parameter definitions */
  parameters: Record<string, AdminToolParameter>;
  /**
   * When `true`, execution is paused until the user explicitly approves.
   * The agent emits an `approval_request` event and waits for `approveToolCall()`.
   */
  needsApproval?: boolean;
  /** Execute the tool with the given arguments. */
  execute(args: Record<string, unknown>): Promise<ToolResult>;
}

/** Result returned by a tool execution. */
export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

/** Discriminated union of events emitted by an AgentProvider. */
export type AgentEvent =
  /** Streaming text chunk */
  | { type: 'text'; content: string }
  /** Agent wants to call a tool (informational — execution is handled internally) */
  | { type: 'tool_call'; tool: string; args: Record<string, unknown> }
  /** Agent wants to call a tool that requires user approval before execution */
  | { type: 'approval_request'; id: string; tool: string; args: Record<string, unknown>; description: string }
  /** Tool execution completed */
  | { type: 'tool_result'; tool: string; result: ToolResult }
  /** Agent wants to render a named component (Generative UI) */
  | { type: 'component'; name: string; props: Record<string, unknown> }
  /** Stream finished */
  | { type: 'done' };

/** Options passed to AgentProvider.chat() */
export interface AgentOptions {
  signal?: AbortSignal;
  /** Admin context is injected automatically by the framework */
  context?: ChatContext;
}

/**
 * AgentProvider — advanced AI integration with tool calling and approval gates.
 *
 * Implement this interface to connect to agentic AI backends that support
 * function calling (OpenAI, Anthropic, Google Gemini, etc.).
 *
 * For simpler chat-only use cases, use `ChatProvider` instead.
 *
 * @example
 * ```ts
 * const agentProvider: AgentProvider = {
 *   tools: [deletePostTool, getStatsTool],
 *   async *chat(messages, options) {
 *     // Stream events from your AI backend
 *     yield { type: 'text', content: 'Looking up draft posts...' };
 *     yield { type: 'tool_call', tool: 'getList', args: { resource: 'posts', filter: { status: 'draft' } } };
 *     yield { type: 'approval_request', id: 'req-1', tool: 'deletePosts', args: { ids: ['1', '2'] }, description: 'Delete 2 draft posts' };
 *     yield { type: 'done' };
 *   },
 * };
 * ```
 */
export interface AgentProvider {
  /** Available tools the agent can invoke */
  tools?: AdminTool[];
  /** Send messages and receive a stream of typed agent events */
  chat(
    messages: ChatMessage[],
    options?: AgentOptions,
  ): AsyncGenerator<AgentEvent, void, unknown>;
}

// ─── Chat Provider singleton ───────────────────────────────────

let chatProvider: ChatProvider | null = $state(null);

export function setChatProvider(provider: ChatProvider): void {
  chatProvider = provider;
}

export function getChatProvider(): ChatProvider | null {
  return chatProvider;
}

// ─── Agent Provider singleton ──────────────────────────────────

let agentProvider: AgentProvider | null = $state(null);

export function setAgentProvider(provider: AgentProvider): void {
  agentProvider = provider;
}

export function getAgentProvider(): AgentProvider | null {
  return agentProvider;
}

// ─── Tool Approval ─────────────────────────────────────────────

interface ApprovalCallback {
  (approved: boolean): void;
}
interface ApprovalEntry { id: string; callback: ApprovalCallback }
let pendingApprovals = $state<ApprovalEntry[]>([]);

export function registerApproval(id: string, callback: ApprovalCallback): void {
  pendingApprovals = [...pendingApprovals, { id, callback }];
}

export function resolveApproval(id: string, approved: boolean): boolean {
  const entry = pendingApprovals.find(e => e.id === id);
  if (!entry) return false;
  entry.callback(approved);
  pendingApprovals = pendingApprovals.filter(e => e.id !== id);
  return true;
}

export function hasPendingApprovals(): boolean {
  return pendingApprovals.length > 0;
}

// ─── Chat Context singleton ────────────────────────────────────

let chatContext = $state<ChatContext>({});

export function setChatContext(ctx: ChatContext): void {
  chatContext = ctx;
}

export function getChatContext(): ChatContext {
  return chatContext;
}
