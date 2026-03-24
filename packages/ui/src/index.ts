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
export { default as Authenticated } from './components/Authenticated.svelte';
export { default as UpdatePasswordPage } from './components/UpdatePasswordPage.svelte';
export { default as ProfilePage } from './components/ProfilePage.svelte';
export { default as ConfigErrorScreen } from './components/ConfigErrorScreen.svelte';
export { default as InferencerPanel } from './components/InferencerPanel.svelte';
export { default as LiveIndicator } from './components/LiveIndicator.svelte';
export { default as ListPage } from './components/ListPage.svelte';
export { default as CreatePage } from './components/CreatePage.svelte';
export { default as EditPage } from './components/EditPage.svelte';
export { default as AutoSaveIndicator } from './components/AutoSaveIndicator.svelte';
export { default as ErrorComponent } from './components/ErrorComponent.svelte';
export { default as PageSkeleton } from './components/PageSkeleton.svelte';
export { default as NavigateToResource } from './components/NavigateToResource.svelte';
export { default as CatchAllNavigate } from './components/CatchAllNavigate.svelte';
export { default as ThemedTitle } from './components/ThemedTitle.svelte';
export { default as CommandPalette } from './components/CommandPalette.svelte';
export { default as StepsForm } from './components/StepsForm.svelte';
export { default as InfiniteList } from './components/InfiniteList.svelte';
export { default as ComboboxField } from './components/ComboboxField.svelte';
export { default as PasswordInput } from './components/PasswordInput.svelte';

// Field display components
export { default as NumberField } from './components/fields/NumberField.svelte';
export { default as DateField } from './components/fields/DateField.svelte';
export { default as EmailField } from './components/fields/EmailField.svelte';
export { default as UrlField } from './components/fields/UrlField.svelte';
export { default as BooleanField } from './components/fields/BooleanField.svelte';
export { default as TagField } from './components/fields/TagField.svelte';
export { default as FileField } from './components/fields/FileField.svelte';
export { default as MarkdownField } from './components/fields/MarkdownField.svelte';
export { default as TextField } from './components/fields/TextField.svelte';
export { default as ImageField } from './components/fields/ImageField.svelte';
export { default as SelectField } from './components/fields/SelectField.svelte';
export { default as MultiSelectField } from './components/fields/MultiSelectField.svelte';
export { default as RelationField } from './components/fields/RelationField.svelte';
export { default as JsonField } from './components/fields/JsonField.svelte';
export { default as RichTextField } from './components/fields/RichTextField.svelte';

// CRUD Buttons
export {
  CreateButton, EditButton, DeleteButton, ShowButton, ListButton,
  RefreshButton, ExportButton, ImportButton, SaveButton, CloneButton,
} from './components/buttons/index.js';

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
export * as Sheet from './components/ui/sheet/index.js';
export * as Alert from './components/ui/alert/index.js';
export * as Card from './components/ui/card/index.js';
export * as Dialog from './components/ui/dialog/index.js';
export * as Table from './components/ui/table/index.js';
export * as Tabs from './components/ui/tabs/index.js';
export * as Tooltip from './components/ui/tooltip/index.js';
export * as DropdownMenu from './components/ui/dropdown-menu/index.js';

// Additional shadcn components
export * as Breadcrumb from './components/ui/breadcrumb/index.js';
export * as Pagination from './components/ui/pagination/index.js';
export * as ContextMenu from './components/ui/context-menu/index.js';
export * as Drawer from './components/ui/drawer/index.js';
export * as Collapsible from './components/ui/collapsible/index.js';
export { Label } from './components/ui/label/index.js';
export { Command } from './components/ui/command/index.js';

// Utils
export { cn } from './utils';

// Field component registry
export {
  builtinDisplayComponents, registerDisplayComponent,
  getDisplayComponent, hasDisplayComponent,
} from './components/fieldComponentMap';
export type { FieldComponentMap } from './components/fieldComponentMap';

// Svelte Actions
export { clickOutside, shortcut, intersect, copyOnClick } from './actions';
