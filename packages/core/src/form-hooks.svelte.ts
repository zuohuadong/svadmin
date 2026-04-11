import { useQueryClient } from '@tanstack/svelte-query';
import { useParsed } from './useParsed.svelte';
import { getAdminOptions } from './options.svelte';
import { getDataProviderForResource, getResource, getLiveProvider, getAuthProvider } from './context.svelte';
import { createQuery, createMutation } from '@tanstack/svelte-query';
import { notify } from './notification.svelte';
import { t } from './i18n.svelte';
import { audit } from './audit';
import { navigate, currentPath } from './router';
import { HttpError } from './types';
import type { BaseRecord, MutationMode, KnownResources } from './types';

// ─── Types ───────────────────────────────────────────────────────────

export interface UseFormOptions<
  TVariables extends Record<string, unknown> = Record<string, unknown>,
  TData extends BaseRecord = BaseRecord,
  TError = HttpError,
> {
  resource?: KnownResources;
  action?: 'create' | 'edit' | 'clone';
  id?: string | number;
  redirect?: 'list' | 'edit' | 'show' | false;

  /** Initial values for the form. Merged with query data in edit mode (query wins). */
  defaultValues?: TVariables;

  // ─── Validation ───────────────────────────────────────────────
  /** Full-form validator. Returns field→error map or null. */
  validate?: (values: TVariables) => Record<string, string> | null;
  /** Per-field validator for real-time validation. */
  validateField?: (field: string, value: unknown, values: TVariables) => string | null;

  // ─── Notifications ────────────────────────────────────────────
  successNotification?: string | false;
  errorNotification?: string | false;

  // ─── Callbacks ────────────────────────────────────────────────
  onMutationSuccess?: (data: unknown) => void;
  onMutationError?: (error: Error) => void;
  /** Called every time a field value changes. */
  onChange?: (event: { field: string; value: unknown; values: TVariables }) => void;
  /** Called before mutation. Return false or call cancel() to prevent submission. */
  onSubmit?: (ctx: { values: TVariables; action: 'create' | 'edit' | 'clone'; cancel: () => void }) => void | boolean;

  // ─── Meta ─────────────────────────────────────────────────────
  meta?: Record<string, unknown>;
  queryMeta?: Record<string, unknown>;
  mutationMeta?: Record<string, unknown>;

  // ─── Server validation ────────────────────────────────────────
  disableServerSideValidation?: boolean;

  // ─── AutoSave ─────────────────────────────────────────────────
  autoSave?: {
    enabled: boolean;
    debounce?: number;
    onFinish?: (values: TVariables) => TVariables;
    invalidateOnUnmount?: boolean;
    invalidates?: string[];
  };

  // ─── Mutation behavior ────────────────────────────────────────
  mutationMode?: MutationMode;
  undoableTimeout?: number;
  invalidates?: string[] | false;
  optimisticUpdateMap?: {
    list?: boolean | ((previous: unknown, variables: TVariables, id?: string | number) => unknown);
    detail?: boolean | ((previous: unknown, variables: TVariables, id?: string | number) => unknown);
  };

  // ─── Query config ─────────────────────────────────────────────
  queryOptions?: { staleTime?: number; enabled?: boolean };
  createMutationOptions?: Record<string, unknown>;
  updateMutationOptions?: Record<string, unknown>;

  /** DataProvider to use for this form */
  dataProviderName?: string;

  warnWhenUnsavedChanges?: boolean;
}

export interface UseFormReturn<
  TVariables extends Record<string, unknown> = Record<string, unknown>,
  TData extends BaseRecord = BaseRecord,
