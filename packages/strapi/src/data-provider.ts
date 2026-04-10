import type { DataProvider } from '@svadmin/core';
import { createRefineAdapter } from '@svadmin/refine-adapter';


/**
 * Creates a strapi data provider using the official @refinedev/strapi-v4 package.
 * Requires `@refinedev/strapi-v4` to be installed.
 * 
 * @param args Arguments required by @refinedev/strapi-v4
 * @returns A fully compatible svadmin DataProvider
 */
export function createStrapiDataProvider(...args: any[]): DataProvider {
  
  // @ts-ignore
  import * as pkg from '@refinedev/strapi-v4';
  const init = pkg.default || pkg.dataProvider || pkg.DataProvider;
  const refineProvider = init(...args);
  return createRefineAdapter(refineProvider);
}
