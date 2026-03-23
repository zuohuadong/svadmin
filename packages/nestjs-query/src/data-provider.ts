import type {
  DataProvider, GetListParams, GetListResult, GetOneParams, GetOneResult,
  CreateParams, CreateResult, UpdateParams, UpdateResult, DeleteParams, DeleteResult,
  GetManyParams, GetManyResult, CustomParams, CustomResult, Sort, Filter
} from '@svadmin/core';

// Nestjs-query uses GraphQL with auto-generated queries
function mapOperator(op: string): string {
  const map: Record<string, string> = {
    eq: 'eq', ne: 'neq', lt: 'lt', gt: 'gt', lte: 'lte', gte: 'gte',
    contains: 'like', in: 'in', null: 'is',
  };
  return map[op] ?? 'eq';
}

function buildFilter(filters?: Filter[]): Record<string, unknown> {
  if (!filters?.length) return {};
  const where: Record<string, unknown> = {};
  for (const f of filters) {
    if ('field' in f) {
      where[f.field as string] = { [mapOperator(f.operator as string)]: f.operator === 'contains' ? `%${f.value}%` : f.value };
    }
  }
  return where;
}

function buildSorting(sorters?: Sort[]): Array<{ field: string; direction: string }> {
  return (sorters ?? []).map((s: Sort) => ({ field: s.field, direction: s.order === 'asc' ? 'ASC' : 'DESC' }));
}

async function gql(endpoint: string, query: string, variables: Record<string, unknown> = {}, headers: Record<string, string> = {}) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error((json.errors as Array<{ message: string }>).map((e) => e.message).join('\n'));
  return json.data;
}

export function createNestjsQueryDataProvider(endpoint: string, headers: Record<string, string> = {}): DataProvider {
  return {
    getApiUrl: () => endpoint,

    async getList<T>({ resource, pagination, sorters, filters, meta }: GetListParams): Promise<GetListResult<T>> {
      const { current = 1, pageSize = 10 } = pagination ?? {};
      const fields = (meta?.fields as string[])?.join('\n') || 'id';
      const query = `query($paging: CursorPaging, $filter: ${resource}Filter, $sorting: [${resource}Sort!]) {
        ${resource}(paging: $paging, filter: $filter, sorting: $sorting) {
          totalCount
          nodes { ${fields} }
        }
      }`;
      const data = await gql(endpoint, query, {
        paging: { first: pageSize, offset: (current - 1) * pageSize },
        filter: buildFilter(filters),
        sorting: buildSorting(sorters),
      }, headers);
      return { data: data[resource]?.nodes ?? [], total: data[resource]?.totalCount ?? 0 };
    },

    async getOne<T>({ resource, id, meta }: GetOneParams): Promise<GetOneResult<T>> {
      const fields = (meta?.fields as string[])?.join('\n') || 'id';
      const singular = resource.replace(/s$/, '');
      const query = `query($id: ID!) { ${singular}(id: $id) { ${fields} } }`;
      const data = await gql(endpoint, query, { id }, headers);
      return { data: data[singular] as T };
    },

    async create<T>({ resource, variables, meta }: CreateParams): Promise<CreateResult<T>> {
      const fields = (meta?.fields as string[])?.join('\n') || 'id';
      const singular = resource.replace(/s$/, '');
      const query = `mutation($input: CreateOne${singular}Input!) { createOne${singular}(input: $input) { ${fields} } }`;
      const data = await gql(endpoint, query, { input: { [singular.toLowerCase()]: variables } }, headers);
      return { data: data[`createOne${singular}`] as T };
    },

    async update<T>({ resource, id, variables, meta }: UpdateParams): Promise<UpdateResult<T>> {
      const fields = (meta?.fields as string[])?.join('\n') || 'id';
      const singular = resource.replace(/s$/, '');
      const query = `mutation($input: UpdateOne${singular}Input!) { updateOne${singular}(input: $input) { ${fields} } }`;
      const data = await gql(endpoint, query, { input: { id, update: variables } }, headers);
      return { data: data[`updateOne${singular}`] as T };
    },

    async deleteOne<T>({ resource, id, meta }: DeleteParams): Promise<DeleteResult<T>> {
      const fields = (meta?.fields as string[])?.join('\n') || 'id';
      const singular = resource.replace(/s$/, '');
      const query = `mutation($input: DeleteOne${singular}Input!) { deleteOne${singular}(input: $input) { ${fields} } }`;
      const data = await gql(endpoint, query, { input: { id } }, headers);
      return { data: data[`deleteOne${singular}`] as T };
    },

    async getMany<T>({ resource, ids, meta }: GetManyParams): Promise<GetManyResult<T>> {
      const fields = (meta?.fields as string[])?.join('\n') || 'id';
      const query = `query($filter: ${resource}Filter) { ${resource}(filter: $filter) { nodes { ${fields} } } }`;
      const data = await gql(endpoint, query, { filter: { id: { in: ids } } }, headers);
      return { data: data[resource]?.nodes ?? [] };
    },

    async custom<T>({ url, method, payload, headers: h }: CustomParams): Promise<CustomResult<T>> {
      const res = await fetch(url, { method: method.toUpperCase(), headers: { 'Content-Type': 'application/json', ...headers, ...h }, body: payload ? JSON.stringify(payload) : undefined });
      if (!res.ok) throw new Error(`Custom request failed: ${res.status}`);
      return { data: (await res.json()) as T };
    },
  };
}
