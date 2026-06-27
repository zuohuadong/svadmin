import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { createAirtableDataProvider } from './data-provider';

const refineInit = mock((...args: unknown[]) => ({
  apiUrl: String(args[0]),
  getApiUrl() {
    return this.apiUrl;
  },
  getList: mock(async ({ resource }: { resource: string }) => ({
    data: [{ id: 1, resource, source: 'airtable' }],
    total: 1,
  })),
  getOne: mock(async ({ id }: { id: string | number }) => ({ data: { id, source: 'airtable' } })),
  create: mock(async ({ variables }: { variables: Record<string, unknown> }) => ({ data: { id: 2, ...variables } })),
  update: mock(async ({ id, variables }: { id: string | number; variables: Record<string, unknown> }) => ({
    data: { id, ...variables },
  })),
  deleteOne: mock(async ({ id }: { id: string | number }) => ({ data: { id } })),
  getMany: mock(async ({ ids }: { ids: Array<string | number> }) => ({ data: ids.map((id) => ({ id })) })),
  custom: mock(async ({ url }: { url: string }) => ({ data: { url, ok: true } })),
}));

mock.module('@refinedev/airtable', () => ({
  dataProvider: refineInit,
}));

describe('createAirtableDataProvider', () => {
  beforeEach(() => {
    refineInit.mockClear();
  });

  test('creates a svadmin data provider from @refinedev/airtable', async () => {
    const provider = await createAirtableDataProvider('base-id', 'api-key');

    expect(refineInit).toHaveBeenCalledWith('base-id', 'api-key');
    expect(provider.getApiUrl()).toBe('base-id');
    await expect(provider.getList({ resource: 'products' })).resolves.toEqual({
      data: [{ id: 1, resource: 'products', source: 'airtable' }],
      total: 1,
    });
    await expect(provider.getOne({ resource: 'products', id: 'rec-1' })).resolves.toEqual({
      data: { id: 'rec-1', source: 'airtable' },
    });
  });

  test('passes optional operations through the refine adapter', async () => {
    const provider = await createAirtableDataProvider('base-id');

    await expect(provider.create({ resource: 'products', variables: { name: 'New' } })).resolves.toEqual({
      data: { id: 2, name: 'New' },
    });
    await expect(provider.update({ resource: 'products', id: 2, variables: { name: 'Updated' } })).resolves.toEqual({
      data: { id: 2, name: 'Updated' },
    });
    await expect(provider.deleteOne({ resource: 'products', id: 2 })).resolves.toEqual({ data: { id: 2 } });
    await expect(provider.getMany?.({ resource: 'products', ids: [1, 2] })).resolves.toEqual({
      data: [{ id: 1 }, { id: 2 }],
    });
    await expect(provider.custom?.({ url: '/health', method: 'get' })).resolves.toEqual({
      data: { url: '/health', ok: true },
    });
  });
});