> {
  // ─── Form values (single source of truth) ─────────────────────
  /** Reactive form values. Read/write directly. */
  readonly values: TVariables;
  /** Set a single field value. Tracks tainted state and fires onChange. */
  setFieldValue: (field: string, value: unknown, opts?: { taint?: boolean }) => void;
  /** Bulk-set multiple field values. */
  setValues: (newValues: Partial<TVariables>, opts?: { taint?: boolean }) => void;

  // ─── Tainted (dirty) ──────────────────────────────────────────
  readonly tainted: Record<string, boolean>;
  isTainted: (field?: string) => boolean;

  // ─── Errors ───────────────────────────────────────────────────
  readonly errors: Record<string, string>;
  setFieldError: (field: string, message: string) => void;
  clearFieldError: (field: string) => void;
  clearErrors: () => void;
  /** Validate a single field. Sets/clears the field error. Returns the error or null. */
  validateField: (field: string) => string | null;

  // ─── Submission ───────────────────────────────────────────────
  /** Submit the form. Validates → onSubmit hook → mutation → redirect. */
  submit: (overrides?: { redirect?: 'list' | 'edit' | 'show' | false }) => Promise<void>;
  /** Reset form to initial/query values. Clears tainted and errors. */
  reset: () => void;

  // ─── State ──────────────────────────────────────────────────────
  readonly loading: boolean;
  readonly submitting: boolean;
  readonly action: 'create' | 'edit' | 'clone';
  readonly resource: string;
  readonly id: string | number | undefined;
  readonly isDirty: boolean;
  setId: (id: string | number | undefined) => void;
  setAction: (action: 'create' | 'edit' | 'clone') => void;
  mutationMode: MutationMode;
  redirect: (to: 'list' | 'edit' | 'show' | false) => void;

  // ─── AutoSave ─────────────────────────────────────────────────
  triggerAutoSave: () => void;
  readonly autoSave: { status: 'idle' | 'saving' | 'saved' | 'error'; data: unknown; error: unknown };

  // ─── Raw query/mutation (escape hatch) ────────────────────────
  readonly query: unknown;
  readonly mutation: unknown;
}

// ─── Implementation ──────────────────────────────────────────────────

export function useForm<
  TVariables extends Record<string, unknown> = Record<string, unknown>,
  TData extends BaseRecord = BaseRecord,
  TError = HttpError,
