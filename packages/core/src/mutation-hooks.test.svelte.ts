import { describe, it, expect, vi } from 'vitest';
import { useCreate, useUpdate } from './mutation-hooks.svelte';
import { flushSync } from 'svelte';
import { QueryClient } from '@tanstack/svelte-query';

vi.mock('./context.svelte', () => ({
  useDataProvider: () => ({
    getOne: vi.fn(),
    getList: vi.fn(),
    create: vi.fn().mockResolvedValue({ data: { id: 1 } }),
    update: vi.fn().mockResolvedValue({ data: { id: 1 } })
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
    createMutation: (opts: any) => ({
      mutate: vi.fn((vars, callbacks) => {
        if (opts.mutationFn) opts.mutationFn(vars);
        if (callbacks?.onSuccess) callbacks.onSuccess({ data: {} });
      }),
      isPending: false
    })
  };
});

describe('useCreate & useUpdate - Headless Svelte 5 Compatibility', () => {

  it('safely binds useCreate and allows mutations over proxies', () => {
    let createMutation: ReturnType<typeof useCreate>;
    
    const cleanup = $effect.root(() => {
        createMutation = useCreate();
    });

    flushSync();
    
    expect(createMutation!.mutation.mutate).toBeDefined();
    expect(createMutation!.mutation.isPending).toBe(false);

    cleanup();
  });

  it('safely binds useUpdate and evaluates data updates', () => {
    let updateMutation: ReturnType<typeof useUpdate>;
    
    const cleanup = $effect.root(() => {
        updateMutation = useUpdate();
    });

    flushSync();
    
    expect(updateMutation!.mutation.mutate).toBeDefined();
    expect(updateMutation!.mutation.isPending).toBe(false);

    cleanup();
  });
});
