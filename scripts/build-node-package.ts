import { spawnSync } from 'node:child_process';
import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

async function findEmittedModules(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const modules: string[] = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      modules.push(...await findEmittedModules(path));
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.d.ts'))) {
      modules.push(path);
    }
  }

  return modules;
}

function addJavaScriptExtension(specifier: string): string {
  return extname(specifier) === '' ? `${specifier}.js` : specifier;
}

async function fixRelativeImports(directory: string): Promise<void> {
  for (const modulePath of await findEmittedModules(directory)) {
    const original = await readFile(modulePath, 'utf8');
    const updated = original
      .replace(
        /(from\s+['"])(\.\.?\/[^'"]+)(['"])/g,
        (_match, prefix: string, specifier: string, suffix: string) =>
          `${prefix}${addJavaScriptExtension(specifier)}${suffix}`,
      )
      .replace(
        /(import\(\s*['"])(\.\.?\/[^'"]+)(['"]\s*\))/g,
        (_match, prefix: string, specifier: string, suffix: string) =>
          `${prefix}${addJavaScriptExtension(specifier)}${suffix}`,
      );

    if (updated !== original) {
      await writeFile(modulePath, updated, 'utf8');
      console.info(`Updated relative ESM imports in ${modulePath}`);
    }
  }
}

const packageDirectory = process.cwd();
const outputDirectory = resolve(packageDirectory, 'dist');
const tscPath = resolve(import.meta.dir, '..', 'node_modules', 'typescript', 'bin', 'tsc');

await rm(outputDirectory, { recursive: true, force: true });

const result = spawnSync(process.execPath, [tscPath, '-p', 'tsconfig.json'], {
  cwd: packageDirectory,
  stdio: 'inherit',
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

await fixRelativeImports(outputDirectory);
console.info(`Built Node ESM JavaScript and declarations into ${outputDirectory}`);
