/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { useCreate, useUpdate, invalidateByScopes } from './mutation-hooks.svelte';
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
describe('mutation-hooks', () => {

  describe('invalidateByScopes - Multi-Provider Cache Isolation', () => {
    it('filters perfectly by dataProviderName when passed', () => {
      const queryClient = new QueryClient();
      queryClient.invalidateQueries = vi.fn(async () => {});

      const resource = 'posts';
      const providerName = 'secondaryProvider';
      
      // Act
      invalidateByScopes(queryClient, resource, ['list'], ['list'], undefined, providerName);
      
      expect(queryClient.invalidateQueries).toHaveBeenCalled();
      
      // Assert predicate captures DataProvider scopes
      const calls = (queryClient.invalidateQueries as ReturnType<typeof vi.fn>).mock.calls;
      
      // Using arbitrary mock objects simulating Query keys
      const predicateFn = calls[0][0].predicate;
      
      const shouldPass = predicateFn({ queryKey: ['secondaryProvider', 'posts', 'list'] });
      const shouldFail = predicateFn({ queryKey: ['default', 'posts', 'list'] });
      const shouldFailResource = predicateFn({ queryKey: ['secondaryProvider', 'users', 'list'] });

      expect(shouldPass).toBe(true);
      expect(shouldFail).toBe(false);
      expect(shouldFailResource).toBe(false);
    });
    
    it('falls back to all providers when NO provider is specified', () => {
      const queryClient = new QueryClient();
      queryClient.invalidateQueries = vi.fn(async () => {});

      // Act without providerName
      invalidateByScopes(queryClient, 'posts', ['list'], ['list']);
      
      const predicateFn = (queryClient.invalidateQueries as ReturnType<typeof vi.fn>).mock.calls[0][0].predicate;
      
      const pass1 = predicateFn({ queryKey: ['default', 'posts', 'list'] });
      const pass2 = predicateFn({ queryKey: ['custom', 'posts', 'list'] });
      expect(pass1).toBe(true);
      expect(pass2).toBe(true);
    });
  });

});
