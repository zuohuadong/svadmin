const fs = require('fs');

const pkgs = ['airtable', 'appwrite', 'graphql', 'medusa', 'nestjs-query', 'nestjsx-crud', 'simple-rest', 'strapi', 'supabase'];

for (const p of pkgs) {
  const r = p === 'strapi' ? 'strapi-v4' : p;
  const srcPath = `packages/${p}/src/data-provider.ts`;
  if (fs.existsSync(srcPath)) {
    let content = fs.readFileSync(srcPath, 'utf8');
    // Replace imports with universal require or ts-ignore
    content = content.replace(/import .*? '@refinedev\/.*?';/g, '');
    
    // Find the line "const refineProvider = (...)"
    content = content.replace(/const refineProvider =.*/g, `
  // @ts-ignore
  import * as pkg from '@refinedev/${r}';
  const init = pkg.default || pkg.dataProvider || pkg.DataProvider;
  const refineProvider = init(...args);`);
    
    fs.writeFileSync(srcPath, content);
  }
}
