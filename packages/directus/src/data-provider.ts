import type {
  DataProvider, GetListParams, GetListResult, GetOneParams, GetOneResult,
  CreateParams, CreateResult, UpdateParams, UpdateResult, DeleteParams, DeleteResult,
  GetManyParams, GetManyResult, CustomParams, CustomResult, Sort, Filter
} from '@svadmin/core';

function buildDirectusFilter(filters?: Filter[]): Record<string, unknown> {
  if (!filters?.length) return {};
  const filter: Record<string, unknown> = {};
  const opMap: Record<string, string> = { eq: '_eq', ne: '_neq', lt: '_lt', gt: '_gt', lte: '_lte', gte: '_gte', contains: '_contains', in: '_in', null: '_null' };
  for (const f of filters) {
    if ('field' in f) filter[f.field as string] = { [opMap[f.operator as string] ?? '_eq']: f.value };
  }
  return filter;
}

export function createDirectusDataProvider(apiUrl: string, token?: string): DataProvider {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  async function request<T>(path: string, opts?: RequestInit): Promise<T> {
    const res = await fetch(`${apiUrl}${path}`, { ...opts, headers: { ...headers, ...opts?.headers } });
    if (!res.ok) throw new Error(`Directus error: ${res.status}`);
    return res.json();
  }

  return {
    getApiUrl: () => apiUrl,

    async getList<T>({ resource, pagination, sorters, filters, meta }: GetListParams): Promise<GetListResult<T>> {
      const { current = 1, pageSize = 10 } = pagination ?? {};
      const params = new URLSearchParams();
      params.set('limit', String(pageSize));
      params.set('offset', String((current - 1) * pageSize));
      params.set('meta', 'total_count');
      if (meta?.fields) params.set('fields', (meta.fields as string[]).join(','));
      if (sorters?.length) params.set('sort', sorters.map((s: Sort) => `${s.order === 'desc' ? '-' : ''}${s.field}`).join(','));
      const filter = buildDirectusFilter(filters);
      if (Object.keys(filter).length) params.set('filter', JSON.stringify(filter));

      const data = await request<any>(`/items/${resource}?${params}`);
      return { data: data.data ?? [], total: data.meta?.total_count ?? 0 };
    },

    async getOne<T>({ resource, id, meta }: GetOneParams): Promise<GetOneResult<T>> {
      const params = meta?.fields ? `?fields=${(meta.fields as string[]).join(',')}` : '';
      const data = await request<any>(`/items/${resource}/${id}${params}`);
      return { data: data.data as T };
    },

    async create<T>({ resource, variables }: CreateParams): Promise<CreateResult<T>> {
      const data = await request<any>(`/items/${resource}`, { method: 'POST', body: JSON.stringify(variables) });
      return { data: data.data as T };
    },

    async update<T>({ resource, id, variables }: UpdateParams): Promise<UpdateResult<T>> {
      const data = await request<any>(`/items/${resource}/${id}`, { method: 'PATCH', body: JSON.stringify(variables) });
      return { data: data.data as T };
    },

    async deleteOne<T>({ resource, id }: DeleteParams): Promise<DeleteResult<T>> {
      await request(`/items/${resource}/${id}`, { method: 'DELETE' });
      return { data: { id } as T };
    },

    async getMany<T>({ resource, ids, meta }: GetManyParams): Promise<GetManyResult<T>> {
      const params = new URLSearchParams();
      params.set('filter', JSON.stringify({ id: { _in: ids } }));
      if (meta?.fields) params.set('fields', (meta.fields as string[]).join(','));
      const data = await request<any>(`/items/${resource}?${params}`);
      return { data: data.data ?? [] };
    },

    async custom<T>({ url, method, payload, headers: h }: CustomParams): Promise<CustomResult<T>> {
      const res = await fetch(url, { method: method.toUpperCase(), headers: { ...headers, ...h }, body: payload ? JSON.stringify(payload) : undefined });
      if (!res.ok) throw new Error(`Custom request failed: ${res.status}`);
      return { data: (await res.json()) as T };
    },
  };
}
