import { describe, it, expect, vi } from 'vitest';
import { useTable } from './table-hooks.svelte';
import { flushSync } from 'svelte';
import { QueryClient } from '@tanstack/svelte-query';

vi.mock('./context.svelte', () => ({
  useDataProvider: () => ({
    getList: vi.fn().mockResolvedValue({ data: [], total: 0 })
  }),
  useResource: () => ({ name: 'posts' }),
  getResource: (name: string) => ({ name, primaryKey: 'id' }),
  useRouterContext: () => ({ navigate: vi.fn(), url: '/', parsedParams: { current: 1, pageSize: 10 } }),
  useTranslate: () => (key: string) => key,
  getSyncWithLocation: () => false,
  useNotification: () => ({ open: vi.fn(), close: vi.fn() }),
  getLiveProvider: () => undefined
}));

vi.mock('@tanstack/svelte-query', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual as any,
    useQueryClient: () => new QueryClient(),
    createQuery: () => ({
      data: { data: [{ id: 1, title: 'Row' }], total: 1 },
      isPending: false,
      isFetching: false,
      error: null
    })
  };
});

describe('useTable - Headless Svelte 5 Compatibility', () => {

  it('binds useTable logic internally and updates pagination flawlessly via $state', () => {
    let table: ReturnType<typeof useTable>;

    const cleanup = $effect.root(() => {
        table = useTable({ resource: 'posts' });
    });

    flushSync();
    
    expect(table!.query).toBeDefined();
    expect(table!.query?.data?.data[0].title).toBe('Row');
    expect(table!.current).toBe(1);

    // Trigger mutable state 
    table!.setPage(2);
    
    flushSync();

    expect(table!.current).toBe(2);

    cleanup();
  });
});
