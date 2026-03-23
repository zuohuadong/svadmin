# Changelog

All notable changes to this project will be documented in this file.

## [0.4.0] - 2026-03-23

### Added

- 🪟 **shadcn-svelte Migration**: Completely replaced custom components with shadcn-svelte primitives (Sheet, Drawer, CommandPalette, Collapsible, Tooltip, Breadcrumb, Pagination, Select, DropdownMenu).
- 🔠 **16 Field Components**: Delivered a complete set of mapped display and input fields (TextField, UrlField, EmailField, BooleanField, TagField, FileField, ImageField, MarkdownField, RichTextField, SelectField, MultiSelectField, RelationField, JsonField, ComboboxField, PasswordInput) via `FieldRenderer`.
- 🧩 **New UI Systems**: `StepsForm` (multi-step wizard), `InfiniteList` (infinite scrolling), `FilterForm` (advanced filtering).
- 🌍 **i18n Enhancements**: Complete i18n coverage for all UI components, hooks, and AuthProvider errors (`common.next`, `common.back`, `common.showMore`, etc.).
- ♿ **Accessibility & UX**: Added `TooltipButton`, improved keyboard navigation (CommandPalette), and enhanced Svelte 5 transitions (fade/fly/scale) across Layout and dialogs.

### Changed

- 🗑️ Eliminated all raw CSS blocks and raw HTML elements (`<button>`, `<select>`) in favor of Tailwind CSS and shadcn components. Total raw buttons reduced from 20+ to 0.
- ⚡ Refactored all data providers and core hooks to enforce end-to-end type safety (100% strict `BaseRecord` generics, zero `any` types).
- 🧹 Fixed context timing issues, resolved memory leaks with `createOvertimeTracker`, and refactored Layout to use modern Svelte 5 `async/await` syntax.

## [0.0.5] - 2026-03-22

### Added

- **Router Provider Integration**: `AdminApp` accepts `routerProvider` prop (defaults to `createHashRouterProvider()`), router-state uses RouterProvider for URL parsing, popstate listener for history routing
- **autoSave for `useForm`**: `autoSave: { enabled, debounce?, onFinish? }` option with reactive `autoSaveStatus` ('idle'|'saving'|'saved'|'error') and `triggerAutoSave(values)` method
- **CloneButton**: Navigate to create page with prefilled data via `clone_id` query param
- **`clone()` in `useNavigation()`**: Route to `/:resource/create?clone_id=:id`
- **i18n keys**: `common.clone`, `common.autoSaving`, `common.autoSaved` in zh-CN and en

### Changed

- `router-state.svelte.ts` now accepts optional `RouterProvider` and listens to both `hashchange` and `popstate` events
- `context.ts` now supports `setRouterProvider` / `getRouterProvider`

## [0.0.4] - 2026-03-22

### Added

- **Auth Hooks**: Independent `useLogin`, `useLogout`, `useRegister`, `useForgotPassword`, `useUpdatePassword`, `useGetIdentity`, `useIsAuthenticated` hooks in `@svadmin/core`
- **`useOnError` Hook**: Handles errors from data hooks by calling `authProvider.onError()`, auto-logout/redirect
- **`usePermissions` Hook**: Reactive permissions fetcher from `authProvider.getPermissions()`
- **`<Authenticated>` Component**: Conditionally render children based on auth state with loading/fallback snippets
- **`<ConfigErrorScreen>` Component**: Glassmorphism env-var error screen with copy-to-clipboard
- **`<UpdatePasswordPage>` Component**: Password reset form with glassmorphism design
- **`useParsed` Hook**: Parse current hash URL into structured `{ resource, action, id, params }`
- **RouterProvider Interface**: `createHashRouterProvider()` and `createHistoryRouterProvider()` for pluggable routing
- **CRUD Buttons**: `CreateButton`, `EditButton`, `DeleteButton`, `ShowButton`, `ListButton`, `RefreshButton`, `ExportButton`, `ImportButton`, `SaveButton`
- **StatsCard Enhancements**: `color` prop (primary/success/warning/danger/info) and `variant` prop (default/outline/filled)

### Changed

- Auth pages (`LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `UpdatePasswordPage`) now use independent auth hooks instead of direct `authProvider` prop
- `AdminApp` no longer passes `authProvider` to auth page components (they use context+hooks)

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
