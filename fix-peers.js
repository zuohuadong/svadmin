const fs = require('fs');
const glob = require('glob'); // Note: we can use native fs.readdir if glob is not present, but let's just use fs
const path = require('path');

const packagesDir = path.join(__dirname, 'packages');
const packages = fs.readdirSync(packagesDir);

for (const pkg of packages) {
  const pkgPath = path.join(packagesDir, pkg, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const data = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (data.peerDependencies) {
      if (!data.peerDependenciesMeta) data.peerDependenciesMeta = {};
      for (const peer in data.peerDependencies) {
        if (!data.peerDependenciesMeta[peer]) {
          data.peerDependenciesMeta[peer] = { optional: true };
        }
      }
      fs.writeFileSync(pkgPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
      console.log('Fixed peerDependencies in ' + pkg);
    }
  }
}
