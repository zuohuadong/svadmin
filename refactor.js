const fs = require('fs');

const pkgs = [
  { p: 'airtable', r: 'airtable', func: 'createAirtableDataProvider' },
  { p: 'appwrite', r: 'appwrite', func: 'createAppwriteDataProvider' },
  { p: 'graphql', r: 'graphql', func: 'createGraphQLDataProvider' },
  { p: 'medusa', r: 'medusa', func: 'createMedusaDataProvider' },
  { p: 'nestjs-query', r: 'nestjs-query', func: 'createNestjsQueryDataProvider' },
  { p: 'nestjsx-crud', r: 'nestjsx-crud', func: 'createNestjsxCrudDataProvider' },
  { p: 'simple-rest', r: 'simple-rest', func: 'createSimpleRestDataProvider' },
  { p: 'strapi', r: 'strapi-v4', func: 'createStrapiDataProvider' },
  { p: 'supabase', r: 'supabase', func: 'createSupabaseDataProvider' }
];

for (const { p, r, func } of pkgs) {
  // Update package.json
  const pjPath = `packages/${p}/package.json`;
  if (fs.existsSync(pjPath)) {
    let pj = fs.readFileSync(pjPath, 'utf8');
    const pjo = JSON.parse(pj);
    pjo.peerDependencies = pjo.peerDependencies || {};
    pjo.peerDependencies[`@refinedev/${r}`] = "^5.0.0";
    pjo.peerDependencies[`@svadmin/refine-adapter`] = "workspace:*";
    fs.writeFileSync(pjPath, JSON.stringify(pjo, null, 2) + '\n');
    console.log(`Updated package.json for ${p}`);
  }

  // Update src/data-provider.ts
  const srcPath = `packages/${p}/src/data-provider.ts`;
  if (fs.existsSync(srcPath)) {
    const content = `import type { DataProvider } from '@svadmin/core';
import { createRefineAdapter } from '@svadmin/refine-adapter';
import dataProvider from '@refinedev/${r}';

/**
 * Creates a ${p} data provider using the official @refinedev/${r} package.
 * Requires \`@refinedev/${r}\` to be installed.
 * 
 * @param args Arguments required by @refinedev/${r}
 * @returns A fully compatible svadmin DataProvider
 */
export function ${func}(...args: any[]): DataProvider {
  const refineProvider = (dataProvider as any)(...args);
  return createRefineAdapter(refineProvider);
}
`;
    fs.writeFileSync(srcPath, content);
    console.log(`Updated src/data-provider.ts for ${p}`);
  }
}
