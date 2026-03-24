# @svadmin/create

The official scaffolding CLI for `headless-admin-svelte` (svadmin).

Quickly bootstrap a completely configured, headless admin panel project built on Svelte 5, Shadcn Svelte, and TanStack Query.

## Quick Start

```bash
npx @svadmin/create@latest my-admin-app
# or
bunx @svadmin/create@latest my-admin-app
```

Follow the interactive prompts to:
1. Name your project.
2. Choose a default Data Provider (Simple REST, Supabase, GraphQL, or Custom).

## What's Included

The generated project is pre-configured with:
- **SvelteKit** + **Vite** (Svelte 5 Runes)
- **Tailwind CSS** + **Shadcn Svelte** UI components
- **@svadmin/core**: The headless business logic and hooks (useTable, useForm, useAuth, etc.)
- **@svadmin/ui**: Beautiful default dashboard UI, standalone CRUD buttons, and data tables.
- Pre-wired **TanStack Query** for client-state management.

## Start Developing

Once scaffolded, `cd` into your directory, install dependencies, and start the development server:

```bash
cd my-admin-app
bun install
bun run dev
```
