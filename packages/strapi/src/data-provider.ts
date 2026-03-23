import type {
  DataProvider, GetListParams, GetListResult, GetOneParams, GetOneResult,
  CreateParams, CreateResult, UpdateParams, UpdateResult, DeleteParams, DeleteResult,
  GetManyParams, GetManyResult, CustomParams, CustomResult, Sort, Filter
} from '@svadmin/core';

function mapOperator(operator: string): string {
  switch (operator) {
    case 'eq': return '$eq';
    case 'ne': return '$ne';
    case 'lt': return '$lt';
    case 'gt': return '$gt';
    case 'lte': return '$lte';
    case 'gte': return '$gte';
    case 'contains': return '$containsi'; // case-insensitive contains
    case 'in': return '$in';
    case 'null': return '$null';
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
    if (pagination.current) params.set('pagination[page]', String(pagination.current));
    if (pagination.pageSize) params.set('pagination[pageSize]', String(pagination.pageSize));
  }

  if (sorters && sorters.length > 0) {
    sorters.forEach((sort, index) => {
      params.append(`sort[${index}]`, `${sort.field}:${sort.order}`);
    });
  }

  if (filters && filters.length > 0) {
    filters.forEach((f, index) => {
      if ('field' in f) {
        params.append(`filters[${f.field}][${mapOperator(f.operator as string)}]`, String(f.value));
      }
    });
  }

  return params.toString();
}

export function createStrapiDataProvider(apiUrl: string, httpClient: typeof fetch = fetch): DataProvider {
  return {
    getApiUrl: () => apiUrl,

    async getList<T>({ resource, pagination, sorters, filters, meta }: GetListParams): Promise<GetListResult<T>> {
      const url = new URL(`${apiUrl}/${resource}`);
      url.search = generateQueryParams(pagination, sorters, filters);
      if (meta?.populate) url.searchParams.append('populate', String(meta.populate));

      const response = await httpClient(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();

      return {
        data: data.data || [],
        total: data.meta?.pagination?.total || data.data?.length || 0,
      };
    },

    async getOne<T>({ resource, id, meta }: GetOneParams): Promise<GetOneResult<T>> {
      const url = new URL(`${apiUrl}/${resource}/${id}`);
      if (meta?.populate) url.searchParams.append('populate', String(meta.populate));
      
      const response = await httpClient(url.toString());
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      return { data: data.data || data };
    },

    async create<T>({ resource, variables }: CreateParams): Promise<CreateResult<T>> {
      const response = await httpClient(`${apiUrl}/${resource}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: variables }), // Strapi wraps payload in 'data'
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const result = await response.json();
      return { data: result.data || result };
    },

    async update<T>({ resource, id, variables }: UpdateParams): Promise<UpdateResult<T>> {
      const response = await httpClient(`${apiUrl}/${resource}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: variables }),
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const result = await response.json();
      return { data: result.data || result };
    },

    async deleteOne<T>({ resource, id }: DeleteParams): Promise<DeleteResult<T>> {
      const response = await httpClient(`${apiUrl}/${resource}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const result = await response.json();
      return { data: result.data || result };
    },

    async getMany<T>({ resource, ids, meta }: GetManyParams): Promise<GetManyResult<T>> {
      const url = new URL(`${apiUrl}/${resource}`);
      ids.forEach((id: string | number, index: number) => url.searchParams.append(`filters[id][$in][${index}]`, String(id)));
      if (meta?.populate) url.searchParams.append('populate', String(meta.populate));

      const response = await httpClient(url.toString());
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const result = await response.json();
      return { data: result.data || [] };
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
