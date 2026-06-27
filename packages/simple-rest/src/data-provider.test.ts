import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { createSimpleRestDataProvider } from './data-provider';

const refineInit = mock((apiUrl: string) => ({
  apiUrl,
  getApiUrl() {
    return this.apiUrl;
  },
  getList: mock(async () => ({ data: [{ id: 1, title: 'First' }], total: 1 })),
  getOne: mock(async ({ id }: { id: string | number }) => ({ data: { id, title: 'First' } })),
  create: mock(async ({ variables }: { variables: Record<string, unknown> }) => ({ data: { id: 2, ...variables } })),
  update: mock(async ({ id, variables }: { id: string | number; variables: Record<string, unknown> }) => ({ data: { id, ...variables } })),
  deleteOne: mock(async ({ id }: { id: string | number }) => ({ data: { id } })),
  getMany: mock(async ({ ids }: { ids: Array<string | number> }) => ({ data: ids.map((id) => ({ id })) })),
  custom: mock(async () => ({ data: { ok: true } })),
}));

mock.module('@refinedev/simple-rest', () => ({
  default: refineInit,
}));

describe('createSimpleRestDataProvider', () => {
  beforeEach(() => {
    refineInit.mockClear();
  });

  test('creates a svadmin data provider from @refinedev/simple-rest', async () => {
    const provider = await createSimpleRestDataProvider('https://api.example.test');

    expect(refineInit).toHaveBeenCalledWith('https://api.example.test');
    expect(provider.getApiUrl()).toBe('https://api.example.test');
    await expect(provider.getList({ resource: 'posts' })).resolves.toEqual({
      data: [{ id: 1, title: 'First' }],
      total: 1,
    });
    await expect(provider.getOne({ resource: 'posts', id: 1 })).resolves.toEqual({
      data: { id: 1, title: 'First' },
    });
  });

  test('passes create, update, delete, bulk, and custom operations through the adapter', async () => {
    const provider = await createSimpleRestDataProvider('https://api.example.test');

    await expect(provider.create({ resource: 'posts', variables: { title: 'New' } })).resolves.toEqual({
      data: { id: 2, title: 'New' },
    });
    await expect(provider.update({ resource: 'posts', id: 2, variables: { title: 'Updated' } })).resolves.toEqual({
      data: { id: 2, title: 'Updated' },
    });
    await expect(provider.deleteOne({ resource: 'posts', id: 2 })).resolves.toEqual({
      data: { id: 2 },
    });
    await expect(provider.getMany?.({ resource: 'posts', ids: [1, 2] })).resolves.toEqual({
      data: [{ id: 1 }, { id: 2 }],
    });
    await expect(provider.custom?.({ url: '/health', method: 'get' })).resolves.toEqual({
      data: { ok: true },
    });
  });
});
