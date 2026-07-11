import { cleanup, fireEvent, render as renderComponent, waitFor } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  AuthProvider,
  DataProvider,
  ResourceDefinition,
  RouterProvider,
  TaskProvider,
  I18nProvider,
} from '@svadmin/core';
import {
  getAuthProvider,
  getDataProvider,
  getLocale,
  getResources,
  getRouterProvider,
  getTaskProvider,
  getTheme,
  resetContext,
  setLocale,
} from '@svadmin/core';
import {
  getParams,
  getRouterProviderInstance,
  initRouter,
} from '../router-state.svelte.js';
import {
  afterEach as registerAfterEach,
  beforeEach as registerBeforeEach,
} from '@svadmin/core/router';
import ContextHost from './admin-app.context.test-host.svelte';

function createDataProvider(instance: string): DataProvider {
  return {
    getList: async () => ({ data: [], total: 0 }),
    getOne: async () => ({ data: { id: 'test' } }),
    create: async () => ({ data: { id: 'test' } }),
    update: async () => ({ data: { id: 'test' } }),
    deleteOne: async () => ({ data: { id: 'test' } }),
    getApiUrl: () => `https://${instance}.example.test`,
  } as DataProvider;
}

function createAuthProvider(instance: string): AuthProvider {
  return {
    __testId: instance,
    login: async () => ({ success: true }),
    logout: async () => ({ success: true }),
    check: async () => ({ authenticated: true }),
    getIdentity: async () => ({ id: instance, name: instance }),
  } as AuthProvider;
}

function createTaskProvider(instance: string): TaskProvider {
  return {
    __testId: instance,
    submit: async () => ({ wait: async () => ({ id: `${instance}-task` }) }),
    get: async taskId => ({ id: taskId }),
    list: async () => ({ data: [] }),
  } as TaskProvider;
}

function createRouterProvider(instance: string): RouterProvider {
  let pathname = '/';
  let queryParams: Record<string, string> = {};
  return {
    go: ({ to, query }) => {
      const target = new URL(to, 'https://router.example.test');
      pathname = target.pathname;
      queryParams = {
        ...Object.fromEntries(target.searchParams.entries()),
        ...query,
      };
    },
    back: () => {},
    parse: () => ({
      pathname,
      params: { instance, ...queryParams },
    }),
  };
}

function createResource(instance: string): ResourceDefinition {
  return {
    name: `${instance}-resource`,
    label: `${instance} resource`,
    fields: [],
  };
}

function createI18nProvider(instance: string, initialLocale = 'en'): I18nProvider {
  let locale = initialLocale;
  return {
    translate: key => `${instance}:${locale}:${key}`,
    getLocale: () => locale,
    setLocale: nextLocale => { locale = nextLocale; },
    getAvailableLocales: () => ['en', 'zh-CN'],
  };
}

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'trace').mockImplementation(() => {});
  const storage = new Map<string, string>();
  const localStorageStub: Storage = {
    get length() { return storage.size; },
    clear: () => storage.clear(),
    getItem: key => storage.get(key) ?? null,
    key: index => Array.from(storage.keys())[index] ?? null,
    removeItem: key => { storage.delete(key); },
    setItem: (key, value) => { storage.set(key, value); },
  };

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: localStorageStub,
  });
  Object.defineProperty(Element.prototype, 'animate', {
    configurable: true,
    value: () => ({
      cancel: () => {},
      finished: Promise.resolve(),
    }),
  });
  resetContext();
});

afterEach(() => {
  cleanup();
  resetContext();
  initRouter(undefined);
  vi.restoreAllMocks();
});

