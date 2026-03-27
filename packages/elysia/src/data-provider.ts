// Elysia DataProvider — CRUD convention compatible
// Expects backend routes following: GET /resource, GET /resource/:id, POST /resource, PATCH /resource/:id, DELETE /resource/:id
// Response format for lists: { items: T[], total: number } (also supports raw arrays)

import type {
  DataProvider, GetListParams, GetListResult, GetOneParams, GetOneResult,
  CreateParams, CreateResult, UpdateParams, UpdateResult, DeleteParams, DeleteResult,
  GetManyParams, GetManyResult, CreateManyParams, CreateManyResult,
  UpdateManyParams, UpdateManyResult, DeleteManyParams, DeleteManyResult,
  CustomParams, CustomResult, BaseRecord,
} from '@svadmin/core';

export interface ElysiaDataProviderOptions {
  /** Base API URL, e.g. 'http://localhost:3000' */
  apiUrl: string;
  /** Static headers or a function returning headers (useful for auth tokens) */
  headers?: Record<string, string> | (() => Record<string, string>);
  /**
   * HTTP method to use for update operations.
   * @default 'PATCH'
   */
  updateMethod?: 'PATCH' | 'PUT';
  /**
   * Whether to include credentials (cookies) in requests.
   * Set to `true` for cookie-based authentication.
   * @default false
   */
  withCredentials?: boolean;
  /**
   * Custom resource-to-URL segment mapping.
   * Maps a resource name to a URL segment, e.g. `{ user_groups: 'user-groups' }`.
   * When not provided, the resource name is used as-is.
   */
  resourceUrlMap?: Record<string, string>;
  /**
   * Custom response parser for list endpoints.
   * When provided, this function extracts `{ data, total }` from the raw JSON response.
   * Useful when the backend response format differs from `{ items, total }`.
   *
   * @default Handles `{ items, total }` and raw arrays automatically
   */
  parseListResponse?: <T>(json: unknown, resource: string) => { data: T[]; total: number };
}

function resolveHeaders(opts: ElysiaDataProviderOptions): Record<string, string> {
  const base: Record<string, string> = { 'Content-Type': 'application/json' };
  const extra = typeof opts.headers === 'function' ? opts.headers() : (opts.headers ?? {});
  return { ...base, ...extra };
}

function resolveResourceUrl(opts: ElysiaDataProviderOptions, resource: string): string {
  const segment = opts.resourceUrlMap?.[resource] ?? resource;
  return `${opts.apiUrl}/${segment}`;
}

