import type { DataProvider } from '@svadmin/core';
import { createRefineAdapter } from '@svadmin/refine-adapter';


/**
 * Creates a medusa data provider using the official @refinedev/medusa package.
 * Requires `@refinedev/medusa` to be installed.
 * 
 * @param args Arguments required by @refinedev/medusa
 * @returns A fully compatible svadmin DataProvider
 */
export function createMedusaDataProvider(...args: any[]): DataProvider {
  
  // @ts-ignore
  import * as pkg from '@refinedev/medusa';
  const init = pkg.default || pkg.dataProvider || pkg.DataProvider;
  const refineProvider = init(...args);
  return createRefineAdapter(refineProvider);
}
