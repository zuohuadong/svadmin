import type {
  DataProvider, GetListParams, GetListResult, GetOneParams, GetOneResult,
  CreateParams, CreateResult, UpdateParams, UpdateResult, DeleteParams, DeleteResult,
  GetManyParams, GetManyResult, CustomParams, CustomResult
} from '@svadmin/core';

export function createMedusaDataProvider(apiUrl: string, apiKey?: string): DataProvider {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['x-medusa-access-token'] = apiKey;

  async function request(path: string, opts?: RequestInit) {
    const res = await fetch(`${apiUrl}${path}`, { ...opts, headers: { ...headers, ...opts?.headers } });
    if (!res.ok) throw new Error(`Medusa API error: ${res.status}`);
    return res.json();
  }

  return {
    getApiUrl: () => apiUrl,

    async getList<T>({ resource, pagination, sorters, filters }: GetListParams): Promise<GetListResult<T>> {
      const { current = 1, pageSize = 10 } = pagination ?? {};
      const params = new URLSearchParams();
      params.set('offset', String((current - 1) * pageSize));
      params.set('limit', String(pageSize));
      if (sorters?.length) params.set('order', sorters.map(s => `${s.order === 'desc' ? '-' : ''}${s.field}`).join(','));
      if (filters?.length) {
        for (const f of filters) {
          if ('field' in f) params.set(f.field as string, String(f.value));
        }
      }
      const data = await request(`/admin/${resource}?${params}`);
      return { data: data[resource] ?? data.data ?? [], total: data.count ?? data[resource]?.length ?? 0 };
    },

    async getOne<T>({ resource, id }: GetOneParams): Promise<GetOneResult<T>> {
      const singular = resource.replace(/s$/, '');
      const data = await request(`/admin/${resource}/${id}`);
      return { data: (data[singular] ?? data) as T };
    },

    async create<T>({ resource, variables }: CreateParams): Promise<CreateResult<T>> {
      const singular = resource.replace(/s$/, '');
      const data = await request(`/admin/${resource}`, { method: 'POST', body: JSON.stringify(variables) });
      return { data: (data[singular] ?? data) as T };
    },

    async update<T>({ resource, id, variables }: UpdateParams): Promise<UpdateResult<T>> {
      const singular = resource.replace(/s$/, '');
      const data = await request(`/admin/${resource}/${id}`, { method: 'POST', body: JSON.stringify(variables) });
      return { data: (data[singular] ?? data) as T };
    },

    async deleteOne<T>({ resource, id }: DeleteParams): Promise<DeleteResult<T>> {
      const data = await request(`/admin/${resource}/${id}`, { method: 'DELETE' });
      return { data: data as T };
    },

    async getMany<T>({ resource, ids }: GetManyParams): Promise<GetManyResult<T>> {
      const results = await Promise.all(ids.map(async (id: string | number) => {
        const singular = resource.replace(/s$/, '');
        const data = await request(`/admin/${resource}/${id}`);
        return (data[singular] ?? data) as T;
      }));
      return { data: results };
    },

    async custom<T>({ url, method, payload, headers: h }: CustomParams): Promise<CustomResult<T>> {
      const res = await fetch(url, { method: method.toUpperCase(), headers: { ...headers, ...h }, body: payload ? JSON.stringify(payload) : undefined });
      if (!res.ok) throw new Error(`Custom request failed: ${res.status}`);
      return { data: (await res.json()) as T };
    },
  };
}