describe('AdminApp context isolation', () => {
  it('keeps two mounted app instances isolated and clears optional providers', async () => {
    const first = renderComponent(ContextHost, {
      instance: 'first',
      dataProvider: createDataProvider('first'),
      authProvider: createAuthProvider('first'),
      taskProvider: createTaskProvider('first'),
      routerProvider: createRouterProvider('first'),
      resources: [createResource('first')],
    });

    const second = renderComponent(ContextHost, {
      instance: 'second',
      dataProvider: createDataProvider('second'),
      routerProvider: createRouterProvider('second'),
      resources: [createResource('second')],
    });

    await waitFor(() => {
      expect(first.queryByTestId('context-probe-first')).not.toBeNull();
      expect(second.queryByTestId('context-probe-second')).not.toBeNull();
    });

    const firstProbe = first.getByTestId('context-probe-first');
    const secondProbe = second.getByTestId('context-probe-second');

    expect(firstProbe.getAttribute('data-provider')).toBe('https://first.example.test');
    expect(firstProbe.getAttribute('data-resources')).toBe('first-resource');
    expect(firstProbe.getAttribute('data-auth')).toBe('first');
    expect(firstProbe.getAttribute('data-task')).toBe('first');
    expect(firstProbe.getAttribute('data-router')).toBe('first');
    expect(firstProbe.getAttribute('data-route-instance')).toBe('first');

    expect(secondProbe.getAttribute('data-provider')).toBe('https://second.example.test');
    expect(secondProbe.getAttribute('data-resources')).toBe('second-resource');
    expect(secondProbe.getAttribute('data-auth')).toBe('none');
    expect(secondProbe.getAttribute('data-task')).toBe('none');
    expect(secondProbe.getAttribute('data-router')).toBe('second');
    expect(secondProbe.getAttribute('data-route-instance')).toBe('second');

    expect(() => getDataProvider()).toThrow('DataProvider not found');
    expect(getResources()).toEqual([]);
    expect(getAuthProvider({ optional: true })).toBeNull();
    expect(getTaskProvider({ optional: true })).toBeUndefined();
    expect(getRouterProvider()).toBeUndefined();
    expect(getRouterProviderInstance()).toBeUndefined();
    expect(getParams()).toEqual({});
  });

  it('owns independent locale scopes and writes tree changes back through the binding', async () => {
    vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('zh-CN');
    vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(['zh-CN']);
    setLocale('zh-CN');

    const first = renderComponent(ContextHost, {
      instance: 'first',
      dataProvider: createDataProvider('first'),
      routerProvider: createRouterProvider('first'),
      resources: [createResource('first')],
      locale: 'en',
      nextLocale: 'zh-CN',
    });
    const second = renderComponent(ContextHost, {
      instance: 'second',
      dataProvider: createDataProvider('second'),
      routerProvider: createRouterProvider('second'),
      resources: [createResource('second')],
      locale: 'zh-CN',
      nextLocale: 'en',
    });
    const implicit = renderComponent(ContextHost, {
      instance: 'implicit',
      dataProvider: createDataProvider('implicit'),
      routerProvider: createRouterProvider('implicit'),
      resources: [createResource('implicit')],
    });

    await waitFor(() => {
      expect(first.getByTestId('context-probe-first').getAttribute('data-locale')).toBe('en');
      expect(first.getByTestId('context-probe-first').getAttribute('data-translation')).toBe('Save');
      expect(second.getByTestId('context-probe-second').getAttribute('data-locale')).toBe('zh-CN');
      expect(second.getByTestId('context-probe-second').getAttribute('data-translation')).toBe('保存');
      expect(implicit.getByTestId('context-probe-implicit').getAttribute('data-locale')).toBe('zh-CN');
      expect(implicit.getByTestId('context-probe-implicit').getAttribute('data-translation')).toBe('保存');
    });

    await fireEvent.click(first.getByTestId('change-locale-later-first'));

    await waitFor(() => {
      expect(first.getByTestId('context-probe-first').getAttribute('data-locale')).toBe('zh-CN');
      expect(first.getByTestId('context-probe-first').getAttribute('data-translation')).toBe('保存');
      expect(first.getByTestId('bound-locale-first').textContent).toBe('zh-CN');
      expect(second.getByTestId('context-probe-second').getAttribute('data-locale')).toBe('zh-CN');
      expect(implicit.getByTestId('context-probe-implicit').getAttribute('data-locale')).toBe('zh-CN');
    });

    await fireEvent.click(second.getByTestId('change-locale-second'));

    await waitFor(() => {
      expect(second.getByTestId('context-probe-second').getAttribute('data-locale')).toBe('en');
      expect(second.getByTestId('context-probe-second').getAttribute('data-translation')).toBe('Save');
      expect(second.getByTestId('bound-locale-second').textContent).toBe('en');
      expect(first.getByTestId('context-probe-first').getAttribute('data-locale')).toBe('zh-CN');
    });
    expect(getLocale()).toBe('zh-CN');
  });

  it('applies owner locale updates without leaking to another app or legacy locale state', async () => {
    setLocale('zh-CN');
    const view = renderComponent(ContextHost, {
      instance: 'owner',
      dataProvider: createDataProvider('owner'),
      routerProvider: createRouterProvider('owner'),
      resources: [createResource('owner')],
      locale: 'en',
      nextLocale: 'en',
    });

    await view.rerender({
      instance: 'owner',
      dataProvider: createDataProvider('owner'),
      routerProvider: createRouterProvider('owner'),
      resources: [createResource('owner')],
      locale: 'zh-CN',
      nextLocale: 'en',
    });

    await waitFor(() => {
      expect(view.getByTestId('context-probe-owner').getAttribute('data-locale')).toBe('zh-CN');
      expect(view.getByTestId('bound-locale-owner').textContent).toBe('zh-CN');
    });
    expect(getLocale()).toBe('zh-CN');

    await fireEvent.click(view.getByTestId('change-locale-owner'));
    await waitFor(() => {
      expect(view.getByTestId('context-probe-owner').getAttribute('data-locale')).toBe('en');
      expect(view.getByTestId('bound-locale-owner').textContent).toBe('en');
    });
    expect(getLocale()).toBe('zh-CN');
  });

  it('uses an explicit tree-local i18n provider without exposing it to sibling apps', async () => {
    const localized = renderComponent(ContextHost, {
      instance: 'localized',
      dataProvider: createDataProvider('localized'),
      routerProvider: createRouterProvider('localized'),
      resources: [createResource('localized')],
      i18nProvider: createI18nProvider('localized', 'zh-CN'),
      nextLocale: 'en',
    });
    const defaulted = renderComponent(ContextHost, {
      instance: 'defaulted',
      dataProvider: createDataProvider('defaulted'),
      routerProvider: createRouterProvider('defaulted'),
      resources: [createResource('defaulted')],
    });

    await waitFor(() => {
      expect(localized.getByTestId('context-probe-localized').getAttribute('data-locale')).toBe('zh-CN');
      expect(localized.getByTestId('context-probe-localized').getAttribute('data-translation')).toBe('localized:zh-CN:common.save');
      expect(defaulted.getByTestId('context-probe-defaulted').getAttribute('data-translation')).toBe('Save');
    });

    await fireEvent.click(localized.getByTestId('change-locale-localized'));
    await waitFor(() => {
      expect(localized.getByTestId('context-probe-localized').getAttribute('data-locale')).toBe('en');
      expect(localized.getByTestId('bound-locale-localized').textContent).toBe('en');
    });
  });

  it('runs navigation guards and synchronizes only the router state owned by the target tree', async () => {
    const beforeGuard = vi.fn(() => true);
    const afterGuard = vi.fn();
    const removeBefore = registerBeforeEach(beforeGuard);
    const removeAfter = registerAfterEach(afterGuard);

    const first = renderComponent(ContextHost, {
      instance: 'nav-first',
      dataProvider: createDataProvider('nav-first'),
      routerProvider: createRouterProvider('nav-first'),
      resources: [createResource('nav-first')],
    });
    const second = renderComponent(ContextHost, {
      instance: 'nav-second',
      dataProvider: createDataProvider('nav-second'),
      routerProvider: createRouterProvider('nav-second'),
      resources: [createResource('nav-second')],
    });

    try {
      await fireEvent.click(first.getByTestId('navigate-nav-first'));

      await waitFor(() => {
        expect(first.getByTestId('context-probe-nav-first').getAttribute('data-route-scope')).toBe('nav-first');
      });
      expect(second.getByTestId('context-probe-nav-second').getAttribute('data-route')).toBe('/');
      expect(second.getByTestId('context-probe-nav-second').getAttribute('data-route-scope')).toBe('none');
      expect(beforeGuard).toHaveBeenCalledWith('/?scope=nav-first', '/?instance=nav-first');
      expect(afterGuard).toHaveBeenCalledWith('/?scope=nav-first', '/?instance=nav-first');
    } finally {
      removeBefore();
      removeAfter();
    }
  });

  it('keeps auth redirects behind navigation guards', async () => {
    const router = createRouterProvider('guarded-auth');
    const beforeGuard = vi.fn(() => false);
    const afterGuard = vi.fn();
    const removeBefore = registerBeforeEach(beforeGuard);
    const removeAfter = registerAfterEach(afterGuard);
    const authProvider = createAuthProvider('guarded-auth');
    authProvider.check = vi.fn(async () => ({ authenticated: false, redirectTo: '/login' }));

    try {
      renderComponent(ContextHost, {
        instance: 'guarded-auth',
        dataProvider: createDataProvider('guarded-auth'),
        authProvider,
        routerProvider: router,
        resources: [createResource('guarded-auth')],
      });

      await waitFor(() => expect(authProvider.check).toHaveBeenCalled());
      await waitFor(() => expect(beforeGuard).toHaveBeenCalledWith('/login', '/?instance=guarded-auth'));
      expect(router.parse().pathname).toBe('/');
      expect(afterGuard).not.toHaveBeenCalled();
    } finally {
      removeBefore();
      removeAfter();
    }
  });

  it('registers reactive document theme owners and restores the previous owner on destroy', async () => {
    const first = renderComponent(ContextHost, {
      instance: 'theme-first',
      dataProvider: createDataProvider('theme-first'),
      routerProvider: createRouterProvider('theme-first'),
      resources: [createResource('theme-first')],
      defaultTheme: 'dark',
      themeConfig: { cssOverrides: { '--admin-owner': 'first' } },
    });

    await waitFor(() => {
      expect(getTheme()).toBe('dark');
      expect(document.documentElement.style.getPropertyValue('--admin-owner')).toBe('first');
    });

    const second = renderComponent(ContextHost, {
      instance: 'theme-second',
      dataProvider: createDataProvider('theme-second'),
      routerProvider: createRouterProvider('theme-second'),
      resources: [createResource('theme-second')],
    });

    await waitFor(() => {
      expect(getTheme()).toBe('dark');
      expect(document.documentElement.style.getPropertyValue('--admin-owner')).toBe('first');
    });

    await second.rerender({
      instance: 'theme-second',
      dataProvider: createDataProvider('theme-second'),
      routerProvider: createRouterProvider('theme-second'),
      resources: [createResource('theme-second')],
      defaultTheme: 'light',
      themeConfig: {
        layoutPreset: 'clean-flat',
        cssOverrides: { '--admin-owner': 'second' },
      },
    });

    await waitFor(() => {
      expect(getTheme()).toBe('light');
      expect(document.documentElement.classList.contains('layout-clean-flat')).toBe(true);
      expect(document.documentElement.style.getPropertyValue('--admin-owner')).toBe('second');
    });

    second.unmount();
    await waitFor(() => {
      expect(getTheme()).toBe('dark');
      expect(document.documentElement.classList.contains('layout-clean-flat')).toBe(false);
      expect(document.documentElement.style.getPropertyValue('--admin-owner')).toBe('first');
    });

    first.unmount();
    await waitFor(() => {
      expect(getTheme()).toBe('system');
      expect(document.documentElement.style.getPropertyValue('--admin-owner')).toBe('');
    });
  });

});
