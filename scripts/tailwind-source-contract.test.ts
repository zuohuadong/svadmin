import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const repositoryRoot = resolve(import.meta.dir, '..');

function readRepositoryFile(path: string): string {
  return readFileSync(join(repositoryRoot, path), 'utf8');
}

describe('@svadmin/ui Tailwind source contract', () => {
  it('keeps source discovery inside the published UI stylesheet', () => {
    const uiCss = readRepositoryFile('packages/ui/src/app.css');
    const exampleCss = readRepositoryFile('example/src/app.css');
    const templateCss = readRepositoryFile('packages/create-svadmin/template/src/app.css');
    const readme = readRepositoryFile('README.md');

    expect(uiCss).toContain('@source "./components";');
    expect(exampleCss).not.toContain('@source "../node_modules/@svadmin/ui";');
    expect(templateCss).not.toContain('@source "../node_modules/@svadmin/ui";');
    expect(readme).not.toContain('@source "../node_modules/@svadmin/ui";');
    expect(readme).toContain('registers its published `dist/components` directory');
  });
});
