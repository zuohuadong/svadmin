import type {
  DataProvider, GetListParams, GetListResult, GetOneParams, GetOneResult,
  CreateParams, CreateResult, UpdateParams, UpdateResult, DeleteParams, DeleteResult,
  GetManyParams, GetManyResult, CustomParams, CustomResult, Sort, Filter
} from '@svadmin/core';

// Maps core filter operators to Hasura GraphQL query operators
function mapOperator(operator: string): string {
  switch (operator) {
    case 'eq': return '_eq';
    case 'ne': return '_neq';
    case 'lt': return '_lt';
    case 'gt': return '_gt';
    case 'lte': return '_lte';
    case 'gte': return '_gte';
    case 'contains': return '_ilike';
    case 'in': return '_in';
    case 'null': return '_is_null';
    default: return '_eq';
  }
}

// Minimal GraphQL Executor
async function executeGraphQL(endpoint: string, query: string, variables: Record<string, unknown> = {}, headers: Record<string, string> = {}): Promise<Record<string, unknown>> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ query, variables }),
  });
  const json = await response.json();
  if (json.errors) {
    throw new Error((json.errors as Array<{ message: string }>).map((e) => e.message).join('\n'));
  }
  return json.data;
}

export function createHasuraDataProvider(endpoint: string, defaultHeaders: Record<string, string> = {}): DataProvider {
  return {
    getApiUrl: () => endpoint,

    async getList<T>({ resource, pagination, sorters, filters, meta }: GetListParams): Promise<GetListResult<T>> {
      const { current = 1, pageSize = 10, mode } = pagination ?? {};
      const offset = mode === 'server' ? (current - 1) * pageSize : 0;
      const limit = mode === 'server' ? pageSize : undefined;

      // Simplistic AST builder for demonstration. In production, 'graphql-request' or gql AST tools should be used.
      const variables: Record<string, unknown> = { limit, offset };
      
      let whereClause = '';
      if (filters && filters.length > 0) {
        const clauses = filters.filter((f): f is Filter & { field: string; operator: string; value: unknown } => 'field' in f).map((f, i: number) => {
          variables[`f${i}`] = f.operator === 'contains' ? `%${f.value}%` : f.value;
          return `${f.field}: { ${mapOperator(f.operator)}: $f${i} }`;
        });
        whereClause = clauses.length ? `where: { ${clauses.join(', ')} },` : '';
      }

      let orderByClause = '';
      if (sorters && sorters.length > 0) {
        const orders = sorters.map((s: Sort) => `${s.field}: ${s.order}`);
        orderByClause = `order_by: { ${orders.join(', ')} },`;
      }

      const fields = (meta?.fields as string[])?.join(' ') || 'id';

      const query = `
        query getList($limit: Int, $offset: Int, ${Object.keys(variables).filter(k => k.startsWith('f')).map(k => `$${k}: String`).join(', ')}) {
          ${resource}(limit: $limit, offset: $offset, ${whereClause} ${orderByClause}) {
            ${fields}
          }
          ${resource}_aggregate {
            aggregate { count }
          }
        }
      `;

      const data = await executeGraphQL(endpoint, query, variables, defaultHeaders);
      const resourceData = data[resource] as T[] | undefined;
      const aggregateData = data[`${resource}_aggregate`] as { aggregate?: { count?: number } } | undefined;
      return {
        data: resourceData || [],
        total: aggregateData?.aggregate?.count || 0,
      };
    },

    async getOne<T>({ resource, id, meta }: GetOneParams): Promise<GetOneResult<T>> {
      const fields = (meta?.fields as string[])?.join(' ') || 'id';
      const query = `
        query getOne($id: uuid!) {
          ${resource}_by_pk(id: $id) {
            ${fields}
          }
        }
      `;
      const data = await executeGraphQL(endpoint, query, { id }, defaultHeaders);
      return { data: data[`${resource}_by_pk`] as T };
    },

    async create<T>({ resource, variables, meta }: CreateParams): Promise<CreateResult<T>> {
      const fields = (meta?.fields as string[])?.join(' ') || 'id';
      const query = `
        mutation create($object: ${resource}_insert_input!) {
          insert_${resource}_one(object: $object) {
            ${fields}
          }
        }
      `;
      const data = await executeGraphQL(endpoint, query, { object: variables }, defaultHeaders);
      return { data: data[`insert_${resource}_one`] as T };
    },

    async update<T>({ resource, id, variables, meta }: UpdateParams): Promise<UpdateResult<T>> {
      const fields = (meta?.fields as string[])?.join(' ') || 'id';
      const query = `
        mutation update($id: uuid!, $set: ${resource}_set_input!) {
          update_${resource}_by_pk(pk_columns: {id: $id}, _set: $set) {
            ${fields}
          }
        }
      `;
      const data = await executeGraphQL(endpoint, query, { id, set: variables }, defaultHeaders);
      return { data: data[`update_${resource}_by_pk`] as T };
    },

    async deleteOne<T>({ resource, id, meta }: DeleteParams): Promise<DeleteResult<T>> {
      const fields = (meta?.fields as string[])?.join(' ') || 'id';
      const query = `
        mutation deleteOne($id: uuid!) {
          delete_${resource}_by_pk(id: $id) {
            ${fields}
          }
        }
      `;
      const data = await executeGraphQL(endpoint, query, { id }, defaultHeaders);
      return { data: data[`delete_${resource}_by_pk`] as T };
    },

    async getMany<T>({ resource, ids, meta }: GetManyParams): Promise<GetManyResult<T>> {
      const fields = (meta?.fields as string[])?.join(' ') || 'id';
      const query = `
        query getMany($ids: [uuid!]!) {
          ${resource}(where: {id: {_in: $ids}}) {
            ${fields}
          }
        }
      `;
      const data = await executeGraphQL(endpoint, query, { ids }, defaultHeaders);
      return { data: data[resource] || [] };
    },

    async custom<T>({ url, method, payload, headers }: CustomParams): Promise<CustomResult<T>> {
      // By default Hasura only understands GraphQL via POST, but arbitrary custom calls might be used for REST endpoints mapping.
      const response = await fetch(url, {
        method: method.toUpperCase(),
        headers: { 'Content-Type': 'application/json', ...defaultHeaders, ...headers },
        body: payload ? JSON.stringify(payload) : undefined,
      });
      if (!response.ok) throw new Error(`Custom request failed: ${response.status}`);
      const data = await response.json();
      return { data: data as T };
    },
  };
}
