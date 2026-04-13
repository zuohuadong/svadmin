import type { DataProvider } from '@svadmin/core';
// Dynamic import used for createRefineAdapter to avoid Vite plugin errors


/**
 * Creates a strapi data provider using the official @refinedev/strapi-v4 package.
 * Requires `@refinedev/strapi-v4` to be installed.
 * 
 * @param args Arguments required by @refinedev/strapi-v4
 * @returns A fully compatible svadmin DataProvider
 */
export async function createStrapiDataProvider(...args: any[]): Promise<DataProvider> {
  // @ts-ignore
  const pkg = await import('@refinedev/strapi-v4');
  const init = (pkg as any).default || (pkg as any).dataProvider || (pkg as any).DataProvider;
  if (typeof init !== 'function') throw new Error('[svadmin] Failed to resolve @refinedev/strapi-v4 data provider. Ensure the package is installed correctly.');
  const refineProvider = init(...args);
  const { createRefineAdapter } = await import('@svadmin/refine-adapter');
  return createRefineAdapter(refineProvider);
}
