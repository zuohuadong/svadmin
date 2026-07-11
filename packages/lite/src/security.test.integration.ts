import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import type { FieldDefinition } from '@svadmin/core';
import LiteShowField from './components/LiteShowField.svelte';
import LiteFileField from './components/fields/LiteFileField.svelte';
import LiteRichTextField from './components/fields/LiteRichTextField.svelte';
import LiteUrlField from './components/fields/LiteUrlField.svelte';
import LiteInsightCard from './components/widgets/LiteInsightCard.svelte';
import { toSafeHref } from './security';

const maliciousHtml = '<script>globalThis.__liteXss = 1</script><img src=x onerror="globalThis.__liteXss = 2">Safe text';

afterEach(() => {
  cleanup();
});

describe('lite safe text rendering', () => {
  it('does not interpret rich text field values as HTML', () => {
    const field = { key: 'body', label: 'Body' } as FieldDefinition;
    const { container } = render(LiteRichTextField, {
      field,
      value: maliciousHtml,
      mode: 'show',
    });

    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('[onerror]')).toBeNull();
    expect(container.textContent).toContain('<script>');
    expect(container.textContent).toContain('Safe text');
  });

  it('does not interpret insight content as HTML', () => {
    const { container } = render(LiteInsightCard, {
      title: 'Security insight',
      content: maliciousHtml,
    });

    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('[onerror]')).toBeNull();
    expect(container.textContent).toContain('<script>');
    expect(container.textContent).toContain('Safe text');
  });
});

describe('lite safe links', () => {
  it('accepts supported hrefs and rejects executable or control-obfuscated schemes', () => {
    expect(toSafeHref('/reports/quarterly.pdf')).toBe('/reports/quarterly.pdf');
    expect(toSafeHref('../exports/users.csv')).toBe('../exports/users.csv');
    expect(toSafeHref('https://example.test/report')).toBe('https://example.test/report');
    expect(toSafeHref('mailto:security@example.test')).toBe('mailto:security@example.test');
    expect(toSafeHref('tel:+12025550123')).toBe('tel:+12025550123');
    expect(toSafeHref('blob:https://example.test/550e8400-e29b-41d4-a716-446655440000')).toBe(
      'blob:https://example.test/550e8400-e29b-41d4-a716-446655440000',
    );

    expect(toSafeHref('javascript:alert(1)')).toBeUndefined();
    expect(toSafeHref(' JaVaScRiPt:alert(1) ')).toBeUndefined();
    expect(toSafeHref('java\nscript:alert(1)')).toBeUndefined();
    expect(toSafeHref('data:text/html,<script>alert(1)</script>')).toBeUndefined();
    expect(toSafeHref('vbscript:msgbox(1)')).toBeUndefined();
    expect(toSafeHref('file:///etc/passwd')).toBeUndefined();
  });

  it('renders unsafe LiteUrlField values as text without a clickable link', () => {
    const field = { key: 'website', label: 'Website', type: 'url' } as FieldDefinition;
    const unsafe = 'javascript:alert(document.domain)';
    const unsafeView = render(LiteUrlField, {
      field,
      value: unsafe,
      mode: 'show',
    });

    expect(unsafeView.container.querySelector('a')).toBeNull();
    expect(unsafeView.container.textContent).toContain(unsafe);
    unsafeView.unmount();

    const safeView = render(LiteUrlField, {
      field,
      value: '/reports/quarterly',
      mode: 'show',
    });
    const safeLink = safeView.container.querySelector('a');
    expect(safeLink?.getAttribute('href')).toBe('/reports/quarterly');
    expect(safeLink?.getAttribute('target')).toBe('_blank');
    expect(safeLink?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('sanitizes URL and email links rendered by LiteShowField', () => {
    const urlField = { key: 'website', label: 'Website', type: 'url' } as FieldDefinition;
    const unsafeUrl = 'data:text/html,<script>alert(1)</script>';
    const unsafeView = render(LiteShowField, { field: urlField, value: unsafeUrl });

    expect(unsafeView.container.querySelector('a')).toBeNull();
    expect(unsafeView.container.textContent).toContain(unsafeUrl);
    unsafeView.unmount();

    const safeView = render(LiteShowField, {
      field: urlField,
      value: 'https://example.test/report',
    });
    const safeLink = safeView.container.querySelector('a');
    expect(safeLink?.getAttribute('href')).toBe('https://example.test/report');
    expect(safeLink?.getAttribute('target')).toBe('_blank');
    expect(safeLink?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('renders unsafe LiteFileField values as text while preserving safe downloads', () => {
    const field = { key: 'attachments', label: 'Attachments', type: 'file' } as FieldDefinition;
    const unsafe = 'javascript:alert(1)';
    const safe = '/downloads/report.pdf';
    const { container } = render(LiteFileField, {
      field,
      value: [unsafe, safe],
      mode: 'show',
    });

    const links = container.querySelectorAll('a');
    expect(links).toHaveLength(1);
    expect(links[0]?.getAttribute('href')).toBe(safe);
    expect(links[0]?.getAttribute('target')).toBe('_blank');
    expect(links[0]?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(container.textContent).toContain(unsafe);
  });
});
