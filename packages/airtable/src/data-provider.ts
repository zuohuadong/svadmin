import type {
  DataProvider, GetListParams, GetListResult, GetOneParams, GetOneResult,
  CreateParams, CreateResult, UpdateParams, UpdateResult, DeleteParams, DeleteResult,
  GetManyParams, GetManyResult, CustomParams, CustomResult, Sort, Filter
} from '@svadmin/core';

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

function generateFilterByFormula(filters?: Filter[]): string | undefined {
  if (!filters || filters.length === 0) return undefined;

  const formulas = filters.map(f => {
    if (!('field' in f)) return ''; // Skip logical filters for simplicity in this basic provider
    
    // Airtable formula syntax
    switch (f.operator) {
      case 'eq': return `{${f.field}} = '${f.value}'`;
      case 'ne': return `{${f.field}} != '${f.value}'`;
      case 'lt': return `{${f.field}} < ${Number(f.value)}`;
      case 'gt': return `{${f.field}} > ${Number(f.value)}`;
      case 'lte': return `{${f.field}} <= ${Number(f.value)}`;
      case 'gte': return `{${f.field}} >= ${Number(f.value)}`;
      case 'contains': return `FIND('${f.value}', {${f.field}})`;
      case 'null': return `{${f.field}} = BLANK()`;
      default: return `{${f.field}} = '${f.value}'`;
    }
  }).filter(Boolean);

  if (formulas.length === 0) return undefined;
  if (formulas.length === 1) return formulas[0];
  return `AND(${formulas.join(', ')})`;
}

export function createAirtableDataProvider(apiKey: string, baseId: string): DataProvider {
  const apiUrl = `https://api.airtable.com/v0/${baseId}`;

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  return {
    getApiUrl: () => apiUrl,

    async getList<T>({ resource, pagination, sorters, filters }: GetListParams): Promise<GetListResult<T>> {
      const url = new URL(`${apiUrl}/${resource}`);
      
      const { pageSize = 100 } = pagination ?? {};
      if (pageSize) url.searchParams.append('maxRecords', String(pageSize));

      const formula = generateFilterByFormula(filters);
      if (formula) url.searchParams.append('filterByFormula', formula);

      if (sorters && sorters.length > 0) {
        sorters.forEach((sort: Sort, index: number) => {
          url.searchParams.append(`sort[${index}][field]`, sort.field);
          url.searchParams.append(`sort[${index}][direction]`, sort.order);
        });
      }

      const response = await fetch(url.toString(), { headers });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();

      // Airtable doesn't return total count easily without offset matching, we can only return current length or a large number
      return {
        data: data.records.map((r: AirtableRecord) => ({ ...r.fields, id: r.id })) as T[],
        total: data.records.length,
      };
    },

    async getOne<T>({ resource, id }: GetOneParams): Promise<GetOneResult<T>> {
      const response = await fetch(`${apiUrl}/${resource}/${id}`, { headers });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      return { data: { ...data.fields, id: data.id } as T };
    },

    async create<T>({ resource, variables }: CreateParams): Promise<CreateResult<T>> {
      const response = await fetch(`${apiUrl}/${resource}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ records: [{ fields: variables }] }),
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      return { data: { ...data.records[0].fields, id: data.records[0].id } as T };
    },

    async update<T>({ resource, id, variables }: UpdateParams): Promise<UpdateResult<T>> {
      const response = await fetch(`${apiUrl}/${resource}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ records: [{ id, fields: variables }] }),
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      return { data: { ...data.records[0].fields, id: data.records[0].id } as T };
    },

    async deleteOne<T>({ resource, id }: DeleteParams): Promise<DeleteResult<T>> {
      const response = await fetch(`${apiUrl}/${resource}/${id}`, { method: 'DELETE', headers });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      return { data: { id: data.id } as T };
    },

    async getMany<T>({ resource, ids }: GetManyParams): Promise<GetManyResult<T>> {
      const url = new URL(`${apiUrl}/${resource}`);
      const formula = `OR(${ids.map((id: string | number) => `RECORD_ID()='${id}'`).join(',')})`;
      url.searchParams.append('filterByFormula', formula);

      const response = await fetch(url.toString(), { headers });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      return { data: data.records.map((r: AirtableRecord) => ({ ...r.fields, id: r.id })) as T[] };
    },

    async custom<T>({ url, method, payload, headers: customHeaders, query }: CustomParams): Promise<CustomResult<T>> {
      let requestUrl = url;
      if (query) {
        const params = new URLSearchParams();
        Object.entries(query).forEach(([k, v]) => params.append(k, String(v)));
        requestUrl = `${url}?${params.toString()}`;
      }

      const response = await fetch(requestUrl, {
        method: method.toUpperCase(),
        headers: { ...headers, ...customHeaders },
        body: payload ? JSON.stringify(payload) : undefined,
      });

      if (!response.ok) throw new Error(`Custom request failed: ${response.status}`);
      const data = await response.json();
      return { data: data as T };
    },
  };
}
