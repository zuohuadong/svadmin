import type {
  DataProvider, GetListParams, GetListResult, GetOneParams, GetOneResult,
  CreateParams, CreateResult, UpdateParams, UpdateResult, DeleteParams, DeleteResult,
  GetManyParams, GetManyResult, CustomParams, CustomResult, CrudOperator, FieldFilter,
  Filter, Sort, BaseRecord
} from '@svadmin/core';

interface SanityDoc {
  _id: string;
  _type: string;
  [key: string]: unknown;
}

interface SanityMutationResult {
  results?: Array<{ id: string }>;
}

const DEFAULT_JSON_HEADERS: Record<string, string> = { 'Content-Type': 'application/json' };

interface GroqFilterResult {
  expression: string;
  params: Record<string, unknown>;
}

interface GroqFilterContext {
  nextParam: number;
  params: Record<string, unknown>;
}

const GROQ_PATH_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*$/;

function assertGroqPath(path: string, kind: 'field' | 'sort'): void {
  if (!GROQ_PATH_PATTERN.test(path)) {
    throw new Error(`Invalid GROQ ${kind} path: ${path}`);
  }
}

function addGroqParam(context: GroqFilterContext, value: unknown): string {
  const name = `filter${context.nextParam++}`;
  context.params[name] = value;
  return `$${name}`;
}

function assertArrayOperatorValue(operator: CrudOperator, value: unknown): asserts value is unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`GROQ filter operator "${operator}" requires an array value`);
  }
}

function assertRangeOperatorValue(operator: CrudOperator, value: unknown): asserts value is [unknown, unknown] {
  if (!Array.isArray(value) || value.length !== 2) {
    throw new Error(`GROQ filter operator "${operator}" requires a two-item array value`);
  }
}

function buildGroqFieldFilter(filter: FieldFilter, context: GroqFilterContext): string {
  assertGroqPath(filter.field, 'field');

  switch (filter.operator) {
    case 'eq':
      return `${filter.field} == ${addGroqParam(context, filter.value)}`;
    case 'ne':
      return `${filter.field} != ${addGroqParam(context, filter.value)}`;
    case 'lt':
      return `${filter.field} < ${addGroqParam(context, filter.value)}`;
    case 'gt':
      return `${filter.field} > ${addGroqParam(context, filter.value)}`;
    case 'lte':
      return `${filter.field} <= ${addGroqParam(context, filter.value)}`;
    case 'gte':
      return `${filter.field} >= ${addGroqParam(context, filter.value)}`;
    case 'contains':
      return `${filter.field} match ${addGroqParam(context, `*${String(filter.value)}*`)}`;
    case 'ncontains':
      return `!(${filter.field} match ${addGroqParam(context, `*${String(filter.value)}*`)})`;
    case 'startswith':
      return `${filter.field} match ${addGroqParam(context, `${String(filter.value)}*`)}`;
    case 'endswith':
      return `${filter.field} match ${addGroqParam(context, `*${String(filter.value)}`)}`;
    case 'in':
      assertArrayOperatorValue(filter.operator, filter.value);
      return `${filter.field} in ${addGroqParam(context, filter.value)}`;
    case 'nin':
      assertArrayOperatorValue(filter.operator, filter.value);
      return `!(${filter.field} in ${addGroqParam(context, filter.value)})`;
    case 'null':
      return `!defined(${filter.field})`;
    case 'nnull':
      return `defined(${filter.field})`;
    case 'between': {
      assertRangeOperatorValue(filter.operator, filter.value);
      const lower = addGroqParam(context, filter.value[0]);
      const upper = addGroqParam(context, filter.value[1]);
      return `${filter.field} >= ${lower} && ${filter.field} <= ${upper}`;
    }
    case 'nbetween': {
      assertRangeOperatorValue(filter.operator, filter.value);
      const lower = addGroqParam(context, filter.value[0]);
      const upper = addGroqParam(context, filter.value[1]);
      return `!(${filter.field} >= ${lower} && ${filter.field} <= ${upper})`;
    }
    default:
      throw new Error(`Unsupported GROQ filter operator: ${String(filter.operator)}`);
  }
}

function buildGroqFilterNode(filter: Filter, context: GroqFilterContext): string {
  if (typeof filter !== 'object' || filter === null) {
    throw new Error('Unsupported GROQ filter: expected an object');
  }

  if ('field' in filter) {
    return buildGroqFieldFilter(filter, context);
  }

  if (filter.operator !== 'and' && filter.operator !== 'or') {
    throw new Error(`Unsupported GROQ logical operator: ${String(filter.operator)}`);
  }
  if (!Array.isArray(filter.value) || filter.value.length === 0) {
    throw new Error(`GROQ logical operator "${filter.operator}" requires at least one filter`);
  }

  const joiner = filter.operator === 'and' ? ' && ' : ' || ';
  return `(${filter.value.map(child => buildGroqFilterNode(child, context)).join(joiner)})`;
}

function buildGroqFilters(filters?: Filter[]): GroqFilterResult {
  if (!filters?.length) return { expression: '', params: {} };
  const context: GroqFilterContext = { nextParam: 0, params: {} };
  const expression = filters.map(filter => buildGroqFilterNode(filter, context)).join(' && ');
  return { expression, params: context.params };
}

