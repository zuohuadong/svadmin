import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getUnsavedChanges,
  initUnsavedChangesNotifier,
  resetUnsavedChanges,
  setUnsavedChanges,
} from './unsaved-changes.svelte';

const mocks = vi.hoisted(() => ({
  syncGlobalPath: vi.fn(),
}));

vi.mock('./i18n.svelte', () => ({
  t: () => 'You have unsaved changes. Leave anyway?',
  useTranslation: () => ({
    t: () => 'You have unsaved changes. Leave anyway?',
  }),
}));

vi.mock('./useParsed.svelte', () => ({
  syncGlobalPath: mocks.syncGlobalPath,
}));

describe('unsaved changes notifier', () => {
  beforeEach(() => {
    resetUnsavedChanges();
    mocks.syncGlobalPath.mockReset();
  });

  afterEach(() => {
    resetUnsavedChanges();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('blocks beforeNavigate while dirty and clears dirty state after confirmation', () => {
    let navigationCallback: ((navigation: { cancel: () => void }) => void) | undefined;
    const cancel = vi.fn();
    const confirm = vi.fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    vi.stubGlobal('confirm', confirm);

    initUnsavedChangesNotifier({
      beforeNavigate(callback) {
        navigationCallback = callback;
      },
    });
    setUnsavedChanges(true);

    navigationCallback?.({ cancel });
    expect(cancel).toHaveBeenCalledOnce();
    expect(getUnsavedChanges()).toBe(true);

    navigationCallback?.({ cancel });
    expect(cancel).toHaveBeenCalledOnce();
    expect(getUnsavedChanges()).toBe(false);
  });

  it('restores the previous hash when dirty navigation is rejected', () => {
    const confirm = vi.fn(() => false);
    const replaceState = vi.spyOn(history, 'replaceState');
    vi.stubGlobal('confirm', confirm);
    initUnsavedChangesNotifier();
    setUnsavedChanges(true);

    window.dispatchEvent(new HashChangeEvent('hashchange', {
      oldURL: 'https://example.test/#/posts',
      newURL: 'https://example.test/#/users',
    }));

    expect(replaceState).toHaveBeenCalledWith(null, '', '#/posts');
    expect(mocks.syncGlobalPath).toHaveBeenCalledOnce();
    expect(getUnsavedChanges()).toBe(true);
  });

  it('guards beforeunload only while dirty and removes listeners on reset', () => {
    const confirm = vi.fn(() => false);
    vi.stubGlobal('confirm', confirm);
    initUnsavedChangesNotifier();
    setUnsavedChanges(true);

    const dirtyEvent = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(dirtyEvent);
    expect(dirtyEvent.defaultPrevented).toBe(true);

    resetUnsavedChanges();
    setUnsavedChanges(true);
    const cleanEvent = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(cleanEvent);
    expect(cleanEvent.defaultPrevented).toBe(false);
  });

  it('does not expose the removed write-only navigation guard API', async () => {
    const notifierModule = await import('./unsaved-changes.svelte');

    expect(notifierModule).not.toHaveProperty('registerNavigationGuard');
  });
});
