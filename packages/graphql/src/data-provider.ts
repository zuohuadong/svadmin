import type {
  DataProvider, GetListParams, GetListResult, GetOneParams, GetOneResult,
  CreateParams, CreateResult, UpdateParams, UpdateResult, DeleteParams, DeleteResult,
  CustomParams, CustomResult,
} from '@svadmin/core';
import type { GraphQLClient, RequestDocument, Variables } from 'graphql-request';

export interface GraphQLDataProviderOptions {
  client: GraphQLClient;
}

/**
 * Creates a generic GraphQL DataProvider.
 * Requires queries to be passed in hooks via the `meta.query` property.
 */
export function createGraphQLDataProvider(options: GraphQLDataProviderOptions): DataProvider {
  const { client } = options;

  function getQuery(meta: Record<string, unknown> | undefined, operation: string, resource: string): RequestDocument {
    if (!meta?.query) {
      throw new Error(`[svadmin/graphql] ${operation} requires 'meta.query' for resource '${resource}'`);
    }
    return meta.query as RequestDocument;
  }

  function getMetaVars(meta: Record<string, unknown> | undefined): Record<string, unknown> {
    return (meta?.variables as Record<string, unknown>) || {};
  }

  return {
    getApiUrl: () => 'graphql',

    async getList<T>({ resource, pagination, meta }: GetListParams): Promise<GetListResult<T>> {
      const query = getQuery(meta, 'getList', resource);
      const variables: Variables = {
        ...getMetaVars(meta),
        limit: pagination?.pageSize,
        offset: pagination && pagination.current && pagination.pageSize
          ? (pagination.current - 1) * pagination.pageSize
          : undefined,
      };

      const response = await client.request<{ data: T[]; total?: number }>(query, variables);
      return {
        data: response.data || ([] as T[]),
        total: response.total || 0,
      };
    },

    async getOne<T>({ resource, id, meta }: GetOneParams): Promise<GetOneResult<T>> {
      const query = getQuery(meta, 'getOne', resource);
      const variables: Variables = { id, ...getMetaVars(meta) };
      const response = await client.request<{ data: T }>(query, variables);
      return { data: response.data };
    },

    async create<T>({ resource, variables, meta }: CreateParams): Promise<CreateResult<T>> {
      const query = getQuery(meta, 'create', resource);
      const allVars: Variables = { ...variables, ...getMetaVars(meta) };
      const response = await client.request<{ data: T }>(query, allVars);
      return { data: response.data };
    },

    async update<T>({ resource, id, variables, meta }: UpdateParams): Promise<UpdateResult<T>> {
      const query = getQuery(meta, 'update', resource);
      const allVars: Variables = { id, ...variables, ...getMetaVars(meta) };
      const response = await client.request<{ data: T }>(query, allVars);
      return { data: response.data };
    },

    async deleteOne<T>({ resource, id, meta }: DeleteParams): Promise<DeleteResult<T>> {
      const query = getQuery(meta, 'deleteOne', resource);
      const allVars: Variables = { id, ...getMetaVars(meta) };
      const response = await client.request<{ data: T }>(query, allVars);
      return { data: response.data };
    },

    async custom<T>({ meta, payload, headers }: CustomParams): Promise<CustomResult<T>> {
      if (!meta?.query) {
        throw new Error(`[svadmin/graphql] custom requires 'meta.query'`);
      }
      const query = meta.query as RequestDocument;
      const vars = payload as Variables | undefined;
      const reqHeaders = headers as Record<string, string> | undefined;
      const response = await client.request<T>(query, vars, reqHeaders);
      return { data: response };
    },
  };
}
