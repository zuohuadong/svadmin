import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const paths = Bun.argv.slice(2);

if (paths.length === 0 || paths.length % 2 !== 0) {
  throw new Error('Provide source/destination path pairs');
}

for (let index = 0; index < paths.length; index += 2) {
  const source = resolve(process.cwd(), paths[index]);
  const destination = resolve(process.cwd(), paths[index + 1]);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(source, destination);
  console.info(`Copied ${source} to ${destination}`);
}
