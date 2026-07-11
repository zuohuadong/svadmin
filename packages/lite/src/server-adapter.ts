/**
 * @svadmin/lite — Server Adapter
 *
 * Bridges @svadmin/core DataProvider into SvelteKit server loaders and form actions.
 * All data fetching happens on the server; optional client-side enhancement is
 * limited to interaction affordances such as dynamic array rows.
 */
import type {
  DataProvider, AuthProvider,
  ResourceDefinition, FieldDefinition,
  Sort, Filter,
} from '@svadmin/core';
import { redirect, isRedirect, type RequestEvent } from '@sveltejs/kit';
import { resourceToZodSchema } from './schema-generator';

// ─── List Loader ──────────────────────────────────────────────

export interface ListLoaderResult {
  records: Record<string, unknown>[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  resource: ResourceDefinition;
}

/**
 * Creates a SvelteKit `load` function that fetches a resource list
 * via the DataProvider. All state is driven by URL search params.
 */
export function createListLoader(
  dp: DataProvider,
  resource: ResourceDefinition,
) {
  return async ({ url }: { url: URL }): Promise<ListLoaderResult> => {
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const pageSize = resource.pageSize ?? 20;
    const sort = url.searchParams.get('sort') ?? undefined;
    const order = (url.searchParams.get('order') as 'asc' | 'desc') ?? 'asc';
    const search = url.searchParams.get('q') ?? undefined;

    const sorters: Sort[] = sort ? [{ field: sort, order }] : 
      resource.defaultSort ? [resource.defaultSort] : [];

    const filters: Filter[] = [];
    if (search) {
      const searchable = resource.fields.find((f: FieldDefinition) => f.searchable);
      if (searchable) {
        filters.push({ field: searchable.key, operator: 'contains', value: search });
      }
    }

    const result = await dp.getList({
      resource: resource.name,
      pagination: { current: page, pageSize },
      sorters,
      filters,
    });

    return {
      records: result.data as Record<string, unknown>[],
      total: result.total,
      page,
      pageSize,
      totalPages: Math.ceil(result.total / pageSize),
      sort,
      order,
      search,
      resource,
    };
  };
}

// ─── Detail Loader ────────────────────────────────────────────

export function createDetailLoader(
  dp: DataProvider,
  resource: ResourceDefinition,
) {
  return async ({ params }: { params: { id: string } }) => {
    const result = await dp.getOne({
      resource: resource.name,
      id: params.id,
    });
    return { record: result.data as Record<string, unknown>, resource };
  };
}

// ─── CRUD Form Actions ────────────────────────────────────────

/**
 * Creates SvelteKit form actions for create / update / delete.
 * Works with standard `<form method="POST">` submissions — no JS needed.
 */
export function createCrudActions(
  dp: DataProvider,
  resource: ResourceDefinition,
) {
  const pk = resource.primaryKey ?? 'id';

  return {
    create: async ({ request }: RequestEvent) => {
      const formData = await request.formData();
      const submittedValues = formDataToObject(formData, resource.fields);
      const validation = validateFormVariables(resource, 'create', submittedValues);
      if (!validation.success) return validation.failure;
      const variables = validation.data;
      try {
        const result = await dp.create({ resource: resource.name, variables });
        return { success: true, id: (result.data as Record<string, unknown>)[pk] };
      } catch (e) {
        if (isRedirect(e)) throw e;
        return { success: false, error: (e as Error).message, values: variables };
      }
    },

    update: async ({ request }: RequestEvent) => {
      const formData = await request.formData();
      const id = formData.get('_id') as string;
      formData.delete('_id');
      const submittedValues = formDataToObject(formData, resource.fields);
      const validation = validateFormVariables(resource, 'edit', submittedValues);
      if (!validation.success) return validation.failure;
      const variables = validation.data;
      try {
        await dp.update({ resource: resource.name, id, variables });
        return { success: true };
      } catch (e) {
        if (isRedirect(e)) throw e;
        return { success: false, error: (e as Error).message, values: variables };
      }
    },

    delete: async ({ request }: RequestEvent) => {
      const formData = await request.formData();
      const id = formData.get('id') as string;
      const redirectTo = formData.get('redirect') as string | undefined;
      try {
        await dp.deleteOne({ resource: resource.name, id });
        if (redirectTo) throw redirect(303, redirectTo);
        return { success: true };
      } catch (e) {
        if (isRedirect(e)) throw e;
        return { success: false, error: (e as Error).message };
      }
    },
  };
}

// ─── Auth Helpers ─────────────────────────────────────────────

/**
 * Creates a SvelteKit server hook that checks auth via AuthProvider
 * and redirects unauthenticated users to a login page.
 */
export function createAuthGuard(
  authProvider: AuthProvider,
  loginPath = '/lite/login',
) {
  return async ({ event, resolve }: { event: RequestEvent; resolve: (event: RequestEvent) => Promise<Response> }) => {
    // Skip auth check for the login page itself
    if (event.url.pathname === loginPath) {
      return resolve(event);
    }

    // Local Lite Session Verify 
    const session = event.cookies.get('svadmin-session');
    if (!session) {
      return new Response(null, {
        status: 302,
        headers: { Location: loginPath },
      });
    }

    try {
      const check = await authProvider.check();
      if (!check.authenticated) {
        event.cookies.delete('svadmin-session', { path: '/' });
        return new Response(null, {
          status: 302,
          headers: { Location: loginPath },
        });
      }
    } catch {
      event.cookies.delete('svadmin-session', { path: '/' });
      return new Response(null, {
        status: 302,
        headers: { Location: loginPath },
      });
    }
    return resolve(event);
  };
}

/**
 * Creates login/logout form actions using AuthProvider.
 */
export function createAuthActions(authProvider: AuthProvider) {
  return {
    login: async ({ request, cookies }: RequestEvent) => {
      const formData = await request.formData();
      const params = Object.fromEntries(formData);
      try {
        const result = await authProvider.login(params);
        if (result.success) {
          // Store a session indicator in a cookie
          cookies.set('svadmin-session', 'active', {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
          });
          throw redirect(303, result.redirectTo ?? '/lite');
        }
        return { success: false, error: result.error?.message ?? 'Login failed' };
      } catch (e) {
        if (isRedirect(e)) throw e;
        return { success: false, error: (e as Error).message };
      }
    },

    logout: async ({ cookies }: RequestEvent) => {
      try { await authProvider.logout(); } catch { /* ignore */ }
      cookies.delete('svadmin-session', { path: '/' });
      return { success: true };
    },
  };
}

// ─── UA Detection ─────────────────────────────────────────────

/**
 * Detects IE11 user agents for applications that maintain a dedicated fallback.
 * This helper does not imply that Svelte 5 or the consuming app supports IE11.
 */
export function isLegacyBrowser(userAgent: string): boolean {
  return /MSIE|Trident|rv:11/.test(userAgent);
}

/**
 * Creates an opt-in SvelteKit hook that redirects detected IE11 user agents.
 * Consumers remain responsible for their own transpilation and browser support.
 */
export function createLegacyRedirectHook(litePrefix = '/lite') {
  return async ({ event, resolve }: { event: RequestEvent; resolve: (event: RequestEvent) => Promise<Response> }) => {
    const ua = event.request.headers.get('user-agent') ?? '';
    if (isLegacyBrowser(ua) && !event.url.pathname.startsWith(litePrefix)) {
      return new Response(null, {
        status: 302,
        headers: { Location: `${litePrefix}${event.url.pathname}` },
      });
    }
    return resolve(event);
  };
}

// ─── Utilities ────────────────────────────────────────────────

interface ValidationIssue {
  path: readonly PropertyKey[];
  message: string;
}

function formatValidationErrors(issues: readonly ValidationIssue[]): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  for (const issue of issues) {
    const root = issue.path[0];
    const field = typeof root === 'string' || typeof root === 'number' ? String(root) : '_form';
    const messages = errors[field] ?? [];
    if (!messages.includes(issue.message)) messages.push(issue.message);
    errors[field] = messages;
  }

