import type {
  DataProvider,
  GetListParams,
  GetListResult,
  GetOneParams,
  GetOneResult,
  CreateParams,
  CreateResult,
  UpdateParams,
  UpdateResult,
  DeleteParams,
  DeleteResult,
  GetManyParams,
  GetManyResult,
  CustomParams,
  CustomResult,
  Filter,
  Sort
} from '@svadmin/core';

// Simplified nestjsx/crud-request query generation
function mapOperator(operator: string): string {
  switch (operator) {
    case 'eq': return '$eq';
    case 'ne': return '$ne';
    case 'lt': return '$lt';
    case 'gt': return '$gt';
    case 'lte': return '$lte';
    case 'gte': return '$gte';
    case 'contains': return '$cont';
    case 'in': return '$in';
    case 'null': return '$isnull';
    default: return '$eq';
  }
}

function generateQueryParams(
  pagination?: { current?: number; pageSize?: number; mode?: string },
  sorters?: Sort[],
  filters?: Filter[]
): string {
  const params = new URLSearchParams();

  if (pagination && pagination.mode !== 'off') {
    if (pagination.pageSize) params.set('limit', String(pagination.pageSize));
    if (pagination.current) params.set('page', String(pagination.current));
  }

  if (sorters && sorters.length > 0) {
    sorters.forEach((sort) => {
      params.append('sort', `${sort.field},${sort.order === 'asc' ? 'ASC' : 'DESC'}`);
    });
  }

  if (filters && filters.length > 0) {
    filters.forEach((f) => {
      // For LogicalFilter etc, full NestJSX queries can be complex. We support standard CrudOperators.
      if ('field' in f) {
        params.append('filter', `${f.field}||${mapOperator(f.operator as string)}||${f.value}`);
      }
    });
  }

  return params.toString();
}

export function createNestjsxCrudDataProvider(apiUrl: string, httpClient: typeof fetch = fetch): DataProvider {
  return {
    getApiUrl: () => apiUrl,

    async getList<T>({ resource, pagination, sorters, filters }: GetListParams): Promise<GetListResult<T>> {
      const url = new URL(`${apiUrl}/${resource}`);
      url.search = generateQueryParams(pagination, sorters, filters);

      const response = await httpClient(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();

      return {
        data: data.data || data,
        total: data.total || data.length,
      };
    },

    async getOne<T>({ resource, id }: GetOneParams): Promise<GetOneResult<T>> {
      const response = await httpClient(`${apiUrl}/${resource}/${id}`);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      return { data: data };
    },

    async create<T>({ resource, variables }: CreateParams): Promise<CreateResult<T>> {
      const response = await httpClient(`${apiUrl}/${resource}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variables),
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      return { data: data };
    },

    async update<T>({ resource, id, variables }: UpdateParams): Promise<UpdateResult<T>> {
      const response = await httpClient(`${apiUrl}/${resource}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variables),
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      return { data: data };
    },

    async deleteOne<T>({ resource, id }: DeleteParams): Promise<DeleteResult<T>> {
      const response = await httpClient(`${apiUrl}/${resource}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      return { data: data };
    },

    async getMany<T>({ resource, ids }: GetManyParams): Promise<GetManyResult<T>> {
      const url = new URL(`${apiUrl}/${resource}`);
      ids.forEach((id) => url.searchParams.append('search', `id||$in||${id}`));

      const response = await httpClient(url.toString());
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      return { data: data.data || data };
    },

    async custom<T>({ url, method, payload, headers, query }: CustomParams): Promise<CustomResult<T>> {
      let requestUrl = url;
      if (query) {
        const params = new URLSearchParams();
        Object.entries(query).forEach(([k, v]) => params.append(k, String(v)));
        requestUrl = `${url}?${params.toString()}`;
      }

      const response = await httpClient(requestUrl, {
        method: method.toUpperCase(),
        headers: { 'Content-Type': 'application/json', ...headers },
        body: payload ? JSON.stringify(payload) : undefined,
      });

      if (!response.ok) throw new Error(`Custom request failed: ${response.status}`);
      const data = await response.json();
      return { data: data as T };
    },
  };
}
