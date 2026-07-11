import { render } from 'svelte/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { DataProvider, ResourceDefinition, RouterProvider, ThemeConfig } from '@svadmin/core';
import {
  configureTheme,
  getLocale,
  getTheme,
  getThemeConfig,
  resetI18n,
  resetContext,
  setLocale,
  setTheme,
} from '@svadmin/core';
import ContextHost from './admin-app.context.test-host.svelte';

function createDataProvider(): DataProvider {
  return {
    getList: async () => ({ data: [], total: 0 }),
    getOne: async () => ({ data: { id: 'test' } }),
    create: async () => ({ data: { id: 'test' } }),
    update: async () => ({ data: { id: 'test' } }),
    deleteOne: async () => ({ data: { id: 'test' } }),
    getApiUrl: () => 'https://server.example.test',
  } as DataProvider;
}

function createRouterProvider(): RouterProvider {
  return {
    go: () => {},
    back: () => {},
    parse: () => ({ pathname: '/', params: { instance: 'server' } }),
  };
}

const resources: ResourceDefinition[] = [{
  name: 'server-resource',
  label: 'Server resource',
  fields: [],
}];

beforeEach(() => {
  resetContext();
  resetI18n();
});
afterEach(() => {
  resetContext();
  resetI18n();
});

describe('AdminApp server rendering isolation', () => {
  it('does not mutate legacy locale or document theme state', () => {
    const legacyConfig: ThemeConfig = {
      layoutPreset: 'clean-flat',
      cssOverrides: { '--legacy-owner': 'preserved' },
    };
    configureTheme(legacyConfig);
    setTheme('light');
    setLocale('en');

    const result = render(ContextHost, {
      props: {
        instance: 'server',
        dataProvider: createDataProvider(),
        routerProvider: createRouterProvider(),
        resources,
        locale: 'zh-CN',
        defaultTheme: 'dark',
        themeConfig: { cssOverrides: { '--server-owner': 'must-not-apply' } },
      },
    });

    expect(result.body).toContain('aria-label="开发者工具 (Ctrl+Shift+D)"');
    expect(getTheme()).toBe('light');
    expect(getThemeConfig()).toEqual(legacyConfig);
    expect(getLocale()).toBe('en');
  });

  it('defaults each unconfigured server-rendered tree to English without reading legacy locale', () => {
    setLocale('zh-CN');

    const result = render(ContextHost, {
      props: {
        instance: 'server-default',
        dataProvider: createDataProvider(),
        routerProvider: createRouterProvider(),
        resources,
      },
    });

    expect(result.body).toContain('aria-label="DevTools (Ctrl+Shift+D)"');
    expect(getLocale()).toBe('zh-CN');
  });
});
