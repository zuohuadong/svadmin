import type {
  DataProvider, GetListParams, GetListResult, GetOneParams, GetOneResult,
  CreateParams, CreateResult, UpdateParams, UpdateResult, DeleteParams, DeleteResult,
  GetManyParams, GetManyResult, CustomParams, CustomResult, Filter
} from '@svadmin/core';

interface FirestoreFieldValue {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  timestampValue?: string;
  nullValue?: null;
  mapValue?: unknown;
  arrayValue?: { values?: unknown[] };
}

interface FirestoreDoc {
  name?: string;
  fields?: Record<string, FirestoreFieldValue>;
}

// Firebase REST API (Firestore REST v1)
function buildFirestoreUrl(projectId: string, collection: string, docId?: string | number): string {
  const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}`;
  return docId ? `${base}/${docId}` : base;
}

function parseFirestoreDoc(doc: FirestoreDoc): Record<string, unknown> {
  const fields = doc.fields ?? {};
  const parsed: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(fields) as [string, FirestoreFieldValue][]) {
    if ('stringValue' in val) parsed[key] = val.stringValue;
    else if ('integerValue' in val) parsed[key] = Number(val.integerValue);
    else if ('doubleValue' in val) parsed[key] = val.doubleValue;
    else if ('booleanValue' in val) parsed[key] = val.booleanValue;
    else if ('timestampValue' in val) parsed[key] = val.timestampValue;
    else if ('nullValue' in val) parsed[key] = null;
    else if ('mapValue' in val) parsed[key] = val.mapValue;
    else if ('arrayValue' in val) parsed[key] = val.arrayValue?.values ?? [];
    else parsed[key] = val;
  }
  // Extract document ID from name path
  const nameParts = (doc.name ?? '').split('/');
  parsed['id'] = nameParts[nameParts.length - 1];
  return parsed;
}

function toFirestoreFields(data: Record<string, unknown>): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (key === 'id') continue;
    if (typeof val === 'string') fields[key] = { stringValue: val };
    else if (typeof val === 'number') fields[key] = Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
    else if (typeof val === 'boolean') fields[key] = { booleanValue: val };
    else if (val === null) fields[key] = { nullValue: null };
    else if (Array.isArray(val)) fields[key] = { arrayValue: { values: val } };
    else if (typeof val === 'object') fields[key] = { mapValue: { fields: toFirestoreFields(val as Record<string, unknown>) } };
  }
  return fields;
}

export function createFirebaseDataProvider(projectId: string, apiKey: string): DataProvider {
  const authHeaders = { 'Content-Type': 'application/json' };

  return {
    getApiUrl: () => `https://firestore.googleapis.com/v1/projects/${projectId}`,

    async getList<T>({ resource, pagination }: GetListParams): Promise<GetListResult<T>> {
      const { pageSize = 20 } = pagination ?? {};
      const url = `${buildFirestoreUrl(projectId, resource)}?pageSize=${pageSize}&key=${apiKey}`;
      const res = await fetch(url, { headers: authHeaders });
      if (!res.ok) throw new Error(`Firebase error: ${res.status}`);
      const data = await res.json();
      const docs = (data.documents ?? []).map(parseFirestoreDoc);
      return { data: docs as T[], total: docs.length };
    },

    async getOne<T>({ resource, id }: GetOneParams): Promise<GetOneResult<T>> {
      const res = await fetch(`${buildFirestoreUrl(projectId, resource, id)}?key=${apiKey}`, { headers: authHeaders });
      if (!res.ok) throw new Error(`Firebase error: ${res.status}`);
      return { data: parseFirestoreDoc(await res.json()) as T };
    },

    async create<T>({ resource, variables }: CreateParams): Promise<CreateResult<T>> {
      const res = await fetch(`${buildFirestoreUrl(projectId, resource)}?key=${apiKey}`, {
        method: 'POST', headers: authHeaders, body: JSON.stringify({ fields: toFirestoreFields(variables as Record<string, unknown>) }),
      });
      if (!res.ok) throw new Error(`Firebase error: ${res.status}`);
      return { data: parseFirestoreDoc(await res.json()) as T };
    },

    async update<T>({ resource, id, variables }: UpdateParams): Promise<UpdateResult<T>> {
      const res = await fetch(`${buildFirestoreUrl(projectId, resource, id)}?key=${apiKey}`, {
        method: 'PATCH', headers: authHeaders, body: JSON.stringify({ fields: toFirestoreFields(variables as Record<string, unknown>) }),
      });
      if (!res.ok) throw new Error(`Firebase error: ${res.status}`);
      return { data: parseFirestoreDoc(await res.json()) as T };
    },

    async deleteOne<T>({ resource, id }: DeleteParams): Promise<DeleteResult<T>> {
      const res = await fetch(`${buildFirestoreUrl(projectId, resource, id)}?key=${apiKey}`, { method: 'DELETE', headers: authHeaders });
      if (!res.ok) throw new Error(`Firebase error: ${res.status}`);
      return { data: { id } as T };
    },

    async getMany<T>({ resource, ids }: GetManyParams): Promise<GetManyResult<T>> {
      const results = await Promise.all(ids.map(async (id: string | number) => {
        const res = await fetch(`${buildFirestoreUrl(projectId, resource, id)}?key=${apiKey}`, { headers: authHeaders });
        if (!res.ok) throw new Error(`Firebase error: ${res.status}`);
        return parseFirestoreDoc(await res.json()) as T;
      }));
      return { data: results };
    },

    async custom<T>({ url, method, payload, headers: h }: CustomParams): Promise<CustomResult<T>> {
      const res = await fetch(url, { method: method.toUpperCase(), headers: { ...authHeaders, ...h }, body: payload ? JSON.stringify(payload) : undefined });
      if (!res.ok) throw new Error(`Custom request failed: ${res.status}`);
      return { data: (await res.json()) as T };
    },
  };
}
