import { fireEvent, render, screen, within } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { I18nProvider } from '@svadmin/core/i18n';
import AppearanceSettingsI18nScopeHost from '../../test/fixtures/AppearanceSettingsI18nScopeHost.svelte';

vi.mock('@svadmin/core', () => ({
  getTheme: () => 'light',
  setTheme: vi.fn(),
  getColorTheme: () => 'violet',
  setColorTheme: vi.fn(),
  getColorPresets: () => [],
}));

beforeEach(() => {
  let storage: Record<string, string> = {};
  const localStorageStub: Storage = {
    get length() { return Object.keys(storage).length; },
    clear: () => { storage = {}; },
    getItem: key => storage[key] ?? null,
    key: index => Object.keys(storage)[index] ?? null,
    removeItem: key => {
      storage = Object.fromEntries(
        Object.entries(storage).filter(([storedKey]) => storedKey !== key),
      );
    },
    setItem: (key, value) => { storage[key] = value; },
  };

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: localStorageStub,
  });
});

function createProvider(instance: string, initialLocale: string): I18nProvider {
  let locale = initialLocale;

  return {
    translate: key => `${instance}:${locale}:${key}`,
    getLocale: () => locale,
    setLocale: vi.fn((nextLocale: string) => {
      locale = nextLocale;
    }),
    getAvailableLocales: () => ['en', 'zh-CN'],
  };
}

describe('AppearanceSettings locale scope', () => {
  it('changes only the component-tree locale that owns the select event', async () => {
    const firstProvider = createProvider('first', 'en');
    const secondProvider = createProvider('second', 'zh-CN');

    render(AppearanceSettingsI18nScopeHost, {
      instance: 'first',
      provider: firstProvider,
    });
    render(AppearanceSettingsI18nScopeHost, {
      instance: 'second',
      provider: secondProvider,
    });

    const firstSelect = within(screen.getByTestId('first-appearance-settings')).getByRole('combobox');
    await fireEvent.change(firstSelect, { target: { value: 'zh-CN' } });

    expect(firstProvider.setLocale).toHaveBeenCalledWith('zh-CN');
    expect(secondProvider.setLocale).not.toHaveBeenCalled();
  });
});
