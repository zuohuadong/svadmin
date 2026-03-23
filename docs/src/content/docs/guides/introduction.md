---
title: Introduction
description: svadmin — Headless admin framework for Svelte 5
---

**svadmin** is a headless admin framework for Svelte 5 that provides the building blocks for full-featured admin panels. Bring your own backend — svadmin connects to any REST, GraphQL, or custom API.

## What is svadmin?

svadmin is built natively for **Svelte 5 runes** and uses a provider-based architecture that separates concerns cleanly:

- **DataProvider** — CRUD operations against any backend
- **AuthProvider** — Authentication, identity, permissions
- **RouterProvider** — Hash or history-based routing, or bring your own
- **LiveProvider** — Real-time subscriptions via WebSocket or SSE

## Key Features

- 🎯 **Provider Architecture** — Swap backends without changing UI code
- ⚡ **TanStack Query** — Automatic caching, deduplication, background refetch
- 🧩 **Pre-built Components** — AutoTable, AutoForm, CRUD pages, auth pages, CommandPalette, Sheet, Drawer, StepsForm
- 🔠 **16 Field Components** — Complete set of mapped display and input fields (Text, Image, JSON, RichText, Combobox, MultiSelect, etc.)
- 🔑 **Auth System** — 9 hooks + 4 glassmorphism auth pages
- 📡 **Real-time** — WebSocket & SSE live providers with auto-reconnect
- 🎨 **Themeable** — 7 color themes, light/dark mode, glassmorphism
- 🛡️ **Access Control** — Role-based and attribute-based permissions
- 🔍 **Inferencer** — Auto-generate admin UI from sample data or OpenAPI 3.x specs
- 🏷️ **Resource Type Registry** — Compile-time resource name checking + auto type inference
- 🔄 **Mutation Modes** — Pessimistic, optimistic, and undoable mutations
- 📤 **Data Transfer** — CSV export/import with batch support
- 🧰 **Helpers** — `unionFilters`, `unionSorters`, `file2Base64`, `getDefaultFilter`, `getDefaultSortOrder`
- 📦 **15 Data Providers** — REST, Supabase, PocketBase, Appwrite, GraphQL, Elysia, Strapi, Directus, Firebase, Hasura, Sanity, Airtable, Medusa, NestJS variants

## Packages

| Package | Description |
|---------|-------------|
| `@svadmin/core` | Hooks, providers, types, Resource Type Registry, utilities |
| `@svadmin/ui` | Pre-built Svelte 5 components (Forms, Tables, 16 Fields, shadcn) |
| `@svadmin/simple-rest` | REST API data provider |
| `@svadmin/supabase` | Supabase data + auth + live provider |
| `@svadmin/pocketbase` | PocketBase data + auth + live provider |
| `@svadmin/appwrite` | Appwrite data + auth + live provider |
| `@svadmin/graphql` | GraphQL data provider |
| `@svadmin/elysia` | Elysia data provider (auto type inference) |
| `@svadmin/strapi` | Strapi CMS data provider |
| `@svadmin/directus` | Directus data provider |
| `@svadmin/firebase` | Firebase / Firestore data provider |
| `@svadmin/hasura` | Hasura GraphQL data provider |
| `@svadmin/sanity` | Sanity.io data provider |
| `@svadmin/airtable` | Airtable data provider |
| `@svadmin/medusa` | Medusa Commerce data provider |
| `@svadmin/nestjs-query` | NestJS GraphQL data provider |
| `@svadmin/nestjsx-crud` | NestJS CRUD data provider |
| `create-svadmin` | CLI scaffolding tool |
