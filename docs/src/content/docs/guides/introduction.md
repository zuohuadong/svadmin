---
title: Introduction
description: svadmin — Headless admin framework for Svelte 5
---

**svadmin** is a headless admin framework for Svelte 5 that provides the building blocks for full-featured admin panels. Bring your own backend — svadmin connects to any REST, GraphQL, or custom API.

## What is svadmin?

svadmin is inspired by [Refine.dev](https://refine.dev) but built natively for **Svelte 5 runes**. It uses a provider-based architecture that separates concerns cleanly:

- **DataProvider** — CRUD operations against any backend
- **AuthProvider** — Authentication, identity, permissions
- **RouterProvider** — Hash or history-based routing, or bring your own
- **LiveProvider** — Real-time subscriptions via WebSocket or SSE

## Key Features

- 🎯 **Provider Architecture** — Swap backends without changing UI code
- ⚡ **TanStack Query** — Automatic caching, deduplication, background refetch
- 🧩 **Pre-built Components** — AutoTable, AutoForm, CRUD pages, auth pages
- 🔑 **Auth System** — 9 hooks + 4 glassmorphism auth pages
- 📡 **Real-time** — WebSocket & SSE live providers with auto-reconnect
- 🎨 **Themeable** — 7 color themes, light/dark mode, glassmorphism
- 🛡️ **Access Control** — Role-based and attribute-based permissions
- 🔍 **Inferencer** — Auto-generate admin UI from sample data or OpenAPI specs
- 📦 **Multiple Packages** — `simple-rest`, `supabase`, `graphql` data providers

## Packages

| Package | Description |
|---------|-------------|
| `@svadmin/core` | Hooks, providers, types, utilities |
| `@svadmin/ui` | Pre-built Svelte 5 components |
| `@svadmin/simple-rest` | REST API data provider |
| `@svadmin/supabase` | Supabase data provider |
| `@svadmin/graphql` | GraphQL data provider |
| `create-svadmin` | CLI scaffolding tool |
