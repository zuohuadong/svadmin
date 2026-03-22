// @svadmin/pocketbase — PocketBase DataProvider
// Maps svadmin CRUD operations to PocketBase SDK

import type { DataProvider, GetListParams, GetListResult, GetOneParams, GetOneResult, CreateParams, CreateResult, UpdateParams, UpdateResult, DeleteParams, DeleteResult } from '@svadmin/core';

interface PocketBaseProviderOptions {
  /** PocketBase client instance */
  pb: unknown; // PocketBase
}

/**
 * Create a DataProvider backed by PocketBase.
 *
 * Usage:
 * ```ts
 * import PocketBase from 'pocketbase';
 * import { createPocketBaseDataProvider } from '@svadmin/pocketbase';
 *
 * const pb = new PocketBase('http://127.0.0.1:8090');
 * const dataProvider = createPocketBaseDataProvider({ pb });
 * ```
 */
export function createPocketBaseDataProvider(options: PocketBaseProviderOptions): DataProvider {
  const pb = options.pb as {
    collection: (name: string) => {
      getList: (page: number, perPage: number, options?: { sort?: string; filter?: string }) => Promise<{ items: Record<string, unknown>[]; totalItems: number }>;
      getOne: (id: string) => Promise<Record<string, unknown>>;
      create: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
      update: (id: string, data: Record<string, unknown>) => Promise<Record<string, unknown>>;
      delete: (id: string) => Promise<boolean>;
    };
    buildUrl: (path: string) => string;
  };

  function buildSort(sorters?: { field: string; order: 'asc' | 'desc' }[]): string | undefined {
    if (!sorters?.length) return undefined;
    return sorters.map(s => s.order === 'desc' ? `-${s.field}` : s.field).join(',');
  }

  function buildFilter(filters?: { field: string; operator: string; value: unknown }[]): string | undefined {
    if (!filters?.length) return undefined;
    return filters.map(f => {
      switch (f.operator) {
        case 'eq': return `${f.field} = '${f.value}'`;
        case 'ne': return `${f.field} != '${f.value}'`;
        case 'contains': return `${f.field} ~ '${f.value}'`;
        case 'gt': return `${f.field} > '${f.value}'`;
        case 'gte': return `${f.field} >= '${f.value}'`;
        case 'lt': return `${f.field} < '${f.value}'`;
        case 'lte': return `${f.field} <= '${f.value}'`;
        default: return `${f.field} = '${f.value}'`;
      }
    }).join(' && ');
  }

  return {
    getApiUrl: () => pb.buildUrl('/api'),

    getList: async <T>(params: GetListParams): Promise<GetListResult<T>> => {
      const page = params.pagination?.current ?? 1;
      const perPage = params.pagination?.pageSize ?? 10;
      const result = await pb.collection(params.resource).getList(page, perPage, {
        sort: buildSort(params.sorters),
        filter: buildFilter(params.filters),
      });
      return {
        data: result.items as T[],
        total: result.totalItems,
      };
    },

    getOne: async <T>(params: GetOneParams): Promise<GetOneResult<T>> => {
      const record = await pb.collection(params.resource).getOne(String(params.id));
      return { data: record as T };
    },

    create: async <T>(params: CreateParams): Promise<CreateResult<T>> => {
      const record = await pb.collection(params.resource).create(params.variables);
      return { data: record as T };
    },

    update: async <T>(params: UpdateParams): Promise<UpdateResult<T>> => {
      const record = await pb.collection(params.resource).update(String(params.id), params.variables);
      return { data: record as T };
    },

    deleteOne: async <T>(params: DeleteParams): Promise<DeleteResult<T>> => {
      await pb.collection(params.resource).delete(String(params.id));
      return { data: { id: params.id } as T };
    },
  };
}
