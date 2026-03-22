// Simple REST DataProvider — fetch-based, zero dependencies
// Compatible with json-server, RESTful APIs, and any JSON backend

import type {
  DataProvider, GetListParams, GetListResult, GetOneParams, GetOneResult,
  CreateParams, CreateResult, UpdateParams, UpdateResult, DeleteParams, DeleteResult,
  GetManyParams, GetManyResult, CreateManyParams, CreateManyResult,
  UpdateManyParams, UpdateManyResult, DeleteManyParams, DeleteManyResult,
  CustomParams, CustomResult,
} from '@svadmin/core';

export interface SimpleRestOptions {
  apiUrl: string;
  headers?: Record<string, string> | (() => Record<string, string>);
}

function getHeaders(opts: SimpleRestOptions): Record<string, string> {
  const base = { 'Content-Type': 'application/json' };
  const extra = typeof opts.headers === 'function' ? opts.headers() : (opts.headers ?? {});
  return { ...base, ...extra };
}

export function createSimpleRestDataProvider(opts: SimpleRestOptions): DataProvider {
  const { apiUrl } = opts;

  async function request<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, { ...init, headers: { ...getHeaders(opts), ...init?.headers } });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.json();
  }

  return {
    getApiUrl: () => apiUrl,

    async getList<T>({ resource, pagination, sorters, filters }: GetListParams): Promise<GetListResult<T>> {
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

      const url = `${apiUrl}/${resource}?${params.toString()}`;
      const response = await fetch(url, { headers: getHeaders(opts) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json() as T[];
      const total = parseInt(response.headers.get('X-Total-Count') ?? String(data.length), 10);
      return { data, total };
    },

    async getOne<T>({ resource, id }: GetOneParams): Promise<GetOneResult<T>> {
      const data = await request<T>(`${apiUrl}/${resource}/${id}`);
      return { data };
    },

    async create<T>({ resource, variables }: CreateParams): Promise<CreateResult<T>> {
      const data = await request<T>(`${apiUrl}/${resource}`, {
        method: 'POST',
        body: JSON.stringify(variables),
      });
      return { data };
    },

    async update<T>({ resource, id, variables }: UpdateParams): Promise<UpdateResult<T>> {
      const data = await request<T>(`${apiUrl}/${resource}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(variables),
      });
      return { data };
    },

    async deleteOne<T>({ resource, id }: DeleteParams): Promise<DeleteResult<T>> {
      const data = await request<T>(`${apiUrl}/${resource}/${id}`, { method: 'DELETE' });
      return { data };
    },

    async getMany<T>({ resource, ids }: GetManyParams): Promise<GetManyResult<T>> {
      const params = ids.map(id => `id=${id}`).join('&');
      const data = await request<T[]>(`${apiUrl}/${resource}?${params}`);
      return { data };
    },

    async createMany<T>({ resource, variables }: CreateManyParams): Promise<CreateManyResult<T>> {
      const results: T[] = [];
      for (const vars of variables) {
        const data = await request<T>(`${apiUrl}/${resource}`, {
          method: 'POST',
          body: JSON.stringify(vars),
        });
        results.push(data);
      }
      return { data: results };
    },

    async updateMany<T>({ resource, ids, variables }: UpdateManyParams): Promise<UpdateManyResult<T>> {
      const results: T[] = [];
      for (const id of ids) {
        const data = await request<T>(`${apiUrl}/${resource}/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(variables),
        });
        results.push(data);
      }
      return { data: results };
    },

    async deleteMany<T>({ resource, ids }: DeleteManyParams): Promise<DeleteManyResult<T>> {
      const results: T[] = [];
      for (const id of ids) {
        const data = await request<T>(`${apiUrl}/${resource}/${id}`, { method: 'DELETE' });
        results.push(data);
      }
      return { data: results };
    },

    async custom<T>({ url, method, payload, headers }: CustomParams): Promise<CustomResult<T>> {
      const data = await request<T>(url, {
        method: method.toUpperCase(),
        headers,
        body: payload ? JSON.stringify(payload) : undefined,
      });
      return { data };
    },
  };
}
