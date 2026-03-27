/**
 * @svadmin/lite — Server Adapter
 *
 * Bridges @svadmin/core DataProvider into SvelteKit server loaders and form actions.
 * All data fetching happens on the server — zero client-side JS required.
 */
import type {
  DataProvider, AuthProvider,
  ResourceDefinition, FieldDefinition,
  Sort, Filter,
} from '@svadmin/core';
import type { RequestEvent } from '@sveltejs/kit';

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
      const variables = formDataToObject(formData, resource.fields);
      try {
        const result = await dp.create({ resource: resource.name, variables });
        return { success: true, id: (result.data as Record<string, unknown>)[pk] };
      } catch (e) {
        return { success: false, error: (e as Error).message, values: variables };
      }
    },

    update: async ({ request }: RequestEvent) => {
      const formData = await request.formData();
      const id = formData.get('_id') as string;
      formData.delete('_id');
      const variables = formDataToObject(formData, resource.fields);
      try {
        await dp.update({ resource: resource.name, id, variables });
        return { success: true };
      } catch (e) {
        return { success: false, error: (e as Error).message, values: variables };
      }
    },

    delete: async ({ request }: RequestEvent) => {
      const formData = await request.formData();
      const id = formData.get('id') as string;
      try {
        await dp.deleteOne({ resource: resource.name, id });
        return { success: true };
      } catch (e) {
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

    try {
      const check = await authProvider.check();
      if (!check.authenticated) {
        return new Response(null, {
          status: 302,
          headers: { Location: loginPath },
        });
      }
    } catch {
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
          return { success: true, redirectTo: result.redirectTo ?? '/lite' };
        }
        return { success: false, error: result.error?.message ?? 'Login failed' };
      } catch (e) {
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
 * Detects legacy browsers (IE11) from the User-Agent header.
 */
export function isLegacyBrowser(userAgent: string): boolean {
  return /MSIE|Trident|rv:11/.test(userAgent);
}

/**
 * Creates a SvelteKit handle hook that auto-redirects legacy browsers to /lite/.
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

function formDataToObject(
  formData: FormData,
  fields: FieldDefinition[],
): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.showInForm === false) continue;
    
    // Handle array types (like multiselect)
    if (field.type === 'multiselect') {
      const values = formData.getAll(field.key);
      if (values.length > 0) {
        obj[field.key] = values.map(v => String(v));
      }
      continue;
    }

    const raw = formData.get(field.key);
    if (raw === null) {
      if (field.type === 'boolean') obj[field.key] = false;
      continue;
    }

    // Don't coerce File objects, but ignore empty native file inputs
    if (raw instanceof File) {
      if (raw.size > 0 && raw.name !== '') {
         obj[field.key] = raw;
      }
      continue;
    }

    const strRaw = String(raw);

    switch (field.type) {
      case 'number':
        obj[field.key] = strRaw === '' ? null : Number(strRaw);
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
