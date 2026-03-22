// Supabase DataProvider
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  DataProvider, GetListParams, GetListResult, GetOneParams, GetOneResult,
  CreateParams, CreateResult, UpdateParams, UpdateResult, DeleteParams, DeleteResult,
  GetManyParams, GetManyResult, CreateManyParams, CreateManyResult,
  UpdateManyParams, UpdateManyResult, DeleteManyParams, DeleteManyResult,
  CustomParams, CustomResult,
} from '@svadmin/core';

export function createSupabaseDataProvider(client: SupabaseClient, apiUrl?: string): DataProvider {
  const resolvedApiUrl = apiUrl ?? '';

  return {
    getApiUrl: () => resolvedApiUrl,

    async getList<T>({ resource, pagination, sorters, filters, meta }: GetListParams): Promise<GetListResult<T>> {
      const { current = 1, pageSize = 10 } = pagination ?? {};
      const from = (current - 1) * pageSize;
      const to = from + pageSize - 1;
      const select = (meta?.select as string) ?? '*';

      let query = client.from(resource).select(select, { count: 'exact' }).range(from, to);

      if (sorters?.length) {
        for (const sort of sorters) {
          query = query.order(sort.field, { ascending: sort.order === 'asc' });
        }
      }

      if (filters?.length) {
        for (const filter of filters) {
          switch (filter.operator) {
            case 'eq': query = query.eq(filter.field, filter.value); break;
            case 'ne': query = query.neq(filter.field, filter.value); break;
            case 'lt': query = query.lt(filter.field, filter.value); break;
            case 'gt': query = query.gt(filter.field, filter.value); break;
            case 'lte': query = query.lte(filter.field, filter.value); break;
            case 'gte': query = query.gte(filter.field, filter.value); break;
            case 'contains': query = query.ilike(filter.field, `%${filter.value}%`); break;
            case 'in': query = query.in(filter.field, filter.value as unknown[]); break;
            case 'null': query = query.is(filter.field, null); break;
          }
        }
      }

      const { data, count, error } = await query;
      if (error) throw error;
      return { data: (data ?? []) as T[], total: count ?? 0 };
    },

    async getOne<T>({ resource, id, meta }: GetOneParams): Promise<GetOneResult<T>> {
      const select = (meta?.select as string) ?? '*';
      const { data, error } = await client.from(resource).select(select).eq('id', id).single();
      if (error) throw error;
      return { data: data as T };
    },

    async create<T>({ resource, variables }: CreateParams): Promise<CreateResult<T>> {
      const { data, error } = await client.from(resource).insert(variables).select().single();
      if (error) throw error;
      return { data: data as T };
    },

    async update<T>({ resource, id, variables }: UpdateParams): Promise<UpdateResult<T>> {
      const { data, error } = await client.from(resource).update(variables).eq('id', id).select().single();
      if (error) throw error;
      return { data: data as T };
    },

    async deleteOne<T>({ resource, id }: DeleteParams): Promise<DeleteResult<T>> {
      const { data, error } = await client.from(resource).delete().eq('id', id).select().single();
      if (error) throw error;
      return { data: data as T };
    },

    async getMany<T>({ resource, ids, meta }: GetManyParams): Promise<GetManyResult<T>> {
      const select = (meta?.select as string) ?? '*';
      const { data, error } = await client.from(resource).select(select).in('id', ids);
      if (error) throw error;
      return { data: (data ?? []) as T[] };
    },

    async createMany<T>({ resource, variables }: CreateManyParams): Promise<CreateManyResult<T>> {
      const { data, error } = await client.from(resource).insert(variables).select();
      if (error) throw error;
      return { data: (data ?? []) as T[] };
    },

    async updateMany<T>({ resource, ids, variables }: UpdateManyParams): Promise<UpdateManyResult<T>> {
      const { data, error } = await client.from(resource).update(variables).in('id', ids).select();
      if (error) throw error;
      return { data: (data ?? []) as T[] };
    },

    async deleteMany<T>({ resource, ids }: DeleteManyParams): Promise<DeleteManyResult<T>> {
      const { data, error } = await client.from(resource).delete().in('id', ids).select();
      if (error) throw error;
      return { data: (data ?? []) as T[] };
    },

    async custom<T>({ url, method, payload, headers }: CustomParams): Promise<CustomResult<T>> {
      const response = await fetch(url, {
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
