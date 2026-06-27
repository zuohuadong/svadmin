import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { createMedusaDataProvider } from './data-provider';

const refineInit = mock((...args: unknown[]) => ({
  apiUrl: String(args[0]),
  getApiUrl() {
    return this.apiUrl;
  },
  getList: mock(async ({ resource }: { resource: string }) => ({
    data: [{ id: 1, resource, source: 'medusa' }],
    total: 1,
  })),
  getOne: mock(async ({ id }: { id: string | number }) => ({ data: { id, source: 'medusa' } })),
  create: mock(async ({ variables }: { variables: Record<string, unknown> }) => ({ data: { id: 2, ...variables } })),
  update: mock(async ({ id, variables }: { id: string | number; variables: Record<string, unknown> }) => ({
    data: { id, ...variables },
  })),
  deleteOne: mock(async ({ id }: { id: string | number }) => ({ data: { id } })),
  getMany: mock(async ({ ids }: { ids: Array<string | number> }) => ({ data: ids.map((id) => ({ id })) })),
  custom: mock(async ({ url }: { url: string }) => ({ data: { url, ok: true } })),
}));

mock.module('@refinedev/medusa', () => ({
  dataProvider: refineInit,
}));

describe('createMedusaDataProvider', () => {
  beforeEach(() => {
    refineInit.mockClear();
  });

  test('creates a svadmin data provider from @refinedev/medusa', async () => {
    const provider = await createMedusaDataProvider('https://api.example.test');

    expect(refineInit).toHaveBeenCalledWith('https://api.example.test');
    expect(provider.getApiUrl()).toBe('https://api.example.test');
    await expect(provider.getList({ resource: 'products' })).resolves.toEqual({
      data: [{ id: 1, resource: 'products', source: 'medusa' }],
      total: 1,
    });
  });

  test('passes CRUD, bulk, and custom operations through the adapter', async () => {
    const provider = await createMedusaDataProvider('https://api.example.test');

    await expect(provider.getOne({ resource: 'products', id: 1 })).resolves.toEqual({
      data: { id: 1, source: 'medusa' },
    });
    await expect(provider.create({ resource: 'products', variables: { title: 'New' } })).resolves.toEqual({
      data: { id: 2, title: 'New' },
    });
    await expect(provider.update({ resource: 'products', id: 2, variables: { title: 'Updated' } })).resolves.toEqual({
      data: { id: 2, title: 'Updated' },
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
