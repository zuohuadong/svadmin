// Core barrel exports

export {
  setDataProvider, getDataProvider, getDataProviderForResource, getDataProviderNames,
  setAuthProvider, getAuthProvider,
  setResources, getResources, getResource,
  setRouterProvider, getRouterProvider,
} from './context';
export type { DataProviderInput } from './context';
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
export { setAccessControl, canAccess, canAccessAsync } from './permissions';
export { useLive, useSubscription, usePublish } from './live';
export { toast } from './toast.svelte';
export { notify, closeNotification, setNotificationProvider, getNotificationProvider } from './notification.svelte';
export { t, setLocale, getLocale, getAvailableLocales, addTranslations, useTranslation } from './i18n.svelte';
export { audit, setAuditHandler, setAuditLogProvider, getAuditLogProvider } from './audit';
export type { AuditLogProvider } from './audit';
export { getTheme, setTheme, toggleTheme, getResolvedTheme, getColorTheme, setColorTheme, colorThemes } from './theme.svelte';
export type { ThemeMode, ColorTheme } from './theme.svelte';
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
  ResourceDefinition, FieldDefinition,
  AuthActionResult, CheckResult,
  ResourceTypeMap, KnownResources, InferData,
  BaseRecord,
} from './types';
export type { InvalidateScope } from './options';
export type { LiveProvider, LiveEvent, LiveMode } from './live';
export type { Action, AccessControlResult, AccessControlFn } from './permissions';
export type { AuditEntry, AuditHandler } from './audit';
export { useCan } from './useCan';
export { useExport, useImport } from './data-transfer';
export type { UseExportOptions, UseImportOptions } from './data-transfer';
export {
  useLogin, useLogout,
  useRegister, useForgotPassword, useUpdatePassword,
  useGetIdentity, useIsAuthenticated,
  useOnError, usePermissions,
} from './auth-hooks.svelte';
export { useParsed } from './useParsed';
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
