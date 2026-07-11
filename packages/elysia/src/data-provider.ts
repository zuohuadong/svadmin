// Elysia DataProvider — CRUD convention compatible
// Expects backend routes following: GET /resource, GET /resource/:id, POST /resource, PATCH /resource/:id, DELETE /resource/:id
// Response format for lists: { items: T[], total: number } (also supports raw arrays)

import type {
  DataProvider, GetListParams, GetListResult, GetOneParams, GetOneResult,
  CreateParams, CreateResult, UpdateParams, UpdateResult, DeleteParams, DeleteResult,
  GetManyParams, GetManyResult, CreateManyParams, CreateManyResult,
  UpdateManyParams, UpdateManyResult, DeleteManyParams, DeleteManyResult,
  CustomParams, CustomResult, BaseRecord, FieldFilter, Filter, Sort,
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
   * Use the `resource` parameter to apply different parsers per resource.
   * Useful when the backend response format differs from `{ items, total }`.
   *
   * @default Handles `{ items, total }` and raw arrays automatically
   */
  parseListResponse?: <T>(json: unknown, resource: string) => { data: T[]; total: number };
}

const DEFAULT_JSON_HEADERS: Record<string, string> = { 'Content-Type': 'application/json' };

type RequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

function mergeHeaders(...sources: Array<Record<string, string> | undefined>): Record<string, string> {
  const merged = new Map<string, readonly [name: string, value: string]>();

  for (const source of sources) {
    if (!source) continue;
    for (const [name, value] of Object.entries(source)) {
      merged.set(name.toLowerCase(), [name, value]);
    }
  }

  return Object.fromEntries(merged.values());
}

function resolveHeaders(opts: ElysiaDataProviderOptions): Record<string, string> {
  const extra = typeof opts.headers === 'function' ? opts.headers() : (opts.headers ?? {});
  return mergeHeaders(DEFAULT_JSON_HEADERS, extra);
}

function resolveResourceUrl(opts: ElysiaDataProviderOptions, resource: string): string {
  const segment = opts.resourceUrlMap?.[resource] ?? resource;
  return `${opts.apiUrl}/${segment}`;
}

function encodeIdPathSegment(id: string | number): string {
  return encodeURIComponent(String(id));
}

function isSameOrigin(apiUrl: string, targetUrl: string): boolean {
  try {
    const api = new URL(apiUrl);
    const target = new URL(targetUrl, apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`);
    return api.origin === target.origin;
  } catch {
    return false;
  }
}

function serializeQueryValue(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }

  const serialized = JSON.stringify(value);
  return serialized === undefined ? String(value) : serialized;
}

function appendQuery(params: URLSearchParams, query?: Record<string, unknown>): void {
  if (!query) return;

  for (const [name, value] of Object.entries(query)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) params.append(name, serializeQueryValue(item));
      continue;
    }
    params.set(name, serializeQueryValue(value));
  }
}

function appendSorters(params: URLSearchParams, sorters?: Sort[]): void {
  if (!sorters?.length) return;
  params.set('_sort', sorters.map(sorter => sorter.field).join(','));
  params.set('_order', sorters.map(sorter => sorter.order).join(','));
}

function filterParamName(filter: FieldFilter): string {
  if (filter.operator === 'eq') return filter.field;
  if (filter.operator === 'contains') return `${filter.field}_like`;
  return `${filter.field}_${filter.operator}`;
}

function filterParamValue(filter: FieldFilter): string {
  if (filter.operator === 'null' || filter.operator === 'nnull') return 'true';
  if (Array.isArray(filter.value)) {
    return filter.value.map(serializeQueryValue).join(',');
  }
  return serializeQueryValue(filter.value);
}

function appendFilters(params: URLSearchParams, filters?: Filter[]): void {
  if (!filters?.length) return;

  let hasLogicalFilter = false;
  for (const filter of filters) {
    if ('field' in filter) {
      params.append(filterParamName(filter), filterParamValue(filter));
    } else {
      hasLogicalFilter = true;
    }
  }

  // Flat filters keep the established field_operator convention. A canonical
  // JSON copy is added only when a logical group is present, because OR/AND
  // cannot be represented without losing nesting in flat query parameters.
  if (hasLogicalFilter) params.set('_filters', JSON.stringify(filters));
}

function buildCustomUrl(
  url: string,
  apiUrl: string,
  query?: Record<string, unknown>,
  sorters?: Sort[],
  filters?: Filter[],
): string {
  const parsed = new URL(url, apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`);
  appendQuery(parsed.searchParams, query);
  appendSorters(parsed.searchParams, sorters);
  appendFilters(parsed.searchParams, filters);
  return parsed.toString();
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204 || response.status === 205) {
    return undefined as unknown as T;
  }

  const contentLength = response.headers?.get('content-length');
  if (contentLength?.trim() === '0') {
    return undefined as unknown as T;
  }

  const body = await response.text();
  if (!body || body.trim() === '') {
    return undefined as unknown as T;
  }

  return JSON.parse(body) as T;
}

