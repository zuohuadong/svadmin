const fs = require('fs');
const path = require('path');

const NEW_VERSION = '0.4.0';

function findPackageJsons(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.svelte-kit') continue;
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findPackageJsons(filePath, fileList);
    } else if (file === 'package.json') {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const packageJsons = findPackageJsons(process.cwd());

for (const pkgPath of packageJsons) {
  let content = fs.readFileSync(pkgPath, 'utf-8');
  let json;
  try {
    json = JSON.parse(content);
  } catch (e) {
    console.error(`Failed to parse ${pkgPath}:`, e.message);
    continue;
  }
  let dirty = false;

  if (json.version && (json.version.startsWith('0.3.') || json.version === '0.4.0')) {
    json.version = NEW_VERSION;
    dirty = true;
  }

  const bumpDeps = (deps) => {
    if (!deps) return;
    for (const key in deps) {
      if (key.startsWith('@svadmin/')) {
        if (deps[key].startsWith('^0.3.') || deps[key] === 'workspace:*') {
          deps[key] = `^${NEW_VERSION}`;
          dirty = true;
        }
      }
    }
  };

  bumpDeps(json.dependencies);
  bumpDeps(json.devDependencies);
  bumpDeps(json.peerDependencies);

  if (dirty) {
    fs.writeFileSync(pkgPath, JSON.stringify(json, null, 2) + '\n');
    console.log(`Updated ${path.relative(process.cwd(), pkgPath)}`);
  }
}

console.log('Bump complete!');
