import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));

describe('src/app.css (Tailwind source)', () => {
  it('keeps @theme block so Tailwind v4 generates utility classes', () => {
    const css = readFileSync(join(currentDir, 'app.css'), 'utf8');

    expect(css).toContain('@theme');
  });

  it('uses the semantic border token in the global reset', () => {
    const css = readFileSync(join(currentDir, 'app.css'), 'utf8');

    expect(css).toContain('border-color: var(--color-border, var(--border));');
    expect(css).not.toMatch(/border-color:\s*var\(--border\);/);
  });
});
