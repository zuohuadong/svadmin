// @vitest-environment happy-dom
import { mount, tick, unmount } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import TestHost from './fixtures/LazyRichTextEditorHost.svelte';

vi.mock('@svadmin/editor/components/Editor.svelte', async () => {
  const editor = await import('./fixtures/LazyRichTextEditorDouble.svelte');
  return { default: editor.default };
});

describe('LazyRichTextEditor', () => {
  it('preserves binding and change callbacks while mapping disabled to editable', async () => {
    const onchange = vi.fn();
    const target = document.createElement('div');
    document.body.append(target);
    const host = mount(TestHost, { target, props: { onchange } });

    await vi.waitFor(() => {
      expect(target.querySelector('[data-testid="editor"]')).toBeTruthy();
    });

    const editor = target.querySelector<HTMLElement>('[data-testid="editor"]');
    if (!editor) throw new Error('Editor test double did not render');
    expect(editor.dataset.editable).toBe('false');
    expect(editor.dataset.placeholder).toBe('Write something');

    target.querySelector<HTMLButtonElement>('button')?.click();
    await tick();

    expect(target.querySelector('output')?.textContent).toBe('<p>updated</p>');
    expect(onchange).toHaveBeenCalledWith('<p>updated</p>');

    await unmount(host);
    target.remove();
  });
});
