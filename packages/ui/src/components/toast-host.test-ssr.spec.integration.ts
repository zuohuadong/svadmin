import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Toast from './Toast.svelte';

describe('Toast host server rendering', () => {
  it('does not register or render a browser Toaster during SSR', () => {
    const { body } = render(Toast);

    expect(body).not.toContain('data-sonner-toaster');
  });
});
