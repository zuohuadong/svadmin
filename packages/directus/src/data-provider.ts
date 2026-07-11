import type {
  BaseRecord,
  CreateParams,
  CreateResult,
  CrudOperator,
  CustomParams,
  CustomResult,
  DataProvider,
  DeleteParams,
  DeleteResult,
  FieldFilter,
  Filter,
  GetListParams,
  GetListResult,
  GetManyParams,
  GetManyResult,
  GetOneParams,
  GetOneResult,
  Sort,
  UpdateParams,
  UpdateResult,
} from '@svadmin/core';

const DIRECTUS_OPERATOR_MAP: Record<CrudOperator, string> = {
  eq: '_eq',
  ne: '_neq',
  lt: '_lt',
  gt: '_gt',
  lte: '_lte',
  gte: '_gte',
  contains: '_contains',
  ncontains: '_ncontains',
  startswith: '_starts_with',
  endswith: '_ends_with',
  in: '_in',
  nin: '_nin',
  null: '_null',
  nnull: '_nnull',
  between: '_between',
  nbetween: '_nbetween',
};

const SENSITIVE_HEADER_NAMES = new Set([
  'authorization',
  'cookie',
  'cookie2',
  'proxy-authorization',
  'x-api-key',
  'api-key',
  'x-auth-token',
  'x-access-token',
  'x-csrf-token',
  'x-xsrf-token',
]);

type RequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

interface DirectusListResponse<TData> {
  data?: TData[];
  meta?: {
    total_count?: number;
  };
}

interface DirectusItemResponse<TData> {
  data?: TData;
}

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

function withoutSensitiveHeaders(headers: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers).filter(([name]) => !SENSITIVE_HEADER_NAMES.has(name.toLowerCase())),
  );
}

function directusValue(filter: FieldFilter): unknown {
  if (filter.operator === 'null' || filter.operator === 'nnull') return true;
  return filter.value;
}

function buildDirectusRule(filter: Filter): Record<string, unknown> {
  if ('field' in filter) {
    if (!Object.prototype.hasOwnProperty.call(DIRECTUS_OPERATOR_MAP, filter.operator)) {
      throw new Error(`Unsupported Directus filter operator: ${String(filter.operator)}`);
    }
    const operator = DIRECTUS_OPERATOR_MAP[filter.operator];
    return { [filter.field]: { [operator]: directusValue(filter) } };
  }

  if (filter.operator !== 'and' && filter.operator !== 'or') {
    throw new Error(`Unsupported Directus logical operator: ${String(filter.operator)}`);
  }

  const operator = filter.operator === 'and' ? '_and' : '_or';
  return { [operator]: filter.value.map(buildDirectusRule) };
}

function buildDirectusFilter(filters?: Filter[]): Record<string, unknown> {
  if (!filters?.length) return {};
  const rules = filters.map(buildDirectusRule);
  return rules.length === 1 ? rules[0] : { _and: rules };
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
  params.set(
    'sort',
    sorters.map(sorter => `${sorter.order === 'desc' ? '-' : ''}${sorter.field}`).join(','),
  );
}

function appendFilters(params: URLSearchParams, filters?: Filter[]): void {
  const filter = buildDirectusFilter(filters);
  if (Object.keys(filter).length) params.set('filter', JSON.stringify(filter));
}