async function request<T>(url: string, headers: Record<string, string>, init?: RequestOptions, withCredentials?: boolean): Promise<T> {
  const fetchInit: RequestInit = { ...init, headers: mergeHeaders(headers, init?.headers) };
  if (withCredentials) {
    fetchInit.credentials = 'include';
  }
  const response = await fetch(url, fetchInit);
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}: ${response.statusText}${body ? ` — ${body}` : ''}`);
  }
  return parseResponse<T>(response);
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
    return { data: json as unknown as T[], total: json.length };
  }
  const obj = json as Record<string, unknown>;
  if (Array.isArray(obj.items)) {
    return { data: obj.items as unknown as T[], total: obj.total !== undefined ? Number(obj.total) : obj.items.length };
  }
  if (Array.isArray(obj.data)) {
    return { data: obj.data as unknown as T[], total: obj.total !== undefined ? Number(obj.total) : obj.data.length };
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

      appendSorters(params, sorters);
      appendFilters(params, filters);

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
      const data = await request<TData>(`${baseUrl}/${encodeIdPathSegment(id)}`, resolveHeaders(opts), undefined, withCredentials);
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
      const data = await request<TData>(`${baseUrl}/${encodeIdPathSegment(id)}`, resolveHeaders(opts), {
        method: updateMethod,
        body: JSON.stringify(variables),
      }, withCredentials);
      return { data };
    },

    async deleteOne<TData extends BaseRecord = BaseRecord, TVariables = unknown>({ resource, id }: DeleteParams<TVariables>): Promise<DeleteResult<TData>> {
      const baseUrl = resolveResourceUrl(opts, resource);
      const data = await request<TData | undefined>(`${baseUrl}/${encodeIdPathSegment(id)}`, resolveHeaders(opts), {
        method: 'DELETE',
      }, withCredentials);
      return { data: data === undefined ? { id } as unknown as TData : data };
    },

    async getMany<TData extends BaseRecord = BaseRecord>({ resource, ids }: GetManyParams): Promise<GetManyResult<TData>> {
      const baseUrl = resolveResourceUrl(opts, resource);
      const params = ids.map(id => `id=${encodeURIComponent(String(id))}`).join('&');
      const data = await request<TData[]>(`${baseUrl}?${params}`, resolveHeaders(opts), undefined, withCredentials);
      return { data };
    },

    async createMany<TData extends BaseRecord = BaseRecord, TVariables = unknown>({ resource, variables }: CreateManyParams<TVariables>): Promise<CreateManyResult<TData>> {
      const baseUrl = resolveResourceUrl(opts, resource);
      const results = await Promise.all(
        variables.map(vars =>
          request<TData>(baseUrl, resolveHeaders(opts), {
            method: 'POST',
            body: JSON.stringify(vars),
          }, withCredentials)
        )
      );
      return { data: results };
    },

    async updateMany<TData extends BaseRecord = BaseRecord, TVariables = unknown>({ resource, ids, variables }: UpdateManyParams<TVariables>): Promise<UpdateManyResult<TData>> {
      const baseUrl = resolveResourceUrl(opts, resource);
      const results = await Promise.all(
        ids.map(id =>
          request<TData>(`${baseUrl}/${encodeIdPathSegment(id)}`, resolveHeaders(opts), {
            method: updateMethod,
            body: JSON.stringify(variables),
          }, withCredentials)
        )
      );
      return { data: results };
    },

    async deleteMany<TData extends BaseRecord = BaseRecord, TVariables = unknown>({ resource, ids }: DeleteManyParams<TVariables>): Promise<DeleteManyResult<TData>> {
      const baseUrl = resolveResourceUrl(opts, resource);
      const results = await Promise.all(
        ids.map(id =>
          request<TData | undefined>(`${baseUrl}/${encodeIdPathSegment(id)}`, resolveHeaders(opts), {
            method: 'DELETE',
          }, withCredentials).then(data => data === undefined ? { id } as unknown as TData : data)
        )
      );
      return { data: results };
    },

    async custom<TData = unknown, TVariables = unknown>({ url, method, payload, query, headers, sorters, filters }: CustomParams<TVariables>): Promise<CustomResult<TData>> {
      const requestUrl = buildCustomUrl(url, apiUrl, query, sorters, filters);
      const sameOrigin = isSameOrigin(apiUrl, requestUrl);
      const providerHeaders = resolveHeaders(opts);
      const requestHeaders = mergeHeaders(
        // Provider-level headers often contain credentials under application-specific
        // names. Never inherit them across origins; callers must opt in explicitly via
        // custom.headers for the target service.
        sameOrigin ? providerHeaders : DEFAULT_JSON_HEADERS,
        headers,
      );
      const data = await request<TData>(requestUrl, requestHeaders, {
        method: method.toUpperCase(),
        body: payload === undefined ? undefined : JSON.stringify(payload),
      }, withCredentials && sameOrigin);
      return { data };
    },
  };
}
