import type { DataProvider } from '@svadmin/core';
import { createRefineAdapter } from '@svadmin/refine-adapter';


/**
 * Creates a appwrite data provider using the official @refinedev/appwrite package.
 * Requires `@refinedev/appwrite` to be installed.
 * 
 * @param args Arguments required by @refinedev/appwrite
 * @returns A fully compatible svadmin DataProvider
 */
export function createAppwriteDataProvider(...args: any[]): DataProvider {
  
  // @ts-ignore
  import * as pkg from '@refinedev/appwrite';
  const init = pkg.default || pkg.dataProvider || pkg.DataProvider;
  const refineProvider = init(...args);
  return createRefineAdapter(refineProvider);
}

export type AppwriteProviderOptions = any;
