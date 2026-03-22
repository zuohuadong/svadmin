// @svadmin/ui — Pre-built admin UI components

// Entry component
export { default as AdminApp } from './components/AdminApp.svelte';

// Admin components
export { default as AutoTable } from './components/AutoTable.svelte';
export { default as AutoForm } from './components/AutoForm.svelte';
export { default as ShowPage } from './components/ShowPage.svelte';
export { default as ConfirmDialog } from './components/ConfirmDialog.svelte';
export { default as Sidebar } from './components/Sidebar.svelte';
export { default as Layout } from './components/Layout.svelte';
export { default as Header } from './components/Header.svelte';
export { default as ErrorBoundary } from './components/ErrorBoundary.svelte';
export { default as Toast } from './components/Toast.svelte';
export { default as Breadcrumbs } from './components/Breadcrumbs.svelte';
export { default as FieldRenderer } from './components/FieldRenderer.svelte';
export { default as EmptyState } from './components/EmptyState.svelte';
export { default as StatsCard } from './components/StatsCard.svelte';
export { default as PageHeader } from './components/PageHeader.svelte';
export { default as LoginPage } from './components/LoginPage.svelte';
export { default as RegisterPage } from './components/RegisterPage.svelte';
export { default as ForgotPasswordPage } from './components/ForgotPasswordPage.svelte';
export { default as CanAccess } from './components/CanAccess.svelte';
export { default as UndoableNotification } from './components/UndoableNotification.svelte';
export { default as ModalForm } from './components/ModalForm.svelte';
export { default as DrawerForm } from './components/DrawerForm.svelte';
export { default as DevTools } from './components/DevTools.svelte';

// Base UI components (shadcn-svelte)
export { Button, buttonVariants } from './components/ui/button/index.js';
export { Input } from './components/ui/input/index.js';
export { Textarea } from './components/ui/textarea/index.js';
export { Select } from './components/ui/select/index.js';
export { Switch } from './components/ui/switch/index.js';
export { Checkbox } from './components/ui/checkbox/index.js';
export { Badge } from './components/ui/badge/index.js';
export { Separator } from './components/ui/separator/index.js';
export { Avatar } from './components/ui/avatar/index.js';
export { Skeleton } from './components/ui/skeleton/index.js';
export { Sheet } from './components/ui/sheet/index.js';
export * as Alert from './components/ui/alert/index.js';
export * as Card from './components/ui/card/index.js';
export * as Dialog from './components/ui/dialog/index.js';
export * as Table from './components/ui/table/index.js';
export * as Tabs from './components/ui/tabs/index.js';
export * as Tooltip from './components/ui/tooltip/index.js';
export * as DropdownMenu from './components/ui/dropdown-menu/index.js';

// Utils
export { cn } from './utils';
