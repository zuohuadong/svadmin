import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import type { I18nProvider } from '@svadmin/core/i18n';
import I18nLeafScopeHost from '../../../test/fixtures/I18nLeafScopeHost.svelte';

function createProvider(instance: string): I18nProvider {
  let locale = 'en';

  return {
    translate: (key) => `${instance}:${locale}:${key}`,
    getLocale: () => locale,
    setLocale: vi.fn((nextLocale: string) => {
      locale = nextLocale;
    }),
  };
}

describe('leaf translation callbacks', () => {
  it('keeps deferred event translations bound to their component-tree scope', async () => {
    render(I18nLeafScopeHost, {
      instance: 'first',
      provider: createProvider('first'),
    });
    render(I18nLeafScopeHost, {
      instance: 'second',
      provider: createProvider('second'),
    });

    await fireEvent.click(screen.getByTestId('second-translate'));

    await waitFor(() => {
      expect(screen.getByTestId('second-translation').textContent).toBe('second:en:common.save');
    });
    expect(screen.getByTestId('first-translation').textContent).toBe('');
  });
});
