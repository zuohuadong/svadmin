import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));

describe('app.css package entry', () => {
  it('uses standard CSS token aliases instead of Tailwind-only at-rules', () => {
    const css = readFileSync(join(currentDir, 'app.css'), 'utf8');

    expect(css).not.toContain('@theme');
    expect(css).toContain(':root,');
    expect(css).toContain('.svadmin-theme');
    expect(css).toContain('--color-primary: var(--primary);');
  });
});
