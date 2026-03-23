import type {
  DataProvider, GetListParams, GetListResult, GetOneParams, GetOneResult,
  CreateParams, CreateResult, UpdateParams, UpdateResult, DeleteParams, DeleteResult,
  GetManyParams, GetManyResult, CustomParams, CustomResult
} from '@svadmin/core';

// Sanity.io uses GROQ query language
function buildGroqFilter(filters?: any[]): string {
  if (!filters?.length) return '';
  return filters
    .filter((f: any) => 'field' in f)
    .map((f: any) => {
      switch (f.operator) {
        case 'eq': return `${f.field} == "${f.value}"`;
        case 'ne': return `${f.field} != "${f.value}"`;
        case 'lt': return `${f.field} < ${f.value}`;
        case 'gt': return `${f.field} > ${f.value}`;
        case 'contains': return `${f.field} match "*${f.value}*"`;
        case 'in': return `${f.field} in [${(f.value as string[]).map((v: string) => `"${v}"`).join(',')}]`;
        default: return `${f.field} == "${f.value}"`;
      }
    })
    .join(' && ');
}

export function createSanityDataProvider(projectId: string, dataset: string, token?: string, apiVersion = '2023-05-03'): DataProvider {
  const apiUrl = `https://${projectId}.api.sanity.io/v${apiVersion}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  async function query(groq: string, params: Record<string, unknown> = {}): Promise<any> {
    const url = new URL(`${apiUrl}/data/query/${dataset}`);
    url.searchParams.set('query', groq);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(`$${k}`, JSON.stringify(v));
    const res = await fetch(url.toString(), { headers });
    if (!res.ok) throw new Error(`Sanity error: ${res.status}`);
    const data = await res.json();
    return data.result;
  }

  async function mutate(mutations: any[]): Promise<any> {
    const res = await fetch(`${apiUrl}/data/mutate/${dataset}`, {
      method: 'POST', headers, body: JSON.stringify({ mutations }),
    });
    if (!res.ok) throw new Error(`Sanity mutation error: ${res.status}`);
    return res.json();
  }

  return {
    getApiUrl: () => apiUrl,

    async getList<T>({ resource, pagination, sorters, filters }: GetListParams): Promise<GetListResult<T>> {
      const { current = 1, pageSize = 10 } = pagination ?? {};
      const start = (current - 1) * pageSize;
      const end = start + pageSize;
      const filterStr = buildGroqFilter(filters);
      const typeFilter = `_type == "${resource}"`;
      const where = filterStr ? `${typeFilter} && ${filterStr}` : typeFilter;
      const orderStr = sorters?.length ? ` | order(${sorters.map(s => `${s.field} ${s.order}`).join(', ')})` : '';

      const [data, total] = await Promise.all([
        query(`*[${where}]${orderStr}[${start}...${end}]`),
        query(`count(*[${where}])`),
      ]);
      return { data: (data ?? []).map((d: any) => ({ ...d, id: d._id })) as T[], total: total ?? 0 };
    },

    async getOne<T>({ resource, id }: GetOneParams): Promise<GetOneResult<T>> {
      const data = await query(`*[_type == "${resource}" && _id == $id][0]`, { id });
      return { data: { ...data, id: data._id } as T };
    },

    async create<T>({ resource, variables }: CreateParams): Promise<CreateResult<T>> {
      const doc = { _type: resource, ...variables };
      const result = await mutate([{ create: doc }]);
      const id = result.results?.[0]?.id;
      return { data: { ...variables, id, _id: id } as T };
    },

    async update<T>({ resource, id, variables }: UpdateParams): Promise<UpdateResult<T>> {
      await mutate([{ patch: { id, set: variables } }]);
      return { data: { ...variables, id, _id: id } as T };
    },

    async deleteOne<T>({ resource, id }: DeleteParams): Promise<DeleteResult<T>> {
      await mutate([{ delete: { id } }]);
      return { data: { id } as T };
    },

    async getMany<T>({ resource, ids }: GetManyParams): Promise<GetManyResult<T>> {
      const data = await query(`*[_type == "${resource}" && _id in $ids]`, { ids });
      return { data: (data ?? []).map((d: any) => ({ ...d, id: d._id })) as T[] };
    },

    async custom<T>({ url, method, payload, headers: h }: CustomParams): Promise<CustomResult<T>> {
      const res = await fetch(url, { method: method.toUpperCase(), headers: { ...headers, ...h }, body: payload ? JSON.stringify(payload) : undefined });
      if (!res.ok) throw new Error(`Custom request failed: ${res.status}`);
      return { data: (await res.json()) as T };
    },
  };
}