  return errors;
}

function validateFormVariables(
  resource: ResourceDefinition,
  mode: 'create' | 'edit',
  values: Record<string, unknown>,
):
  | { success: true; data: Record<string, unknown> }
  | {
      success: false;
      failure: {
        success: false;
        error: string;
        values: Record<string, unknown>;
        errors: Record<string, string[]>;
      };
    } {
  const result = resourceToZodSchema(resource, mode).safeParse(values);
  if (result.success) return { success: true, data: result.data };

  return {
    success: false,
    failure: {
      success: false,
      error: 'Validation failed',
      values,
      errors: formatValidationErrors(result.error.issues),
    },
  };
}

function isNativeFile(value: unknown): value is File {
  return typeof File !== 'undefined' && value instanceof File;
}

function isNonEmptyNativeFile(value: unknown): value is File {
  return isNativeFile(value) && value.size > 0 && value.name !== '';
}

function formDataToObject(
  formData: FormData,
  fields: FieldDefinition[],
): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.showInForm === false) continue;

    if (field.type === 'array') {
      obj[field.key] = parseArrayField(formData, field);
      continue;
    }

    if (field.type === 'multiselect') {
      const values = formData.getAll(field.key);
      if (values.length > 0) {
        obj[field.key] = values.map(v => String(v));
      }
      continue;
    }

    if (field.type === 'images') {
      const values = formData
        .getAll(field.key)
        .filter((value) => !isNativeFile(value) || isNonEmptyNativeFile(value));
      if (values.length > 0) obj[field.key] = values;
      continue;
    }

    const raw = formData.get(field.key);
    if (raw === null) {
      if (field.type === 'boolean') obj[field.key] = false;
      continue;
    }

    // Don't coerce File objects, but ignore empty native file inputs
    if (isNativeFile(raw)) {
      if (isNonEmptyNativeFile(raw)) {
         obj[field.key] = raw;
      }
      continue;
    }

    const strRaw = String(raw);

    switch (field.type) {
      case 'number':
        if (strRaw.trim() !== '') {
          const numberValue = Number(strRaw);
          obj[field.key] = Number.isNaN(numberValue) ? strRaw : numberValue;
        }
        break;
      case 'boolean':
        obj[field.key] = strRaw === 'on' || strRaw === 'true' || strRaw === '1';
        break;
      case 'tags':
        obj[field.key] = strRaw ? strRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
        break;
      case 'json':
        try {
          obj[field.key] = strRaw ? JSON.parse(strRaw) : null;
        } catch {
          obj[field.key] = strRaw; // Let Zod handle validation errors
        }
        break;
      default:
        obj[field.key] = strRaw;
    }
  }
  return obj;
}

