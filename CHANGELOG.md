# Changelog

All notable changes to this project will be documented in this file.

## [0.0.3] - 2026-03-22

### Added

- **Auth Pages**: `LoginPage`, `RegisterPage`, `ForgotPasswordPage` with glassmorphism design
- **Form Validation**: per-field error display in `AutoForm`, required field checks, custom `validate` callback in `useForm` and `FieldDefinition`
- **Notification Provider**: pluggable `notify()` / `setNotificationProvider()` with built-in toast fallback
- **`<CanAccess>` Component**: conditionally render children based on permission checks
- **`useCan()` Hook**: reactive async permission check returning `{ allowed, reason, isLoading }`
- **`syncWithLocation`**: `useTable` option to sync pagination/sort/filter with URL hash params
- **`UndoableNotification`**: countdown toast with undo button for undoable mutations
- **`useExport` / `useImport`**: CSV export (all records → download) and import (CSV → createMany)
- **`ModalForm` / `DrawerForm`**: Dialog and Sheet-based inline form components
- **DevTools Panel**: floating panel showing route, theme, i18n, resources; toggle via `Ctrl+Shift+D`
- **60+ i18n keys**: auth, validation messages in zh-CN and EN

### Changed

- Enhanced router to support `/register` and `/forgot-password` routes
- `AdminApp` now auto-renders `LoginPage` when `authProvider` is set
- `AdminApp` renders DevTools in dev mode

## [0.0.2] - 2026-03-22

### Added

- 🎨 **Multi-Color Theme** — 6 built-in color themes (Blue, Green, Rose, Orange, Violet, Zinc), switchable via sidebar color picker
- 🌐 **Locale Toggle** — One-click language switching in sidebar footer (zh-CN ↔ EN)
- 📡 **`ColorTheme` API** — New `getColorTheme()`, `setColorTheme()`, `colorThemes` exports from `@svadmin/core`

### Changed

- ♻️ **Router Refactor** — Extracted hash router state to `router-state.svelte.ts` using module-level `$state` runes for better reactivity
- 🔑 **`{#key}` Blocks** — Wrapped route components (AutoTable, AutoForm, ShowPage) with `{#key}` to ensure proper remount on resource/id change
- 🪟 **Glassmorphism Sidebar** — Sidebar now uses `backdrop-blur-xl` and translucent background for a premium look
- 🌗 **Dark Mode Fixes** — Fixed hardcoded text colors; dashboard title now adapts to dark mode
- 📦 **CSS Separation** — Moved app-level CSS from `@svadmin/ui` to example app to avoid style leaking between packages

## [0.0.1] - 2026-03-22

### Added

- 🎯 **Core SDK** (`@svadmin/core`) — 18 reactive hooks, context management, hash router, i18n (zh-CN/en), permissions, audit logging, theme management
- 🧩 **UI Components** (`@svadmin/ui`) — AdminApp, AutoTable, AutoForm, ShowPage, Layout, Sidebar, Header, PageHeader, EmptyState, StatsCard, Breadcrumbs, Toast, ConfirmDialog, ErrorBoundary, FieldRenderer
- 🎨 **Base UI** — 18 shadcn-svelte components: Button, Input, Textarea, Select, Switch, Checkbox, Badge, Avatar, Skeleton, Alert, Card, Dialog, Table, Tabs, Tooltip, DropdownMenu, Sheet, Separator
- 📡 **Simple REST** (`@svadmin/simple-rest`) — Fetch-based DataProvider + JWT/Cookie AuthProvider
- 🔌 **Supabase** (`@svadmin/supabase`) — DataProvider, AuthProvider, LiveProvider adapters
- 🌓 **Dark Mode** — Light / Dark / System with sidebar toggle, persisted to localStorage
- 🌍 **i18n** — Built-in zh-CN and en locales with browser auto-detection
- 📖 **Documentation** — Bilingual component docs in `docs/components/`
