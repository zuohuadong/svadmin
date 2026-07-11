import { render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import LazyPage from './LazyPage.svelte';
import TestContent from '../../test/fixtures/LazyPageContent.svelte';

describe('LazyPage', () => {
  it('caches a loader promise across mounts and forwards props', async () => {
    const loader = vi.fn(async () => ({ default: TestContent }));

    const first = render(LazyPage, {
      props: {
        loader,
        props: { label: 'first mount' },
      },
    });

    expect(await screen.findByText('first mount')).toBeTruthy();
    first.unmount();

    render(LazyPage, {
      props: {
        loader,
        props: { label: 'second mount' },
      },
    });

    expect(await screen.findByText('second mount')).toBeTruthy();
    expect(loader).toHaveBeenCalledTimes(1);
  });
});
