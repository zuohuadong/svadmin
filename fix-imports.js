const fs = require('fs');

const pkgs = ['airtable', 'appwrite', 'graphql', 'medusa', 'nestjs-query', 'nestjsx-crud', 'simple-rest', 'strapi', 'supabase'];

for (const p of pkgs) {
  const srcPath = `packages/${p}/src/data-provider.ts`;
  if (fs.existsSync(srcPath)) {
    let content = fs.readFileSync(srcPath, 'utf8');
    // change "import dataProvider from '@refinedev/xyz'" to "import { dataProvider } from '@refinedev/xyz'"
    content = content.replace(/import dataProvider from '@refinedev\/(.+?)';/, "import { dataProvider } from '@refinedev/$1';");
    fs.writeFileSync(srcPath, content);
  }
}

// Fix SimpleRestOptions export missing
const simpleRestPath = 'packages/simple-rest/src/data-provider.ts';
let simpleContent = fs.readFileSync(simpleRestPath, 'utf8');
if (!simpleContent.includes('SimpleRestOptions')) {
  simpleContent += '\nexport type SimpleRestOptions = any;\n';
  fs.writeFileSync(simpleRestPath, simpleContent);
}

// Fix AppwriteOptions export missing
const appwriteIdxPath = 'packages/appwrite/src/index.ts';
if (fs.existsSync(appwriteIdxPath)) {
  let content = fs.readFileSync(appwriteIdxPath, 'utf8');
  content = content.replace(/, type AppwriteProviderOptions /, ' ');
  fs.writeFileSync(appwriteIdxPath, content);
}
const appwriteSrcPath = 'packages/appwrite/src/data-provider.ts';
if (fs.existsSync(appwriteSrcPath)) {
  let content = fs.readFileSync(appwriteSrcPath, 'utf8');
  if (!content.includes('AppwriteProviderOptions')) {
    content += '\nexport type AppwriteProviderOptions = any;\n';
    fs.writeFileSync(appwriteSrcPath, content);
  }
}

// Fix PocketBaseProviderOptions export missing
// wait, I skipped pocketbase. 

// Fix GraphQLDataProviderOptions
const graphqlSrcPath = 'packages/graphql/src/data-provider.ts';
if (fs.existsSync(graphqlSrcPath)) {
  let content = fs.readFileSync(graphqlSrcPath, 'utf8');
  if (!content.includes('GraphQLDataProviderOptions')) {
    content += '\nexport type GraphQLDataProviderOptions = any;\n';
    fs.writeFileSync(graphqlSrcPath, content);
  }
}
