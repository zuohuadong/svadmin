# AGENTS.md — AI Coding Agent Instructions for svadmin

> This file helps AI coding agents (Cursor, Copilot, Gemini, Claude, etc.) understand the svadmin codebase.
> Inspired by [Next.js 16.2 Agent-Ready](https://nextjs.org/blog/next-16-2-ai).

## What is svadmin?

svadmin is a **headless admin framework for Svelte 5**. It provides data hooks, authentication, permissions, real-time subscriptions, and optional UI components — all powered by Svelte 5 Runes (`$state`, `$derived`, `$effect`).

## Project Structure

```
packages/
  core/          — Headless hooks, providers, types (framework-agnostic logic)
  ui/            — Pre-built Svelte 5 UI components (AutoTable, AutoForm, etc.)
  supabase/      — Supabase data/auth provider
  drizzle/       — Drizzle ORM data provider (direct DB access)
  elysia/        — Elysia (Bun) data provider
  simple-rest/   — Generic REST API data provider
  graphql/       — GraphQL data provider
  sveltekit/     — SvelteKit router integration
  create-svadmin/ — CLI scaffolding tool
  lite/          — SSR-only variant (no JS required)
  sso/           — OIDC/OAuth2 SSO plugin
  ...            — Additional data providers (firebase, pocketbase, strapi, etc.)
docs/            — Astro Starlight documentation site
example/         — Example SvelteKit app using svadmin
e2e/             — Playwright end-to-end tests
```

## Architecture Principles

1. **Provider Pattern**: All external integrations use swappable providers:
   - `DataProvider` — CRUD operations (getList, getOne, create, update, deleteOne)
   - `AuthProvider` — Login, logout, identity, permissions
   - `ChatProvider` / `AgentProvider` — AI chat and agent integration
   - `LiveProvider` — Real-time subscriptions (WebSocket / SSE)
   - `AccessControlProvider` — RBAC / ABAC / CASL / Casbin
   - `RouterProvider` — Hash / SvelteKit routing

2. **Svelte 5 Runes**: All reactive state uses `$state`, `$derived`, `$effect`. No legacy `writable`/`readable` stores.

3. **Module-level singletons**: State is managed via module-level `$state` variables with getter/setter functions (e.g., `setChatProvider()` / `getChatProvider()`). No Svelte context API.

4. **Type-safe resources**: Use `ResourceTypeMap` declaration merging for end-to-end type inference.

## Key Files Reference

### Core Package (`packages/core/src/`)

| File | Purpose |
|------|---------|
| `types.ts` | All core interfaces: DataProvider, AuthProvider, BaseRecord, ResourceDefinition, FieldDefinition |
| `context.svelte.ts` | Provider singletons (data, auth, resources, router) |
| `hooks.svelte.ts` | Main data hooks (useList, useOne, useCreate, etc.) — TanStack Query wrappers |
| `query-hooks.svelte.ts` | Query-specific hooks (useList, useOne, useMany, useSelect) |
| `mutation-hooks.svelte.ts` | Mutation hooks (useCreate, useUpdate, useDelete) |
| `form-hooks.svelte.ts` | Form hooks (useForm, useModalForm, useDrawerForm) |
| `table-hooks.svelte.ts` | useTable hook with sorting, filtering, pagination |
| `auth-hooks.svelte.ts` | Auth hooks (useLogin, useLogout, useGetIdentity, etc.) |
| `chatProvider.svelte.ts` | ChatProvider + AgentProvider interfaces for AI integration |
| `permissions.ts` | AccessControlProvider, canAccessAsync, useCan |
| `live.svelte.ts` | LiveProvider, useSubscription, usePublish |
| `i18n.svelte.ts` | Translation system with locale management |
| `theme.svelte.ts` | Theme system (dark/light modes, 7 color presets) |
| `inferencer.ts` | Auto-infer ResourceDefinition from sample API data |
| `inferencer-openapi.ts` | Infer fields from OpenAPI schemas |

### UI Package (`packages/ui/src/components/`)

| Component | Purpose |
|-----------|---------|
| `AutoTable.svelte` | Zero-config data table from ResourceDefinition |
| `AutoForm.svelte` | Zero-config form from ResourceDefinition |
| `CommandPalette.svelte` | ⌘K command palette for navigation and actions |
| `Header.svelte` | App header with theme toggle, user menu |
| `Sidebar.svelte` | Collapsible navigation sidebar |
| `PermissionMatrix.svelte` | 3D RBAC permission grid |
| `TenantSwitcher.svelte` | Multi-tenant workspace switcher |
| `AuditLogViewer.svelte` | Audit log with diff snapshots |

## Coding Conventions

- **TypeScript strict mode** — no `any`, use `unknown` + type guards
- **Svelte 5 only** — `$state()`, `$derived()`, `$effect()`, no legacy stores
- **Functional style** — avoid classes except for Error subclasses
- **Bun runtime** — use `bun test` for unit tests, `bun tsc --noEmit` for type checking
- **Conventional Commits** — `feat|fix|docs|refactor|test|chore(scope): description`
- **Exports via barrel** — all public APIs exported from `packages/core/src/index.ts`

## Testing

```bash
# Unit tests
bun test

# Type checking
bun tsc --noEmit

# E2E tests
bunx playwright test

# Lint
bun run lint
```

## Common Tasks

### Adding a new hook
1. Create in `packages/core/src/` following the `use*` naming pattern
2. Use TanStack Query for data fetching (`createQuery` / `createMutation`)
3. Export from `packages/core/src/index.ts`
4. Add tests in a `.test.ts` file alongside

### Adding a new data provider
1. Create a new package under `packages/<provider-name>/`
2. Implement the `DataProvider` interface from `@svadmin/core`
3. Optionally implement `AuthProvider` if the backend supports auth

### Adding a new UI component
1. Create in `packages/ui/src/components/`
2. Use Svelte 5 syntax with `$props()`, `$state()`, `$derived()`
3. Import core hooks from `@svadmin/core`
4. Export from `packages/ui/src/index.ts`
