import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));

describe('src/app.css (Tailwind source)', () => {
  it('keeps @theme block so Tailwind v4 generates utility classes', () => {
    const css = readFileSync(join(currentDir, 'app.css'), 'utf8');

    expect(css).toContain('@theme');
  });
});

describe('dist/app.theme.css (Tailwind artifact)', () => {
  const path = join(currentDir, '..', 'dist', 'app.theme.css');

  it.skipIf(!existsSync(path))('retains @theme block for Tailwind consumers', () => {
    const css = readFileSync(path, 'utf8');

    expect(css).toContain('@theme');
  });
});

describe('dist/app.css (published runtime artifact)', () => {
  const path = join(currentDir, '..', 'dist', 'app.css');

  it.skipIf(!existsSync(path))(
    'uses standard CSS token aliases instead of Tailwind-only at-rules',
    () => {
      const css = readFileSync(path, 'utf8');

      expect(css).not.toContain('@theme');
      expect(css).toContain(':root');
      expect(css).toContain('.svadmin-theme');
      expect(css).toContain('--color-primary: var(--primary);');
    },
  );
});
