import type { DataProvider } from '@svadmin/core';
import { createRefineAdapter } from '@svadmin/refine-adapter';


/**
 * Creates a nestjsx-crud data provider using the official @refinedev/nestjsx-crud package.
 * Requires `@refinedev/nestjsx-crud` to be installed.
 * 
 * @param args Arguments required by @refinedev/nestjsx-crud
 * @returns A fully compatible svadmin DataProvider
 */
export function createNestjsxCrudDataProvider(...args: any[]): DataProvider {
  
  // @ts-ignore
  import * as pkg from '@refinedev/nestjsx-crud';
  const init = pkg.default || pkg.dataProvider || pkg.DataProvider;
  const refineProvider = init(...args);
  return createRefineAdapter(refineProvider);
}
