import type { DataProvider } from '@svadmin/core';
import { createRefineAdapter } from '@svadmin/refine-adapter';


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
  return createRefineAdapter(refineProvider);
}
