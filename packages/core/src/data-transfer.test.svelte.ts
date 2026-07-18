import { describe, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import { useExport } from './data-transfer.svelte';

const mocks = vi.hoisted(() => ({
  getList: vi.fn(),
}));

vi.mock('./context.svelte', () => ({
  captureAdminContext: () => ({
    getDataProviderForResource: () => ({ getList: mocks.getList }),
  }),
}));

vi.mock('./useParsed.svelte', () => ({
  useParsed: () => ({ resource: undefined }),
}));

describe('useExport', () => {
  it('propagates provider failures when no error handler is configured', async () => {
    mocks.getList.mockRejectedValueOnce(new Error('provider unavailable'));
    let exporter: ReturnType<typeof useExport> | undefined;
    const cleanup = $effect.root(() => {
      exporter = useExport({ resource: 'posts', download: false });
    });
    flushSync();

    await expect(exporter?.triggerExport()).rejects.toThrow('provider unavailable');

    cleanup();
  });

  it('reports provider failures through the configured error handler', async () => {
    mocks.getList.mockRejectedValueOnce('provider unavailable');
    const onError = vi.fn();
    let exporter: ReturnType<typeof useExport> | undefined;
    const cleanup = $effect.root(() => {
      exporter = useExport({ resource: 'posts', download: false, onError });
    });
    flushSync();

    await expect(exporter?.triggerExport()).resolves.toEqual([]);
    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0]?.[0]).toEqual(new Error('provider unavailable'));

    cleanup();
  });
});
