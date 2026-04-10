async function check() {
  const pkgs = ['airtable', 'appwrite', 'directus', 'drizzle', 'elysia', 'graphql', 'medusa', 'nestjs-query', 'nestjsx-crud', 'pocketbase', 'sanity', 'simple-rest', 'strapi-v4', 'supabase'];
  for (const pkg of pkgs) {
    const res = await fetch(`https://registry.npmjs.org/@refinedev/${pkg}`);
    if (res.ok) console.log(`${pkg}: YES`);
    else console.log(`${pkg}: NO`);
  }
}
check();
