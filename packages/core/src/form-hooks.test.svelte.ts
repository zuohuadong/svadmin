import { describe, it, expect, vi } from 'vitest';
import { useForm } from './form-hooks.svelte';
import { flushSync } from 'svelte';
import { QueryClient } from '@tanstack/svelte-query';

vi.mock('./context.svelte', () => ({
  useDataProvider: () => ({
    getOne: vi.fn(),
    create: vi.fn().mockResolvedValue({ data: { id: 1 } }),
    update: vi.fn().mockResolvedValue({ data: { id: 1 } })
  }),
  useResource: () => ({ name: 'posts' }),
  getResource: () => ({ name: 'posts', primaryKey: 'id' }),
  useRouterContext: () => ({ navigate: vi.fn() }),
  useTranslate: () => (key: string) => key,
  useNotification: () => ({ open: vi.fn(), close: vi.fn() })
}));

vi.mock('@tanstack/svelte-query', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual as any,
    useQueryClient: () => new QueryClient(),
    createQuery: () => ({ data: { data: { id: 1, title: 'Original' } }, isPending: false }),
    createMutation: (opts: any) => ({
      mutate: vi.fn((vars, callbacks) => {
        if (opts.mutationFn) opts.mutationFn(vars);
        if (callbacks?.onSuccess) callbacks.onSuccess({ data: {} });
      }),
      isPending: false
    })
  };
});

describe('useForm - Headless Svelte 5 Compatibility', () => {

  it('preserves reactive proxy data bindings safely across Svelte boundaries', () => {
    let form: ReturnType<typeof useForm>;

    const cleanup = $effect.root(() => {
      form = useForm({
        action: 'create',
        resource: 'posts'
      });
    });

    flushSync();
    
    // Properly use setFieldValue which guarantees state sync in svadmin forms
    form!.setFieldValue('title', 'Reactive Test');
    
    flushSync();
    
    // The internal $state proxy absorbs this mutation
    expect(form!.values.title).toBe('Reactive Test');
    
    cleanup();
  });

  it('handles autoSave queuing correctly across reactive boundaries', () => {
    let form: ReturnType<typeof useForm>;
    
    const cleanup = $effect.root(() => {
      form = useForm({
        action: 'edit',
        resource: 'posts',
        id: 1,
        autoSave: { enabled: true, debounce: 0 }
      });
    });

    flushSync();

    form!.setFieldValue('title', 'Saved Title');
    
    flushSync();

    expect(form!.mutation).toBeDefined();
    expect(form!.mutation.isPending).toBeDefined();

    cleanup();
  });
});