function buildGroqOrder(sorters?: Sort[]): string {
  if (!sorters?.length) return '';
  return ` | order(${sorters.map(sorter => {
    assertGroqPath(sorter.field, 'sort');
    if (sorter.order !== 'asc' && sorter.order !== 'desc') {
      throw new Error(`Invalid GROQ sort order: ${String(sorter.order)}`);
    }
    return `${sorter.field} ${sorter.order}`;
  }).join(', ')})`;
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

function isSameOrigin(apiUrl: string, targetUrl: string): boolean {
  try {
    return new URL(apiUrl).origin === new URL(targetUrl, `${apiUrl}/`).origin;
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

function appendCustomQuery(params: URLSearchParams, query?: Record<string, unknown>): void {
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

function buildCustomUrl(
  url: string,
  apiUrl: string,
  query?: Record<string, unknown>,
  sorters?: Sort[],
  filters?: Filter[],
): string {
  const parsed = new URL(url, apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`);
  appendCustomQuery(parsed.searchParams, query);
  if (sorters?.length) parsed.searchParams.set('_sorters', JSON.stringify(sorters));
  if (filters?.length) parsed.searchParams.set('_filters', JSON.stringify(filters));
  return parsed.toString();
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

export function createSanityDataProvider(projectId: string, dataset: string, token?: string, apiVersion = '2023-05-03'): DataProvider {
  const apiUrl = `https://${projectId}.api.sanity.io/v${apiVersion}`;
  const providerHeaders: Record<string, string> = { ...DEFAULT_JSON_HEADERS };
  if (token) providerHeaders.Authorization = `Bearer ${token}`;

  async function query(groq: string, params: Record<string, unknown> = {}): Promise<unknown> {
    const url = new URL(`${apiUrl}/data/query/${dataset}`);
    url.searchParams.set('query', groq);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(`$${k}`, JSON.stringify(v));
    const res = await fetch(url.toString(), { headers: providerHeaders });
    if (!res.ok) throw new Error(`Sanity error: ${res.status}`);
    const data = await res.json();
    return data.result;
  }

  async function mutate(mutations: Record<string, unknown>[]): Promise<SanityMutationResult> {
    const res = await fetch(`${apiUrl}/data/mutate/${dataset}`, {
      method: 'POST', headers: providerHeaders, body: JSON.stringify({ mutations }),
    });
    if (!res.ok) throw new Error(`Sanity mutation error: ${res.status}`);
    return res.json();
  }

  return {
    getApiUrl: () => apiUrl,

    async getList<T extends BaseRecord = BaseRecord>({ resource, pagination, sorters, filters }: GetListParams): Promise<GetListResult<T>> {
      const { current = 1, pageSize = 10 } = pagination ?? {};
      const start = (current - 1) * pageSize;
      const end = start + pageSize;
      const filter = buildGroqFilters(filters);
      const typeFilter = '_type == $resource';
      const where = filter.expression ? `${typeFilter} && ${filter.expression}` : typeFilter;
      const orderStr = buildGroqOrder(sorters);
      const params = { resource, ...filter.params };

      const [data, total] = await Promise.all([
        query(`*[${where}]${orderStr}[${start}...${end}]`, params),
        query(`count(*[${where}])`, params),
      ]);
      return { data: ((data as SanityDoc[]) ?? []).map((d) => ({ ...d, id: d._id })) as unknown as unknown as T[], total: (total as number) ?? 0 };
    },

    async getOne<T extends BaseRecord = BaseRecord>({ resource, id }: GetOneParams): Promise<GetOneResult<T>> {
      const raw = await query('*[_type == $resource && _id == $id][0]', { resource, id });
      const data = raw as SanityDoc;
      return { data: { ...data, id: data._id } as unknown as unknown as T };
    },

    async create<T extends BaseRecord = BaseRecord>({ resource, variables }: CreateParams): Promise<CreateResult<T>> {
      const doc = { _type: resource, ...(variables as Record<string, unknown>) };
      const result = await mutate([{ create: doc }]);
      const id = result.results?.[0]?.id;
      return { data: { ...(variables as Record<string, unknown>), id, _id: id } as unknown as unknown as T };
    },

    async update<T extends BaseRecord = BaseRecord>({ id, variables }: UpdateParams): Promise<UpdateResult<T>> {
      await mutate([{ patch: { id, set: variables } }]);
      return { data: { ...(variables as Record<string, unknown>), id, _id: id } as unknown as unknown as T };
    },

    async deleteOne<T extends BaseRecord = BaseRecord>({ id }: DeleteParams): Promise<DeleteResult<T>> {
      await mutate([{ delete: { id } }]);
      return { data: { id } as unknown as unknown as T };
    },

    async getMany<T extends BaseRecord = BaseRecord>({ resource, ids }: GetManyParams): Promise<GetManyResult<T>> {
      const data = await query('*[_type == $resource && _id in $ids]', { resource, ids });
      return { data: ((data as SanityDoc[]) ?? []).map((d) => ({ ...d, id: d._id })) as unknown as unknown as T[] };
    },

    async custom<T = unknown>({ url, method, payload, query: customQuery, headers, sorters, filters }: CustomParams): Promise<CustomResult<T>> {
      const requestUrl = buildCustomUrl(url, apiUrl, customQuery, sorters, filters);
      const requestHeaders = mergeHeaders(
        isSameOrigin(apiUrl, requestUrl) ? providerHeaders : DEFAULT_JSON_HEADERS,
        headers,
      );
      const res = await fetch(requestUrl, {
        method: method.toUpperCase(),
        headers: requestHeaders,
        body: payload === undefined ? undefined : JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Custom request failed: ${res.status}`);
      return { data: await parseResponse<T>(res) };
    },
  };
}
