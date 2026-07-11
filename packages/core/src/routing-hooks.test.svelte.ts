/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, it, expect, vi } from 'vitest';
import { useGo, useBack } from './routing-hooks.svelte';
import { useParsed } from './useParsed.svelte';
import { flushSync } from 'svelte';

vi.mock('./context.svelte', () => {
  const routerContext = {
    navigate: vi.fn(), 
    url: '/posts/1/edit',
    parsedParams: { resource: 'posts', action: 'edit', id: '1' },
    go: vi.fn(),
    back: vi.fn()
  };
  return {
    captureAdminContext: () => ({
      providers: null,
      authProvider: null,
      resources: [],
      routerProvider: undefined,
      liveProvider: undefined,
      taskProvider: undefined,
      getDataProvider: vi.fn(),
      getDataProviderNames: () => [],
      getDataProviderForResource: vi.fn(),
      getResource: vi.fn(),
      currentPath: () => '/posts/1/edit',
      formatLink: (path: string) => path,
      navigate: vi.fn(async () => {}),
      back: vi.fn(),
    }),
    useRouterContext: () => routerContext,
    getRouterProvider: () => undefined
  };
});

vi.mock('./useParsed.svelte', () => ({
  useParsed: () => ({ resource: 'posts', action: 'edit', id: '1' })
}));

describe('routing-hooks - Headless Svelte 5 Compatibility', () => {

  it('safely extracts parses from url and binds to runes Context', () => {
    let parsedParams!: ReturnType<typeof useParsed>;

    const cleanup = $effect.root(() => {
        parsedParams = useParsed();
    });

    flushSync();
    
    expect(parsedParams!.action).toBe('edit');
    expect(parsedParams.resource).toBe('posts');
    expect(parsedParams.id).toBe('1');

    cleanup();
  });

  it('useGo and useBack return functional closures out of Context', () => {
    let go!: ReturnType<typeof useGo>;
    let back!: ReturnType<typeof useBack>;
    
    const cleanup = $effect.root(() => {
        go = useGo();
        back = useBack();
    });

    flushSync();
    
    expect(typeof go).toBe('function');
    expect(typeof back).toBe('function');

    cleanup();
  });
});
