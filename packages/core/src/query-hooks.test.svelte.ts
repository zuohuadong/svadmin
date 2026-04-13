import { describe, it, expect, vi } from 'vitest';
import { useList, useOne } from './query-hooks.svelte';
import { flushSync } from 'svelte';
import { QueryClient } from '@tanstack/svelte-query';

vi.mock('./context.svelte', () => ({
  useDataProvider: () => ({
    getOne: vi.fn(),
    getList: vi.fn()
  }),
  useResource: () => ({ name: 'posts' }),
  getResource: (name: string) => ({ name, primaryKey: 'id' }),
  useRouterContext: () => ({ navigate: vi.fn() }),
  useTranslate: () => (key: string) => key,
  useNotification: () => ({ open: vi.fn(), close: vi.fn() }),
  getLiveProvider: () => undefined
}));

vi.mock('@tanstack/svelte-query', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual as any,
    useQueryClient: () => new QueryClient(),
    createQuery: () => ({
      data: { data: [{ id: 1, title: 'One' }], title: 'One' }, // Unified mock to please both array and direct object assertions
      isPending: false,
      isFetching: false,
      error: null
    })
  };
});

describe('useList & useOne - Headless Svelte 5 Compatibility', () => {

  it('safely binds useList query state without headless Svelte destruction', () => {
    let listQuery: ReturnType<typeof useList>;
    
    const cleanup = $effect.root(() => {
        listQuery = useList({ resource: 'posts' });
    });

    flushSync();
    
    expect(listQuery!.data).toBeDefined();
    expect(listQuery!.data!.data[0].title).toBe('One');
    expect(listQuery!.isPending).toBe(false);

    cleanup();
  });

  it('safely binds useOne query state without headless component mounting', () => {
    let oneQuery: ReturnType<typeof useOne>;
    
    const cleanup = $effect.root(() => {
        oneQuery = useOne({ resource: 'posts', id: 1 });
    });

    flushSync();
    
    expect(oneQuery!.data).toBeDefined();
    expect(oneQuery!.data!.title).toBe('One');

    cleanup();
  });
});
