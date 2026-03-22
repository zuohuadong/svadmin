// Core barrel exports

export {
  setDataProvider, getDataProvider,
  setAuthProvider, getAuthProvider,
  setResources, getResources, getResource,
} from './context';
export {
  useList, useInfiniteList,
  useOne, useShow,
  useSelect, useMany,
  useCustom, useApiUrl,
  useCreate, useCreateMany,
  useUpdate, useUpdateMany,
  useDelete, useDeleteMany,
  useForm, useTable,
  useNavigation,
  useResource,
} from './hooks.svelte';
export { matchRoute, navigate, currentPath } from './router';
export { readURLState, writeURLState } from './url-sync';
export { setAccessControl, canAccess, canAccessAsync } from './permissions';
export { useLive } from './live';
export { toast } from './toast.svelte';
export { t, setLocale, getLocale, getAvailableLocales, addTranslations } from './i18n.svelte';
export { audit, setAuditHandler } from './audit';
export { getTheme, setTheme, toggleTheme, getResolvedTheme } from './theme.svelte';
export type { ThemeMode } from './theme.svelte';

export type {
  DataProvider, AuthProvider, NotificationProvider, MutationMode,
  GetListParams, GetListResult,
  GetOneParams, GetOneResult,
  GetManyParams, GetManyResult,
  CreateParams, CreateResult,
  CreateManyParams, CreateManyResult,
  UpdateParams, UpdateResult,
  UpdateManyParams, UpdateManyResult,
  DeleteParams, DeleteResult,
  DeleteManyParams, DeleteManyResult,
  CustomParams, CustomResult,
  Pagination, Sort, Filter, Identity,
  ResourceDefinition, FieldDefinition,
  AuthActionResult, CheckResult,
} from './types';
export type { LiveProvider, LiveEvent } from './live';
export type { Action, AccessControlResult, AccessControlFn } from './permissions';
export type { AuditEntry, AuditHandler } from './audit';
