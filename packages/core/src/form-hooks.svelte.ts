import { useQueryClient } from '@tanstack/svelte-query';
import { useParsed } from './useParsed';
import { getAdminOptions } from './options';
import { getDataProviderForResource } from './context.svelte';
import { createQuery, createMutation } from '@tanstack/svelte-query';
import { toast } from './toast.svelte';
import { t } from './i18n.svelte';
import { audit } from './audit';
import { navigate } from './router';
import { HttpError } from './types';
import type { BaseRecord, MutationMode, KnownResources } from './types';

export interface UseFormOptions<TQueryFnData extends BaseRecord = BaseRecord, TError = HttpError, TVariables = Record<string, unknown>, TData extends BaseRecord = TQueryFnData> {
  resource?: KnownResources;
  action?: 'create' | 'edit' | 'clone';
  id?: string | number;
  redirect?: 'list' | 'edit' | 'show' | false;
  successNotification?: string | false;
  errorNotification?: string | false;
  dataProviderName?: string;
  onMutationSuccess?: (data: unknown) => void;
  onMutationError?: (error: Error) => void;
  meta?: Record<string, unknown>;
  queryMeta?: Record<string, unknown>;
  mutationMeta?: Record<string, unknown>;
  disableServerSideValidation?: boolean;
  validate?: (values: TVariables) => Record<string, string> | null;
  autoSave?: {
    enabled: boolean;
    debounce?: number;
    onFinish?: (values: TVariables) => TVariables;
    invalidateOnUnmount?: boolean;
    invalidates?: string[];
  };
  mutationMode?: MutationMode;
  undoableTimeout?: number;
  invalidates?: string[] | false;
  optimisticUpdateMap?: {
    list?: boolean | ((previous: unknown, variables: TVariables, id?: string | number) => unknown);
    detail?: boolean | ((previous: unknown, variables: TVariables, id?: string | number) => unknown);
  };
  queryOptions?: { staleTime?: number; enabled?: boolean };
  createMutationOptions?: Record<string, unknown>;
  updateMutationOptions?: Record<string, unknown>;
  warnWhenUnsavedChanges?: boolean;
}

export type UseFormResult<TQueryFnData extends BaseRecord = BaseRecord, TError = HttpError, TVariables = Record<string, unknown>, TData extends BaseRecord = TQueryFnData> = {
  readonly query: unknown;
  readonly mutation: unknown;
  readonly formLoading: boolean;
  readonly errors: Record<string, string>;
  setFieldError: (field: string, message: string) => void;
  clearErrors: () => void;
  clearFieldError: (field: string) => void;
  onFinish: (values: TVariables, finishOptions?: { redirect?: 'list' | 'edit' | 'show' | false }) => Promise<void>;
  onFinishAutoSave: (values: TVariables) => Promise<void>;
  triggerAutoSave: (values: TVariables) => void;
  readonly autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  readonly resource: string;
  readonly action: 'create' | 'edit' | 'clone';
  readonly id: string | number | undefined;
  setId: (newId: string | number) => void;
  readonly mutationMode: MutationMode;
  redirect: (to: 'list' | 'edit' | 'show' | false) => void;
  readonly autoSaveProps: { status: 'idle' | 'loading' | 'success' | 'error'; data: unknown; error: unknown };
};

export function useForm<
  TQueryFnData extends BaseRecord = BaseRecord,
  TError = HttpError,
  TVariables = Record<string, unknown>,
  TData extends BaseRecord = TQueryFnData
