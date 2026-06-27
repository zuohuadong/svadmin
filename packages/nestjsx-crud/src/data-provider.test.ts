import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { createNestjsxCrudDataProvider } from './data-provider';

const refineInit = mock((...args: unknown[]) => ({
  apiUrl: String(args[0]),
  getApiUrl() {
    return this.apiUrl;
  },
  getList: mock(async ({ resource }: { resource: string }) => ({
    data: [{ id: 1, resource, source: 'nestjsx-crud' }],
    total: 1,
  })),
  getOne: mock(async ({ id }: { id: string | number }) => ({ data: { id, source: 'nestjsx-crud' } })),
  create: mock(async ({ variables }: { variables: Record<string, unknown> }) => ({ data: { id: 2, ...variables } })),
  update: mock(async ({ id, variables }: { id: string | number; variables: Record<string, unknown> }) => ({
    data: { id, ...variables },
  })),
  deleteOne: mock(async ({ id }: { id: string | number }) => ({ data: { id } })),
  getMany: mock(async ({ ids }: { ids: Array<string | number> }) => ({ data: ids.map((id) => ({ id })) })),
  custom: mock(async ({ url }: { url: string }) => ({ data: { url, ok: true } })),
}));

mock.module('@refinedev/nestjsx-crud', () => ({
  DataProvider: refineInit,
}));

describe('createNestjsxCrudDataProvider', () => {
  beforeEach(() => {
    refineInit.mockClear();
  });

  test('creates a svadmin data provider from @refinedev/nestjsx-crud', async () => {
    const provider = await createNestjsxCrudDataProvider('https://api.example.test');

    expect(refineInit).toHaveBeenCalledWith('https://api.example.test');
    expect(provider.getApiUrl()).toBe('https://api.example.test');
    await expect(provider.getList({ resource: 'posts' })).resolves.toEqual({
      data: [{ id: 1, resource: 'posts', source: 'nestjsx-crud' }],
      total: 1,
    });
  });

  test('passes CRUD, bulk, and custom operations through the adapter', async () => {
    const provider = await createNestjsxCrudDataProvider('https://api.example.test');

    await expect(provider.getOne({ resource: 'posts', id: 1 })).resolves.toEqual({
      data: { id: 1, source: 'nestjsx-crud' },
    });
    await expect(provider.create({ resource: 'posts', variables: { title: 'New' } })).resolves.toEqual({
      data: { id: 2, title: 'New' },
    });
    await expect(provider.update({ resource: 'posts', id: 2, variables: { title: 'Updated' } })).resolves.toEqual({
      data: { id: 2, title: 'Updated' },
    });
    await expect(provider.deleteOne({ resource: 'posts', id: 2 })).resolves.toEqual({ data: { id: 2 } });
    await expect(provider.getMany?.({ resource: 'posts', ids: [1, 2] })).resolves.toEqual({
      data: [{ id: 1 }, { id: 2 }],
    });
    await expect(provider.custom?.({ url: '/health', method: 'get' })).resolves.toEqual({
      data: { url: '/health', ok: true },
    });
  });
});