function fieldsFromMeta(meta?: Record<string, unknown>): string[] | undefined {
  const fields = meta?.fields;
  if (!Array.isArray(fields) || !fields.every(field => typeof field === 'string')) return undefined;
  return fields;
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

async function parseResponse<TData>(response: Response): Promise<TData> {
  if (response.status === 204 || response.status === 205) {
    return undefined as unknown as TData;
  }

  const contentLength = response.headers?.get('content-length');
  if (contentLength?.trim() === '0') {
    return undefined as unknown as TData;
  }

  const body = await response.text();
  if (!body || body.trim() === '') {
    return undefined as unknown as TData;
  }

  return JSON.parse(body) as TData;
}

async function fetchData<TData>(
  url: string,
  headers: Record<string, string>,
  init: RequestOptions | undefined,
  errorMessage: (status: number) => string,
): Promise<TData> {
  const response = await fetch(url, {
    ...init,
    headers: mergeHeaders(headers, init?.headers),
  });
  if (!response.ok) throw new Error(errorMessage(response.status));
  return parseResponse<TData>(response);
}

export function createDirectusDataProvider(apiUrl: string, token?: string): DataProvider {
  const providerHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) providerHeaders.Authorization = `Bearer ${token}`;
  const baseUrl = apiUrl.replace(/\/+$/, '');

  function request<TData>(path: string, init?: RequestOptions): Promise<TData> {
    return fetchData<TData>(
      `${baseUrl}${path}`,
      providerHeaders,
      init,
      status => `Directus error: ${status}`,
    );
  }

  return {
    getApiUrl: () => apiUrl,

    async getList<TData extends BaseRecord = BaseRecord>({ resource, pagination, sorters, filters, meta }: GetListParams): Promise<GetListResult<TData>> {
      const { current = 1, pageSize = 10 } = pagination ?? {};
      const params = new URLSearchParams();
      params.set('limit', String(pageSize));
      params.set('offset', String((current - 1) * pageSize));
      params.set('meta', 'total_count');
      const fields = fieldsFromMeta(meta);
      if (fields) params.set('fields', fields.join(','));
      appendSorters(params, sorters);
      appendFilters(params, filters);

      const response = await request<DirectusListResponse<TData>>(`/items/${resource}?${params}`);
      return {
        data: response?.data ?? [],
        total: response?.meta?.total_count ?? 0,
      };
    },

    async getOne<TData extends BaseRecord = BaseRecord>({ resource, id, meta }: GetOneParams): Promise<GetOneResult<TData>> {
      const params = new URLSearchParams();
      const fields = fieldsFromMeta(meta);
      if (fields) params.set('fields', fields.join(','));
      const query = params.size ? `?${params}` : '';
      const response = await request<DirectusItemResponse<TData>>(
        `/items/${resource}/${encodeURIComponent(String(id))}${query}`,
      );
      return { data: response?.data as TData };
    },

    async create<TData extends BaseRecord = BaseRecord, TVariables = unknown>({ resource, variables }: CreateParams<TVariables>): Promise<CreateResult<TData>> {
      const response = await request<DirectusItemResponse<TData>>(`/items/${resource}`, {
        method: 'POST',
        body: JSON.stringify(variables),
      });
      return { data: response?.data as TData };
    },

    async update<TData extends BaseRecord = BaseRecord, TVariables = unknown>({ resource, id, variables }: UpdateParams<TVariables>): Promise<UpdateResult<TData>> {
      const response = await request<DirectusItemResponse<TData>>(
        `/items/${resource}/${encodeURIComponent(String(id))}`,
        { method: 'PATCH', body: JSON.stringify(variables) },
      );
      return { data: response?.data as TData };
    },

    async deleteOne<TData extends BaseRecord = BaseRecord, TVariables = unknown>({ resource, id }: DeleteParams<TVariables>): Promise<DeleteResult<TData>> {
      await request(`/items/${resource}/${encodeURIComponent(String(id))}`, { method: 'DELETE' });
      return { data: { id } as unknown as TData };
    },

    async getMany<TData extends BaseRecord = BaseRecord>({ resource, ids, meta }: GetManyParams): Promise<GetManyResult<TData>> {
      const params = new URLSearchParams();
      params.set('filter', JSON.stringify({ id: { _in: ids } }));
      const fields = fieldsFromMeta(meta);
      if (fields) params.set('fields', fields.join(','));
      const response = await request<DirectusListResponse<TData>>(`/items/${resource}?${params}`);
      return { data: response?.data ?? [] };
    },

    async custom<TData = unknown, TVariables = unknown>({
      url,
      method,
      payload,
      query,
      headers,
      sorters,
      filters,
    }: CustomParams<TVariables>): Promise<CustomResult<TData>> {
      const parsed = new URL(url, apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`);
      appendQuery(parsed.searchParams, query);
      appendSorters(parsed.searchParams, sorters);
      appendFilters(parsed.searchParams, filters);
      const requestUrl = parsed.toString();
      const sameOrigin = isSameOrigin(apiUrl, requestUrl);
      const requestHeaders = mergeHeaders(
        sameOrigin ? providerHeaders : withoutSensitiveHeaders(providerHeaders),
        headers,
      );
      const data = await fetchData<TData>(
        requestUrl,
        requestHeaders,
        {
          method: method.toUpperCase(),
          body: payload === undefined ? undefined : JSON.stringify(payload),
        },
        status => `Custom request failed: ${status}`,
      );
      return { data };
    },
  };
}