>(options: UseFormOptions<TVariables, TData, TError> = {} as UseFormOptions<TVariables, TData, TError>): UseFormReturn<TVariables, TData> {
  const queryClient = useQueryClient();
  const parsed = useParsed();
  const adminOptions = getAdminOptions();

  const resource = $derived(options.resource ?? parsed.resource ?? '');
  let action = $state<'create' | 'edit' | 'clone'>(options.action ?? (parsed.action === 'list' ? 'create' : parsed.action as 'create' | 'edit' | 'clone') ?? 'create');
  let currentId = $state<string | number | undefined>(options.id ?? parsed.id);

  const defaultRedirectOpt = $derived(action === 'clone' ? adminOptions.redirect?.afterClone : action === 'edit' ? adminOptions.redirect?.afterEdit : adminOptions.redirect?.afterCreate);
  const {
    redirect: redirectOption,
    successNotification, errorNotification,
    onMutationSuccess, onMutationError,
    meta: hookMeta, queryMeta: hookQueryMeta, mutationMeta: hookMutationMeta,
    disableServerSideValidation, autoSave: autoSaveOpts,
    mutationMode = adminOptions.mutationMode ?? 'pessimistic',
    undoableTimeout = adminOptions.undoableTimeout ?? 5000,
    dataProviderName, invalidates: invalidateScopes,
    optimisticUpdateMap,
    queryOptions,
    onChange: onChangeFn,
    onSubmit: onSubmitFn,
  } = options;
  // Reactive redirect: uses $derived `defaultRedirectOpt` so redirect target
  // updates when `action` changes at runtime (e.g., via `setAction`).
  const redirectDefault = $derived(redirectOption ?? defaultRedirectOpt ?? 'list');

  const provider = $derived(getDataProviderForResource(resource, dataProviderName));
  const parsedMeta = useParsed().params || {};
  const queryMeta = { ...parsedMeta, ...hookMeta, ...hookQueryMeta };
  const mutationMeta = { ...parsedMeta, ...hookMeta, ...hookMutationMeta };

  function setId(newId: string | number | undefined) { currentId = newId; }
  function setAction(newAction: 'create' | 'edit' | 'clone') { action = newAction; }

  // ─── Form values (single source of truth) ───────────────────────
  let values = $state<TVariables>((options.defaultValues ?? {}) as TVariables);
  let initialValues = $state<TVariables>((options.defaultValues ?? {}) as TVariables);

  function setFieldValue(field: string, value: unknown, opts?: { taint?: boolean }) {
    values = { ...values, [field]: value } as TVariables;
    const shouldTaint = opts?.taint ?? true;
    if (shouldTaint) tainted = { ...tainted, [field]: true };
    // Clear field error on change
    if (errors[field]) clearFieldError(field);
    onChangeFn?.({ field, value, values });
  }

  function setValues(newValues: Partial<TVariables>, opts?: { taint?: boolean }) {
    values = { ...values, ...newValues } as TVariables;
    const shouldTaint = opts?.taint ?? true;
    if (shouldTaint) {
      const newTainted = { ...tainted };
      for (const key of Object.keys(newValues)) newTainted[key] = true;
      tainted = newTainted;
    }
  }

  // ─── Tainted (dirty) state ──────────────────────────────────────
  let tainted = $state<Record<string, boolean>>({});

  function isTainted(field?: string): boolean {
    if (field !== undefined) return !!tainted[field];
    return Object.values(tainted).some(Boolean);
  }

  // ─── Errors ─────────────────────────────────────────────────────
  let errors = $state<Record<string, string>>({});

  function setFieldError(field: string, message: string) { errors = { ...errors, [field]: message }; }
  function clearErrors() { errors = {}; }
  function clearFieldError(field: string) {
    const next = { ...errors };
    delete next[field];
    errors = next;
  }

  function doValidateField(field: string): string | null {
    const value = values[field];
    if (options.validateField) {
      const msg = options.validateField(field, value, values);
      if (msg) { setFieldError(field, msg); return msg; }
      else { clearFieldError(field); }
    }
    return null;
  }

  function runValidation(): boolean {
    clearErrors();
    const validate = options.validate;
    if (validate) {
      const result = validate(values);
      if (result && Object.keys(result).length > 0) {
        errors = result;
        return false;
      }
    }
    return true;
  }

  // ─── Reset ──────────────────────────────────────────────────────
  function reset() {
    values = { ...initialValues } as TVariables;
    tainted = {};
    clearErrors();
  }

  // ─── Server error handling ──────────────────────────────────────
  async function checkError(error: unknown) {
    try {
      const authProvider = getAuthProvider({ optional: true });
      if (!authProvider?.onError) return;
      const result = await authProvider.onError(error);
      if (result.logout) {
        await authProvider.logout?.();
        navigate(result.redirectTo ?? '/login');
      } else if (result.redirectTo) {
        navigate(result.redirectTo);
      }
    } catch { /* auth check failed silently */ }
  }

  function handleHttpError(error: Error) {
    checkError(error);
    if (error instanceof HttpError && error.errors && !disableServerSideValidation) {
      for (const [field, messages] of Object.entries(error.errors)) {
        const msg = Array.isArray(messages) ? messages[0] : messages;
        setFieldError(field, msg);
      }
      if (errorNotification !== false) notify({ type: 'error', message: typeof errorNotification === 'string' ? errorNotification : (error.message || t('common.operationFailed')) });
    } else {
      if (errorNotification !== false) notify({ type: 'error', message: typeof errorNotification === 'string' ? errorNotification : (t('common.operationFailed') + ': ' + error.message) });
    }
  }

  // ─── Query (edit/clone mode) ────────────────────────────────────
  // Always create the query — use `enabled` to conditionally activate.
  // This ensures setAction('edit') at runtime will trigger a fetch.
  const query = createQuery(() => ({
    queryKey: [resource, 'one', currentId],
    queryFn: async () => {
      const result = await provider.getOne<BaseRecord>({ resource, id: currentId!, meta: queryMeta });
      return result.data;
    },
    enabled: (queryOptions?.enabled ?? true) && (action === 'edit' || action === 'clone') && currentId != null,
    staleTime: queryOptions?.staleTime,
  }));

  // Auto-populate values from query data
  let queryInitializedId: string | number | undefined = undefined;
  {
    $effect.pre(() => {
      // Discard previous fetch lock and default when switched strictly back to create
      if (action === 'create' && currentId === undefined && queryInitializedId !== undefined) {
        queryInitializedId = undefined;
        const def = (options.defaultValues ?? {}) as TVariables;
        values = { ...def };
        initialValues = { ...def };
        return;
      }
      if (queryInitializedId === currentId) return;
      const data = query.data as Record<string, unknown> | undefined;
      const pk = getResource(resource).primaryKey ?? 'id';
      if (data && (currentId == null || String(data[pk]) === String(currentId) || !data[pk])) {
        // In clone mode, strip out identifiers
        const targetData = action === 'clone' 
          ? Object.fromEntries(Object.entries(data).filter(([k]) => k !== 'id' && k !== '_id' && k !== pk))
          : data;
        // Merge: defaultValues < query data
        const merged = { ...(options.defaultValues ?? {}), ...targetData } as TVariables;
        values = merged;
        initialValues = { ...merged } as TVariables;
        queryInitializedId = currentId;
      }
    });
  }

  // ─── Mutations ──────────────────────────────────────────────────
  let redirectOverride: 'list' | 'edit' | 'show' | false | undefined;

  const createMut = createMutation(() => ({
    ...options.createMutationOptions,
    mutationFn: (variables: TVariables) => provider.create<TData, TVariables>({ resource, variables, meta: mutationMeta }),
    onSuccess: (data: { data: TData }) => {
      // Targeted invalidation: list + many (like refine)
      if (invalidateScopes !== false) {
        queryClient.invalidateQueries({ queryKey: [resource, 'list'] });
        queryClient.invalidateQueries({ queryKey: [resource, 'many'] });
      }
      if (successNotification !== false) notify({ type: 'success', message: typeof successNotification === 'string' ? successNotification : t('common.createSuccess') });
      const pk = getResource(resource).primaryKey ?? 'id';
      const newId = (data.data as Record<string, unknown>)[pk];
      audit({ action: 'create', resource, recordId: String(newId) });
      // Publish live event
      try {
        const lp = getLiveProvider();
        if (lp?.publish) lp.publish({ type: 'INSERT', resource, payload: { ids: newId != null ? [newId as string | number] : [] } });
      } catch { /* no live provider */ }
      onMutationSuccess?.(data);
      if (redirectOverride !== false) {
        if (newId != null) currentId = newId as string | number;
        doRedirect(redirectOverride ?? redirectDefault);
      }
    },
    onError: (error: Error) => { handleHttpError(error); onMutationError?.(error); },
  }));

  const updateMut = createMutation(() => ({
    ...options.updateMutationOptions,
    mutationFn: (variables: TVariables) => provider.update<TData, TVariables>({ resource, id: currentId!, variables, meta: mutationMeta }),
    onSuccess: (data: { data: TData }) => {
      // Targeted invalidation: list + many + specific detail (like refine)
      if (invalidateScopes !== false) {
        queryClient.invalidateQueries({ queryKey: [resource, 'list'] });
        queryClient.invalidateQueries({ queryKey: [resource, 'many'] });
        if (currentId != null) queryClient.invalidateQueries({ queryKey: [resource, 'one', currentId] });
      }
      if (successNotification !== false) notify({ type: 'success', message: typeof successNotification === 'string' ? successNotification : t('common.updateSuccess') });
      audit({ action: 'update', resource, recordId: String(currentId) });
      // Publish live event
      try {
        const lp = getLiveProvider();
        if (lp?.publish) lp.publish({ type: 'UPDATE', resource, payload: { ids: currentId != null ? [currentId] : [] } });
      } catch { /* no live provider */ }
      onMutationSuccess?.(data);
      if (redirectOverride !== false) doRedirect(redirectOverride ?? redirectDefault);
    },
    onError: (error: Error) => { handleHttpError(error); onMutationError?.(error); },
  }));

  function doRedirect(to: 'list' | 'edit' | 'show' | false) {
    const path = currentPath().split('?')[0];
    const parts = path.split('/');
    const resIdx = parts.lastIndexOf(String(resource));
    const base = resIdx >= 0 ? parts.slice(0, resIdx + 1).join('/') : `/${resource}`;

    if (to === 'list') navigate(base);
    else if (to === 'edit' && currentId) navigate(`${base}/edit/${currentId}`);
    else if (to === 'show' && currentId) navigate(`${base}/show/${currentId}`);
  }

  // ─── Submit ─────────────────────────────────────────────────────
  async function submit(overrides?: { redirect?: 'list' | 'edit' | 'show' | false }) {
    // onSubmit pre-hook
    if (onSubmitFn) {
      let cancelled = false;
      const result = onSubmitFn({ values, action, cancel: () => { cancelled = true; } });
      if (result === false || cancelled) return;
    }

    if (!runValidation()) { notify({ type: 'warning', message: t('validation.required') }); return; }
    redirectOverride = overrides?.redirect;
    try {
      if (action === 'create' || action === 'clone') await createMut.mutateAsync(values);
      else await updateMut.mutateAsync(values);
      // Untaint on success
      tainted = {};
    } catch (error) {
      // Errors are already handled by the mutation's onError callback.
      // We catch here to prevent unhandled promise rejections.
    }
  }

  // ─── AutoSave ───────────────────────────────────────────────────
  let autoSaveStatus = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
  let lastAutoSaveData = $state<unknown>(null);
  let lastAutoSaveError = $state<unknown>(null);

  function triggerAutoSave() {
    const currentAction = action; // read $state reactively at call time
    if (!autoSaveOpts?.enabled || currentAction === 'create' || currentAction === 'clone') return;
    if (autoSaveTimer) clearTimeout(autoSaveTimer);

    autoSaveTimer = setTimeout(async () => {
      const finalValues = autoSaveOpts.onFinish ? autoSaveOpts.onFinish(values) : values;
      autoSaveStatus = 'saving';
      try {
        await provider.update<TData, TVariables>({ resource, id: currentId!, variables: finalValues, meta: mutationMeta });
        const scopes = autoSaveOpts.invalidates ?? ['resourceAll'];
        for (const scope of scopes) {
          if (scope === 'resourceAll') queryClient.invalidateQueries({ queryKey: [resource] });
          else if (scope === 'detail' && currentId) queryClient.invalidateQueries({ queryKey: [resource, 'one', currentId] });
          else if (scope === 'list') queryClient.invalidateQueries({ queryKey: [resource, 'list'] });
        }
        autoSaveStatus = 'saved';
        lastAutoSaveData = undefined;
        lastAutoSaveError = null;
        setTimeout(() => { autoSaveStatus = 'idle'; }, 2000);
      } catch (e) {
        autoSaveStatus = 'error';
        lastAutoSaveError = e;
      }
    }, autoSaveOpts.debounce ?? 1000);
  }

  if (autoSaveOpts?.invalidateOnUnmount) {
    $effect(() => {
      return () => queryClient.invalidateQueries({ queryKey: [resource] });
    });
  }

  // ─── warnWhenUnsavedChanges ─────────────────────────────────────
  const shouldWarn = options.warnWhenUnsavedChanges ?? adminOptions.warnWhenUnsavedChanges;
  if (shouldWarn && typeof window !== 'undefined') {
    $effect(() => {
      if (!isTainted()) return;
      const handler = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
      };
      window.addEventListener('beforeunload', handler);
      return () => window.removeEventListener('beforeunload', handler);
    });
  }

  // ─── Return ─────────────────────────────────────────────────────
  return {
    // Values
    get values() { return values; },
    setFieldValue,
    setValues,

    // Tainted
    get tainted() { return tainted; },
    isTainted,

    // Errors
    get errors() { return errors; },
    setFieldError, clearFieldError, clearErrors,
    validateField: doValidateField,

    // Submission
    submit,
    reset,

    // State
    get loading() { return query.isLoading ?? false; },
    get submitting() { return createMut.isPending || updateMut.isPending; },
    get action() { return action; },
    get resource() { return resource; },
    get id() { return currentId; },
    get isDirty() { return Object.keys(tainted).length > 0; },
    setId,
    setAction,
    mutationMode,
    redirect: doRedirect,

    // AutoSave
    triggerAutoSave,
    get autoSave() {
      return {
        status: autoSaveStatus as 'idle' | 'saving' | 'saved' | 'error',
        data: lastAutoSaveData,
        error: lastAutoSaveError,
      };
    },

    // Raw escape hatches
    query,
    get mutation() { return action === 'edit' ? updateMut : createMut; },
  };
}
