import type { DataProvider } from '@svadmin/core';
import { createRefineAdapter } from '@svadmin/refine-adapter';


/**
 * Creates a nestjs-query data provider using the official @refinedev/nestjs-query package.
 * Requires `@refinedev/nestjs-query` to be installed.
 * 
 * @param args Arguments required by @refinedev/nestjs-query
 * @returns A fully compatible svadmin DataProvider
 */
export function createNestjsQueryDataProvider(...args: any[]): DataProvider {
  
  // @ts-ignore
  import * as pkg from '@refinedev/nestjs-query';
  const init = pkg.default || pkg.dataProvider || pkg.DataProvider;
  const refineProvider = init(...args);
  return createRefineAdapter(refineProvider);
}
