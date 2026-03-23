// @svadmin/pocketbase — PocketBase DataProvider
// Maps svadmin CRUD operations to PocketBase SDK

import type {
  DataProvider, GetListParams, GetListResult, GetOneParams, GetOneResult,
  CreateParams, CreateResult, UpdateParams, UpdateResult, DeleteParams, DeleteResult,
  GetManyParams, GetManyResult, DeleteManyParams, DeleteManyResult, BaseRecord,
} from '@svadmin/core';

interface PocketBaseProviderOptions {
  /** PocketBase client instance */
  pb: unknown; // PocketBase
}

// Duck-typed PocketBase collection interface
interface PBCollection {
  getList: (page: number, perPage: number, options?: { sort?: string; filter?: string }) => Promise<{ items: Record<string, unknown>[]; totalItems: number }>;
  getOne: (id: string) => Promise<Record<string, unknown>>;
  getFullList: (options?: { sort?: string; filter?: string; batch?: number }) => Promise<Record<string, unknown>[]>;
  create: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
  update: (id: string, data: Record<string, unknown>) => Promise<Record<string, unknown>>;
  delete: (id: string) => Promise<boolean>;
}

interface PBClient {
  collection: (name: string) => PBCollection;
  buildUrl: (path: string) => string;
}

function buildSort(sorters?: { field: string; order: 'asc' | 'desc' }[]): string | undefined {
  if (!sorters?.length) return undefined;
  return sorters.map(s => s.order === 'desc' ? `-${s.field}` : s.field).join(',');
}

function buildFilter(filters?: { field: string; operator: string; value: unknown }[]): string | undefined {
  if (!filters?.length) return undefined;
  return filters.map(f => {
    const v = f.value;
    switch (f.operator) {
      case 'eq': return `${f.field} = '${v}'`;
      case 'ne': return `${f.field} != '${v}'`;
      case 'contains': return `${f.field} ~ '${v}'`;
      case 'ncontains': return `${f.field} !~ '${v}'`;
      case 'gt': return `${f.field} > '${v}'`;
      case 'gte': return `${f.field} >= '${v}'`;
      case 'lt': return `${f.field} < '${v}'`;
      case 'lte': return `${f.field} <= '${v}'`;
      case 'null': return `${f.field} = ''`;
      case 'nnull': return `${f.field} != ''`;
      case 'in': return `${f.field} ?= '${(v as unknown[]).join("' || " + f.field + " ?= '")}'`;
      default: return `${f.field} = '${v}'`;
    }
  }).join(' && ');
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
  const pb = options.pb as PBClient;

  return {
    getApiUrl: () => pb.buildUrl('/api'),

    async getList<TData extends BaseRecord = BaseRecord>(params: GetListParams): Promise<GetListResult<TData>> {
      const page = params.pagination?.current ?? 1;
      const perPage = params.pagination?.pageSize ?? 10;
      const result = await pb.collection(params.resource).getList(page, perPage, {
        sort: buildSort(params.sorters),
        filter: buildFilter(params.filters),
      });
      return {
        data: result.items as TData[],
        total: result.totalItems,
      };
    },

    async getOne<TData extends BaseRecord = BaseRecord>(params: GetOneParams): Promise<GetOneResult<TData>> {
      const record = await pb.collection(params.resource).getOne(String(params.id));
      return { data: record as TData };
    },

    async create<TData extends BaseRecord = BaseRecord, TVariables = unknown>(params: CreateParams<TVariables>): Promise<CreateResult<TData>> {
      const record = await pb.collection(params.resource).create(params.variables as Record<string, unknown>);
      return { data: record as TData };
    },

    async update<TData extends BaseRecord = BaseRecord, TVariables = unknown>(params: UpdateParams<TVariables>): Promise<UpdateResult<TData>> {
      const record = await pb.collection(params.resource).update(String(params.id), params.variables as Record<string, unknown>);
      return { data: record as TData };
    },

    async deleteOne<TData extends BaseRecord = BaseRecord, TVariables = unknown>(params: DeleteParams<TVariables>): Promise<DeleteResult<TData>> {
      await pb.collection(params.resource).delete(String(params.id));
      return { data: { id: params.id } as unknown as TData };
    },

    async getMany<TData extends BaseRecord = BaseRecord>(params: GetManyParams): Promise<GetManyResult<TData>> {
      const filter = params.ids.map(id => `id = '${id}'`).join(' || ');
      const records = await pb.collection(params.resource).getFullList({ filter });
      return { data: records as TData[] };
    },

    async deleteMany<TData extends BaseRecord = BaseRecord, TVariables = unknown>(params: DeleteManyParams<TVariables>): Promise<DeleteManyResult<TData>> {
      const results: unknown[] = [];
      for (const id of params.ids) {
        await pb.collection(params.resource).delete(String(id));
        results.push({ id });
      }
      return { data: results as TData[] };
    },
  };
}
