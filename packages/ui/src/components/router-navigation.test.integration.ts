import { fireEvent, render, within } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DataProvider, RouterProvider } from '@svadmin/core';
import RouterNavigationHost from '../../test/fixtures/RouterNavigationHost.svelte';

function createDataProvider(): DataProvider {
  return {
    getList: async () => ({ data: [], total: 0 }),
    getOne: async () => ({ data: { id: 'test' } }),
    create: async () => ({ data: { id: 'test' } }),
    update: async () => ({ data: { id: 'test' } }),
    deleteOne: async () => ({ data: { id: 'test' } }),
    getApiUrl: () => 'https://example.test',
  } as DataProvider;
}

function createRouterProvider(instance: string) {
  const go = vi.fn<RouterProvider['go']>();
  const provider: RouterProvider = {
    go,
    back: vi.fn(),
    parse: () => ({ pathname: '/', params: { instance } }),
    formatLink: path => `/app/${instance}${path}`,
  };

  return { go, provider };
}

function getHomeButton(scope: HTMLElement): HTMLElement {
  const button = within(scope).getAllByRole('button').at(-1);
  if (!button) throw new Error('Expected ErrorPage to render a home button');
  return button;
}

beforeEach(() => {
  window.location.hash = '#/unchanged';
});

describe('tree-scoped UI navigation', () => {
  it('routes each mounted page through its own RouterProvider without falling back to hash navigation', async () => {
    const first = createRouterProvider('first');
    const second = createRouterProvider('second');

    const firstView = render(RouterNavigationHost, {
      instance: 'first',
      dataProvider: createDataProvider(),
      routerProvider: first.provider,
    });
    const secondView = render(RouterNavigationHost, {
      instance: 'second',
      dataProvider: createDataProvider(),
      routerProvider: second.provider,
    });

    const firstScope = firstView.getByTestId('router-scope-first');
    const secondScope = secondView.getByTestId('router-scope-second');

    await fireEvent.click(getHomeButton(firstScope));
    expect(first.go).toHaveBeenCalledWith({ to: '/', type: 'push' });
    expect(second.go).not.toHaveBeenCalled();
    expect(window.location.hash).toBe('#/unchanged');

    await fireEvent.click(getHomeButton(secondScope));
    expect(second.go).toHaveBeenCalledWith({ to: '/', type: 'push' });
    expect(first.go).toHaveBeenCalledTimes(1);
    expect(window.location.hash).toBe('#/unchanged');
  });
});
