import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RouterProvider } from './router-provider';
import {
  afterEach as registerAfterEach,
  beforeEach as registerBeforeEach,
  currentPathWithProvider,
  formatLinkWithProvider,
  navigateWithProvider,
  registerRouterSync,
  resetRouter,
} from './router';

function createRouter(): RouterProvider {
  return {
    go: vi.fn(),
    back: vi.fn(),
    parse: () => ({
      resource: 'posts',
      params: { page: '2' },
      pathname: '/posts',
    }),
    formatLink: (path) => `/admin${path}`,
  };
}

afterEach(() => {
  resetRouter();
  registerRouterSync(() => {});
});

describe('scoped router navigation', () => {
  it('preserves guards, router sync and after hooks for an explicit provider', async () => {
    const router = createRouter();
    const guard = vi.fn(async () => true);
    const after = vi.fn();
    const sync = vi.fn();
    registerBeforeEach(guard);
    registerAfterEach(after);
    registerRouterSync(sync);

    await navigateWithProvider(router, '/posts/edit/1', { replaceState: true });

    expect(guard).toHaveBeenCalledWith('/posts/edit/1', '/posts?page=2');
    expect(router.go).toHaveBeenCalledWith({ to: '/posts/edit/1', type: 'replace' });
    expect(sync).toHaveBeenCalledTimes(1);
    expect(after).toHaveBeenCalledWith('/posts/edit/1', '/posts?page=2');
  });

  it('does not navigate or sync when a guard rejects the route', async () => {
    const router = createRouter();
    const sync = vi.fn();
    registerBeforeEach(() => false);
    registerRouterSync(sync);

    await navigateWithProvider(router, '/blocked');

    expect(router.go).not.toHaveBeenCalled();
    expect(sync).not.toHaveBeenCalled();
  });

  it('uses the explicit provider for current paths and formatted links', () => {
    const router = createRouter();

    expect(currentPathWithProvider(router)).toBe('/posts?page=2');
    expect(formatLinkWithProvider(router, '/posts')).toBe('/admin/posts');
  });
});
