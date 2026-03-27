// Core barrel exports

export {
  setDataProvider, getDataProvider, getDataProviderForResource, getDataProviderNames,
  setAuthProvider, getAuthProvider,
  setResources, getResources, getResource,
  setRouterProvider, getRouterProvider,
} from './context.svelte';
export type { DataProviderInput } from './context.svelte';
export {
  useList, useInfiniteList,
  useOne, useShow,
  useSelect, useMany,
  useCustom, useApiUrl,
  useCustomMutation, useInvalidate,
  useCreate, useCreateMany,
  useUpdate, useUpdateMany,
  useDelete, useDeleteMany,
  useForm, useTable,
  useNavigation, useGo, useBack,
  useGetToPath, useLink,
  useResource,
  useLog, useLogList,
  useModalForm, useDrawerForm, useModal,
  useOvertime, useRelation,
  useNotification, useDataProvider,
  useMenu, useBreadcrumb, useThemedLayoutContext,
} from './hooks.svelte';
export { matchRoute, navigate, currentPath, setActiveRouterProvider } from './router';
export { readURLState, writeURLState } from './url-sync';
export { setAccessControl, setAccessControlProvider, getAccessControlProvider, getAccessControlOptions, canAccess, canAccessAsync } from './permissions';
export { useLive, useSubscription, usePublish } from './live.svelte';
export { toast } from './toast.svelte';
export { notify, closeNotification, setNotificationProvider, getNotificationProvider } from './notification.svelte';
export { t, setLocale, getLocale, getAvailableLocales, addTranslations, useTranslation } from './i18n.svelte';
export { audit, setAuditHandler, setAuditLogProvider, getAuditLogProvider } from './audit';
export type { AuditLogProvider } from './audit';
export { setChatProvider, getChatProvider, setChatContext, getChatContext } from './chatProvider.svelte';
export type { ChatProvider, ChatMessage, ChatContext, ChatAction } from './chatProvider.svelte';
export { getTheme, setTheme, toggleTheme, getResolvedTheme, getColorTheme, setColorTheme, colorThemes, configureTheme, getThemeConfig, clearCssOverrides, builtinPresets, registerColorPreset, getColorPresets } from './theme.svelte';
export type { ThemeMode, ColorTheme, ThemeStrategy, ThemeConfig, ColorPreset } from './theme.svelte';
export { setUnsavedChanges, getUnsavedChanges, initUnsavedChangesNotifier } from './unsaved-changes.svelte';
export { setAdminOptions, getAdminOptions, getTextTransformers } from './options';
export type { AdminOptions, TextTransformers, OvertimeConfig } from './options';

export * from './query-keys';
export { HttpError } from './types';
export type {
  DataProvider, AuthProvider, NotificationProvider, MutationMode,
  ValidationErrors, CrudOperator, LogicalFilter,
  CustomParams, CustomResult,
  GetListParams, GetListResult,
  GetOneParams, GetOneResult,
  GetManyParams, GetManyResult,
  CreateParams, CreateResult,
  CreateManyParams, CreateManyResult,
  UpdateParams, UpdateResult,
  UpdateManyParams, UpdateManyResult,
  DeleteParams, DeleteResult,
  DeleteManyParams, DeleteManyResult,
  Pagination, Sort, Filter, Identity,
  ResourceDefinition, FieldDefinition, MenuItem,
  AuthActionResult, CheckResult,
  ResourceTypeMap, KnownResources, InferData,
  BaseRecord,
} from './types';
export type { InvalidateScope } from './options';
export type { LiveProvider, LiveEvent, LiveMode } from './live.svelte';
export type { Action, CanParams, CanResult, AccessControlProvider, AccessControlResult, AccessControlFn } from './permissions';
export type { AuditEntry, AuditHandler } from './audit';
export { useCan } from './useCan';
export type { UseCanOptions, UseCanResult } from './useCan';
export { createCaslAccessControl } from './adapters/casl';
export { createCasbinAccessControl } from './adapters/casbin';
export type { CasbinAdapterOptions } from './adapters/casbin';
export { useExport, useImport } from './data-transfer.svelte';
export type { UseExportOptions, UseImportOptions } from './data-transfer.svelte';
export {
  useLogin, useLogout,
  useRegister, useForgotPassword, useUpdatePassword,
  useGetIdentity, useIsAuthenticated,
  useOnError, usePermissions,
} from './auth-hooks.svelte';
export { useParsed } from './useParsed.svelte';
export * from './useStepsForm.svelte';
export { createHashRouterProvider, createHistoryRouterProvider } from './router-provider';
export type { RouterProvider } from './router-provider';
export { inferFieldType, inferResource } from './inferencer';
export type { InferResult } from './inferencer';
export { createWebSocketLiveProvider } from './live-websocket';
export type { WebSocketLiveProviderOptions } from './live-websocket';
export { createSSELiveProvider } from './live-sse';
export type { SSELiveProviderOptions } from './live-sse';
export { inferFromOpenAPI } from './inferencer-openapi';
export type { InferFromOpenAPIOptions } from './inferencer-openapi';
export {
  getDefaultFilter, getDefaultSortOrder,
  unionFilters, unionSorters,
  file2Base64, generateDefaultDocumentTitle,
} from './helpers';
export { TableState } from './table-state.svelte';
export type { TableStateOptions } from './table-state.svelte';