>(options: UseFormOptions<TQueryFnData, TError, TVariables, TData> = {}): UseFormResult<TQueryFnData, TError, TVariables, TData> {
  const queryClient = useQueryClient();
  const parsed = useParsed();
  const adminOptions = getAdminOptions();
  
  const resource = options.resource ?? parsed.resource ?? '';
  const action = options.action ?? (parsed.action === 'list' ? 'create' : parsed.action as 'create' | 'edit' | 'clone') ?? 'create';
  let currentId = $state<string | number | undefined>(options.id ?? parsed.id);
  
  const {
    redirect: redirectDefault = 'list',
    successNotification, errorNotification,
    onMutationSuccess, onMutationError,
    meta: hookMeta, queryMeta: hookQueryMeta, mutationMeta: hookMutationMeta,
    disableServerSideValidation, validate, autoSave,
    mutationMode = adminOptions.mutationMode ?? 'pessimistic',
    undoableTimeout = adminOptions.undoableTimeout ?? 5000,
    dataProviderName, invalidates: invalidateScopes,
    optimisticUpdateMap,
    queryOptions,
  } = options;

  const provider = getDataProviderForResource(resource, dataProviderName);
  const parsedMeta = typeof window !== 'undefined' ? Object.fromEntries(new URLSearchParams(window.location.search).entries()) : {};
  const queryMeta = { ...parsedMeta, ...hookMeta, ...hookQueryMeta };
  const mutationMeta = { ...parsedMeta, ...hookMeta, ...hookMutationMeta };

  function setId(newId: string | number) { currentId = newId; }

  let errors = $state<Record<string, string>>({});
  function setFieldError(field: string, message: string) { errors = { ...errors, [field]: message }; }
  function clearErrors() { errors = {}; }
  function clearFieldError(field: string) { delete errors[field]; }

  function runValidation(values: TVariables): boolean {
    clearErrors();
    if (validate) {
      const result = validate(values);
      if (result && Object.keys(result).length > 0) {
        errors = result;
        return false;
      }
    }
    return true;
  }

  function handleHttpError(error: Error) {
    if (error instanceof HttpError && error.errors && !disableServerSideValidation) {
      for (const [field, messages] of Object.entries(error.errors)) {
        const msg = Array.isArray(messages) ? messages[0] : messages;
        setFieldError(field, msg);
      }
      if (errorNotification !== false) toast.error(errorNotification || error.message || t('common.operationFailed'));
    } else {
      if (errorNotification !== false) toast.error(errorNotification || t('common.operationFailed') + ': ' + error.message);
    }
  }

  const query = (action === 'edit' || action === 'clone') && currentId != null
    ? createQuery(() => ({
        queryKey: [resource, 'one', currentId],
        queryFn: async () => {
          const result = await provider.getOne<TQueryFnData>({ resource, id: currentId!, meta: queryMeta });
          return result.data;
        },
        enabled: (queryOptions?.enabled ?? true) && currentId != null,
        staleTime: queryOptions?.staleTime,
      }))
    : null;

  const createMut = createMutation(() => ({
    ...options.createMutationOptions,
    mutationFn: (variables: TVariables) => provider.create<TData, TVariables>({ resource, variables, meta: mutationMeta }),
    onSuccess: (data: { data: TData }) => {
      if (invalidateScopes !== false) queryClient.invalidateQueries({ queryKey: [resource] });
      if (successNotification !== false) toast.success(successNotification || t('common.createSuccess'));
      audit({ action: 'create', resource, recordId: String(data.data.id) });
      onMutationSuccess?.(data);
      if (redirectOverride !== false) doRedirect(redirectOverride ?? redirectDefault);
    },
    onError: (error: Error) => { handleHttpError(error); onMutationError?.(error); },
  }));

  const updateMut = createMutation(() => ({
    ...options.updateMutationOptions,
    mutationFn: (variables: TVariables) => provider.update<TData, TVariables>({ resource, id: currentId!, variables, meta: mutationMeta }),
    onSuccess: (data: { data: TData }) => {
      if (invalidateScopes !== false) queryClient.invalidateQueries({ queryKey: [resource] });
      if (successNotification !== false) toast.success(successNotification || t('common.updateSuccess'));
      audit({ action: 'update', resource, recordId: String(currentId) });
      onMutationSuccess?.(data);
      if (redirectOverride !== false) doRedirect(redirectOverride ?? redirectDefault);
    },
    onError: (error: Error) => { handleHttpError(error); onMutationError?.(error); },
  }));

  let redirectOverride: 'list' | 'edit' | 'show' | false | undefined;

  function doRedirect(to: 'list' | 'edit' | 'show' | false) {
    if (to === 'list') navigate(`/${resource}`);
    else if (to === 'edit' && currentId) navigate(`/${resource}/edit/${currentId}`);
    else if (to === 'show' && currentId) navigate(`/${resource}/show/${currentId}`);
  }

  async function onFinish(values: TVariables, finishOptions?: { redirect?: 'list' | 'edit' | 'show' | false }) {
    if (!runValidation(values)) { toast.warning(t('validation.required')); return; }
    redirectOverride = finishOptions?.redirect;
    if (action === 'create' || action === 'clone') await createMut.mutateAsync(values);
    else await updateMut.mutateAsync(values);
  }

  async function onFinishAutoSave(values: TVariables) {
    if (action === 'create' || action === 'clone') return; // Only autosave on edit
    redirectOverride = false; // Never redirect on autoSave
    await updateMut.mutateAsync(values);
  }

  let autoSaveStatus = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

  function triggerAutoSave(values: TVariables) {
    if (!autoSave?.enabled || action === 'create') return;
    if (autoSaveTimer) clearTimeout(autoSaveTimer);

    autoSaveTimer = setTimeout(async () => {
      const finalValues = autoSave.onFinish ? autoSave.onFinish(values) : values;
      autoSaveStatus = 'saving';
      try {
        await provider.update<TData, TVariables>({ resource, id: currentId!, variables: finalValues, meta: mutationMeta });
        const scopes = autoSave.invalidates ?? ['resourceAll'];
        for (const scope of scopes) {
          if (scope === 'resourceAll') queryClient.invalidateQueries({ queryKey: [resource] });
          else if (scope === 'detail' && currentId) queryClient.invalidateQueries({ queryKey: [resource, 'one', currentId] });
          else if (scope === 'list') queryClient.invalidateQueries({ queryKey: [resource, 'list'] });
        }
        autoSaveStatus = 'saved';
        lastAutoSaveData = undefined; // placeholder for returned data
        lastAutoSaveError = null;
        setTimeout(() => { autoSaveStatus = 'idle'; }, 2000);
      } catch (e) {
        autoSaveStatus = 'error';
        lastAutoSaveError = e;
      }
    }, autoSave.debounce ?? 1000);
  }

  let lastAutoSaveData = $state<unknown>(null);
  let lastAutoSaveError = $state<unknown>(null);

  if (autoSave?.invalidateOnUnmount) {
    $effect(() => {
      return () => queryClient.invalidateQueries({ queryKey: [resource] });
    });
  }

  // warnWhenUnsavedChanges
  const shouldWarn = options.warnWhenUnsavedChanges ?? adminOptions.warnWhenUnsavedChanges;
  if (shouldWarn && typeof window !== 'undefined') {
    $effect(() => {
      const handler = (e: BeforeUnloadEvent) => {
        // Here we'd typically check a dirty state, but useForm itself doesn't track dirty fields.
        // Usually the form library (svelte-forms etc) handles dirty state.
        // Assuming we always warn if enabled for now.
        e.preventDefault();
        e.returnValue = '';
      };
      window.addEventListener('beforeunload', handler);
      return () => window.removeEventListener('beforeunload', handler);
    });
  }

  return {
    query,
    get formLoading() { return (query?.isLoading ?? false) || createMut.isPending || updateMut.isPending; },
    mutation: action === 'edit' ? updateMut : createMut,
    onFinish,
    onFinishAutoSave,
    get errors() { return errors; },
    setFieldError, clearErrors, clearFieldError,
    triggerAutoSave,
    get autoSaveStatus() { return autoSaveStatus; },
    resource, action,
    get id() { return currentId; },
    setId, mutationMode, redirect: doRedirect,
    get autoSaveProps() {
      return {
        status: autoSaveStatus as 'idle' | 'loading' | 'success' | 'error',
        data: lastAutoSaveData,
        error: lastAutoSaveError,
      };
    },
  };
}