function parseArrayField(
  formData: FormData,
  field: FieldDefinition,
): Record<string, unknown>[] {
  const escapedKey = field.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const entryPattern = new RegExp(`^${escapedKey}\\[(\\d+)\\]\\[([^\\]]+)\\]$`);
  const rows = new Map<number, Map<string, FormDataEntryValue[]>>();

  for (const [name, value] of formData.entries()) {
    const match = entryPattern.exec(name);
    if (!match) continue;
    const index = Number(match[1]);
    const key = match[2];
    if (!Number.isSafeInteger(index) || index < 0 || !key) continue;
    const row = rows.get(index) ?? new Map<string, FormDataEntryValue[]>();
    const values = row.get(key) ?? [];
    values.push(value);
    row.set(key, values);
    rows.set(index, row);
  }

  const result: Record<string, unknown>[] = [];
  for (const [, entries] of [...rows.entries()].sort(([a], [b]) => a - b)) {
    if (isChecked(entries.get('_delete'))) continue;

    const item: Record<string, unknown> = {};
    let hasMeaningfulValue = false;
    for (const subField of field.subFields ?? []) {
      const rawValues = entries.get(subField.key) ?? [];
      if (subField.type === 'boolean') {
        const value = isChecked(rawValues);
        item[subField.key] = value;
        hasMeaningfulValue ||= value;
        continue;
      }
      if (rawValues.length === 0) continue;
      const value = coerceFieldValues(subField, rawValues);
      if (value === undefined) continue;
      item[subField.key] = value;
      hasMeaningfulValue ||= isMeaningfulValue(value);
    }

    if (hasMeaningfulValue) result.push(item);
  }
  return result;
}

function isChecked(values: FormDataEntryValue[] | undefined): boolean {
  return (values ?? []).some((value) => {
    if (typeof value !== 'string') return false;
    return value === 'on' || value === 'true' || value === '1';
  });
}

function isMeaningfulValue(value: unknown): boolean {
  if (value == null || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  if (isNativeFile(value)) return isNonEmptyNativeFile(value);
  return true;
}

function coerceFieldValues(
  field: FieldDefinition,
  rawValues: FormDataEntryValue[],
): unknown {
  if (field.type === 'multiselect') {
    return rawValues.filter((value): value is string => typeof value === 'string');
  }
  if (field.type === 'images') {
    const uploadedFiles = rawValues.filter(isNonEmptyNativeFile);
    if (uploadedFiles.length > 0) return uploadedFiles;

    const retainedReferences = rawValues.filter(
      (value): value is string => typeof value === 'string' && value.trim().length > 0,
    );
    return retainedReferences.length > 0 ? retainedReferences : undefined;
  }
  if (field.type === 'file' || field.type === 'image') {
    for (let index = rawValues.length - 1; index >= 0; index -= 1) {
      const value = rawValues[index];
      if (isNonEmptyNativeFile(value)) return value;
    }

    for (let index = rawValues.length - 1; index >= 0; index -= 1) {
      const value = rawValues[index];
      if (typeof value === 'string' && value.trim().length > 0) return value;
    }
    return undefined;
  }

  const raw = rawValues.at(-1);
  if (raw === undefined) return undefined;
  if (isNativeFile(raw)) {
    return isNonEmptyNativeFile(raw) ? raw : undefined;
  }

  switch (field.type) {
    case 'number':
      if (raw.trim() === '') return undefined;
      return Number.isNaN(Number(raw)) ? raw : Number(raw);
    case 'boolean':
      return raw === 'on' || raw === 'true' || raw === '1';
    case 'tags':
      return raw ? raw.split(',').map((value) => value.trim()).filter(Boolean) : [];
    case 'json':
      try {
        return raw ? JSON.parse(raw) : null;
      } catch {
        return raw;
      }
    default:
      return raw;
  }
}
