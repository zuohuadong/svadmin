// @vitest-environment happy-dom
import { mount, unmount } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import LazyResourcePage from '../src/components/LazyResourcePage.svelte';

vi.mock('../src/pages/ExampleResourcePage.svelte', async () => {
  const page = await import('./fixtures/LazyResourceDefaultDouble.svelte');
  return { default: page.default };
});

vi.mock('../src/pages/TodoWorkspacePage.svelte', async () => {
  const page = await import('./fixtures/LazyResourceTodoDouble.svelte');
  return { default: page.default };
});

describe('LazyResourcePage', () => {
  it('loads the dedicated workspace page for a specialized resource', async () => {
    const target = document.createElement('div');
    const page = mount(LazyResourcePage, { target, props: { resourceName: 'todos' } });

    await vi.waitFor(() => expect(target.textContent).toContain('todo:todos'));

    await unmount(page);
  });

  it('falls back to the general resource page', async () => {
    const target = document.createElement('div');
    const page = mount(LazyResourcePage, { target, props: { resourceName: 'products' } });

    await vi.waitFor(() => expect(target.textContent).toContain('default:products'));

    await unmount(page);
  });
});