async function request<T>(url: string, headers: Record<string, string>, init?: RequestInit, withCredentials?: boolean): Promise<T> {
  const fetchInit: RequestInit = { ...init, headers: { ...headers, ...init?.headers } };
  if (withCredentials) {
    fetchInit.credentials = 'include';
  }
  const response = await fetch(url, fetchInit);
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}: ${response.statusText}${body ? ` — ${body}` : ''}`);
  }
  return response.json();
}

/**
 * Default list response parser.
 * Supports:
 * - `{ items: T[], total: number }` (standard)
 * - `{ data: T[], total: number }` (common alternative)
 * - `T[]` (raw array — total is inferred from array length)
 */
function defaultParseListResponse<T>(json: unknown): { data: T[]; total: number } {
  if (Array.isArray(json)) {
    return { data: json as T[], total: json.length };
  }
  const obj = json as Record<string, unknown>;
  if (Array.isArray(obj.items)) {
    return { data: obj.items as T[], total: (obj.total as number) ?? obj.items.length };
  }
  if (Array.isArray(obj.data)) {
    return { data: obj.data as T[], total: (obj.total as number) ?? obj.data.length };
  }
  throw new Error('Unrecognized list response format. Expected { items, total }, { data, total }, or an array.');
}

/**
 * Creates a DataProvider for Elysia backends using the CRUD plugin convention.
 *
 * List responses support multiple formats:
 * - `{ items: T[], total: number }` (standard CRUD convention)
 * - `{ data: T[], total: number }` (common alternative)
 * - `T[]` (raw array — total is inferred from length)
 *
 * @example
 * ```ts
 * const dataProvider = createElysiaDataProvider({
 *   apiUrl: 'http://localhost:3000/api',
 *   withCredentials: true,  // cookie auth
 *   updateMethod: 'PUT',    // use PUT instead of PATCH
 *   resourceUrlMap: {
 *     user_groups: 'user-groups',
 *   },
 * });
 * ```
 */
export function createElysiaDataProvider(opts: ElysiaDataProviderOptions): DataProvider {
  const { apiUrl, updateMethod = 'PATCH', withCredentials = false } = opts;

  return {
    getApiUrl: () => apiUrl,

    async getList<TData extends BaseRecord = BaseRecord>({ resource, pagination, sorters, filters }: GetListParams): Promise<GetListResult<TData>> {
      const params = new URLSearchParams();
      const { current = 1, pageSize = 10 } = pagination ?? {};
      params.set('_page', String(current));
      params.set('_limit', String(pageSize));

      if (sorters?.length) {
        params.set('_sort', sorters.map(s => s.field).join(','));
        params.set('_order', sorters.map(s => s.order).join(','));
      }

      if (filters?.length) {
        for (const f of filters) {
          if (f.operator === 'eq') params.set(f.field, String(f.value));
          else if (f.operator === 'contains') params.set(`${f.field}_like`, String(f.value));
          else params.set(`${f.field}_${f.operator}`, String(f.value));
        }
      }

      const baseUrl = resolveResourceUrl(opts, resource);
      const url = `${baseUrl}?${params.toString()}`;
      const headers = resolveHeaders(opts);
      const json = await request<unknown>(url, headers, undefined, withCredentials);

      if (opts.parseListResponse) {
        return opts.parseListResponse<TData>(json, resource);
      }
      return defaultParseListResponse<TData>(json);
    },

    async getOne<TData extends BaseRecord = BaseRecord>({ resource, id }: GetOneParams): Promise<GetOneResult<TData>> {
      const baseUrl = resolveResourceUrl(opts, resource);
      const data = await request<TData>(`${baseUrl}/${id}`, resolveHeaders(opts), undefined, withCredentials);
      return { data };
    },

    async create<TData extends BaseRecord = BaseRecord, TVariables = unknown>({ resource, variables }: CreateParams<TVariables>): Promise<CreateResult<TData>> {
      const baseUrl = resolveResourceUrl(opts, resource);
      const data = await request<TData>(baseUrl, resolveHeaders(opts), {
        method: 'POST',
        body: JSON.stringify(variables),
      }, withCredentials);
      return { data };
    },

    async update<TData extends BaseRecord = BaseRecord, TVariables = unknown>({ resource, id, variables }: UpdateParams<TVariables>): Promise<UpdateResult<TData>> {
      const baseUrl = resolveResourceUrl(opts, resource);
      const data = await request<TData>(`${baseUrl}/${id}`, resolveHeaders(opts), {
        method: updateMethod,
        body: JSON.stringify(variables),
      }, withCredentials);
      return { data };
    },

    async deleteOne<TData extends BaseRecord = BaseRecord, TVariables = unknown>({ resource, id }: DeleteParams<TVariables>): Promise<DeleteResult<TData>> {
      const baseUrl = resolveResourceUrl(opts, resource);
      const data = await request<TData>(`${baseUrl}/${id}`, resolveHeaders(opts), {
        method: 'DELETE',
      }, withCredentials);
      return { data };
    },

    async getMany<TData extends BaseRecord = BaseRecord>({ resource, ids }: GetManyParams): Promise<GetManyResult<TData>> {
      const baseUrl = resolveResourceUrl(opts, resource);
      const params = ids.map(id => `id=${id}`).join('&');
      const data = await request<TData[]>(`${baseUrl}?${params}`, resolveHeaders(opts), undefined, withCredentials);
      return { data };
    },

    async createMany<TData extends BaseRecord = BaseRecord, TVariables = unknown>({ resource, variables }: CreateManyParams<TVariables>): Promise<CreateManyResult<TData>> {
      const baseUrl = resolveResourceUrl(opts, resource);
      const results: TData[] = [];
      for (const vars of variables) {
        const data = await request<TData>(baseUrl, resolveHeaders(opts), {
          method: 'POST',
          body: JSON.stringify(vars),
        }, withCredentials);
        results.push(data);
      }
      return { data: results };
    },

    async updateMany<TData extends BaseRecord = BaseRecord, TVariables = unknown>({ resource, ids, variables }: UpdateManyParams<TVariables>): Promise<UpdateManyResult<TData>> {
      const baseUrl = resolveResourceUrl(opts, resource);
      const results: TData[] = [];
      for (const id of ids) {
        const data = await request<TData>(`${baseUrl}/${id}`, resolveHeaders(opts), {
          method: updateMethod,
          body: JSON.stringify(variables),
        }, withCredentials);
        results.push(data);
      }
      return { data: results };
    },

    async deleteMany<TData extends BaseRecord = BaseRecord, TVariables = unknown>({ resource, ids }: DeleteManyParams<TVariables>): Promise<DeleteManyResult<TData>> {
      const baseUrl = resolveResourceUrl(opts, resource);
      const results: TData[] = [];
      for (const id of ids) {
        const data = await request<TData>(`${baseUrl}/${id}`, resolveHeaders(opts), {
          method: 'DELETE',
        }, withCredentials);
        results.push(data);
      }
      return { data: results };
    },

    async custom<TData = unknown, TVariables = unknown>({ url, method, payload, headers }: CustomParams<TVariables>): Promise<CustomResult<TData>> {
      const data = await request<TData>(url, { ...resolveHeaders(opts), ...headers }, {
        method: method.toUpperCase(),
        body: payload ? JSON.stringify(payload) : undefined,
      }, withCredentials);
      return { data };
    },
  };
}
