// @svadmin/appwrite — Appwrite DataProvider
// Maps svadmin CRUD operations to Appwrite SDK

import type {
  DataProvider, GetListParams, GetListResult, GetOneParams, GetOneResult,
  CreateParams, CreateResult, UpdateParams, UpdateResult, DeleteParams, DeleteResult,
  GetManyParams, GetManyResult, DeleteManyParams, DeleteManyResult, BaseRecord,
} from '@svadmin/core';

interface AppwriteProviderOptions {
  /** Appwrite Databases instance */
  databases: unknown; // Appwrite.Databases
  /** Database ID */
  databaseId: string;
}

// Duck-typed Appwrite SDK interfaces to avoid hard dependency
interface AppwriteDatabases {
  listDocuments: (dbId: string, collectionId: string, queries?: string[]) => Promise<{ documents: Record<string, unknown>[]; total: number }>;
  getDocument: (dbId: string, collectionId: string, docId: string) => Promise<Record<string, unknown>>;
  createDocument: (dbId: string, collectionId: string, docId: string, data: Record<string, unknown>) => Promise<Record<string, unknown>>;
  updateDocument: (dbId: string, collectionId: string, docId: string, data: Record<string, unknown>) => Promise<Record<string, unknown>>;
  deleteDocument: (dbId: string, collectionId: string, docId: string) => Promise<void>;
}

/**
 * Map svadmin CrudOperator to Appwrite Query string.
 * Uses Appwrite's query builder format: Query.equal('field', value)
 */
function mapFilter(field: string, operator: string, value: unknown): string | null {
  switch (operator) {
    case 'eq': return `equal("${field}", ${JSON.stringify(value)})`;
    case 'ne': return `notEqual("${field}", ${JSON.stringify(value)})`;
    case 'lt': return `lessThan("${field}", ${JSON.stringify(value)})`;
    case 'gt': return `greaterThan("${field}", ${JSON.stringify(value)})`;
    case 'lte': return `lessThanEqual("${field}", ${JSON.stringify(value)})`;
    case 'gte': return `greaterThanEqual("${field}", ${JSON.stringify(value)})`;
    case 'contains': return `search("${field}", ${JSON.stringify(value)})`;
    case 'in': return `equal("${field}", ${JSON.stringify(value)})`;
    case 'null': return `isNull("${field}")`;
    case 'nnull': return `isNotNull("${field}")`;
    case 'between': {
      const [min, max] = value as [unknown, unknown];
      return `between("${field}", ${JSON.stringify(min)}, ${JSON.stringify(max)})`;
    }
    default: return null;
  }
}

/**
 * Create a DataProvider backed by Appwrite.
 *
 * Usage:
 * ```ts
 * import { Databases, Client } from 'appwrite';
 * import { createAppwriteDataProvider } from '@svadmin/appwrite';
 *
 * const client = new Client().setEndpoint('https://cloud.appwrite.io/v1').setProject('PROJECT_ID');
 * const databases = new Databases(client);
 * const dataProvider = createAppwriteDataProvider({ databases, databaseId: 'main' });
 * ```
 */
export function createAppwriteDataProvider(options: AppwriteProviderOptions): DataProvider {
  const { databases, databaseId } = options;
  const db = databases as AppwriteDatabases;

  return {
    getApiUrl: () => 'appwrite',

    async getList<TData extends BaseRecord = BaseRecord>(params: GetListParams): Promise<GetListResult<TData>> {
      const { resource, pagination, sorters, filters } = params;
      const queries: string[] = [];

      if (pagination?.current && pagination?.pageSize) {
        const offset = (pagination.current - 1) * pagination.pageSize;
        queries.push(`limit(${pagination.pageSize})`);
        queries.push(`offset(${offset})`);
      }

      if (sorters?.length) {
        for (const sort of sorters) {
          queries.push(sort.order === 'asc'
            ? `orderAsc("${sort.field}")`
            : `orderDesc("${sort.field}")`
          );
        }
      }

      if (filters?.length) {
        for (const filter of filters) {
          const q = mapFilter(filter.field, filter.operator, filter.value);
          if (q) queries.push(q);
        }
      }

      const result = await db.listDocuments(databaseId, resource, queries);
      return {
        data: result.documents as TData[],
        total: result.total,
      };
    },

    async getOne<TData extends BaseRecord = BaseRecord>(params: GetOneParams): Promise<GetOneResult<TData>> {
      const doc = await db.getDocument(databaseId, params.resource, String(params.id));
      return { data: doc as TData };
    },

    async create<TData extends BaseRecord = BaseRecord, TVariables = unknown>(params: CreateParams<TVariables>): Promise<CreateResult<TData>> {
      const doc = await db.createDocument(databaseId, params.resource, 'unique()', params.variables as Record<string, unknown>);
      return { data: doc as TData };
    },

    async update<TData extends BaseRecord = BaseRecord, TVariables = unknown>(params: UpdateParams<TVariables>): Promise<UpdateResult<TData>> {
      const doc = await db.updateDocument(databaseId, params.resource, String(params.id), params.variables as Record<string, unknown>);
      return { data: doc as TData };
    },

    async deleteOne<TData extends BaseRecord = BaseRecord, TVariables = unknown>(params: DeleteParams<TVariables>): Promise<DeleteResult<TData>> {
      await db.deleteDocument(databaseId, params.resource, String(params.id));
      return { data: { id: params.id } as unknown as TData };
    },

    async getMany<TData extends BaseRecord = BaseRecord>(params: GetManyParams): Promise<GetManyResult<TData>> {
      const queries = [`equal("$id", ${JSON.stringify(params.ids.map(String))})`];
      const result = await db.listDocuments(databaseId, params.resource, queries);
      return { data: result.documents as TData[] };
    },

    async deleteMany<TData extends BaseRecord = BaseRecord, TVariables = unknown>(params: DeleteManyParams<TVariables>): Promise<DeleteManyResult<TData>> {
      const results: unknown[] = [];
      for (const id of params.ids) {
        await db.deleteDocument(databaseId, params.resource, String(id));
        results.push({ id });
      }
      return { data: results as TData[] };
    },
  };
}
