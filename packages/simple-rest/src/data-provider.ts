import type { DataProvider } from '@svadmin/core';
import { createRefineAdapter } from '@svadmin/refine-adapter';


/**
 * Creates a simple-rest data provider using the official @refinedev/simple-rest package.
 * Requires `@refinedev/simple-rest` to be installed.
 * 
 * @param args Arguments required by @refinedev/simple-rest
 * @returns A fully compatible svadmin DataProvider
 */
export function createSimpleRestDataProvider(...args: any[]): DataProvider {
  
  // @ts-ignore
  import * as pkg from '@refinedev/simple-rest';
  const init = pkg.default || pkg.dataProvider || pkg.DataProvider;
  const refineProvider = init(...args);
  return createRefineAdapter(refineProvider);
}

export type SimpleRestOptions = any;
