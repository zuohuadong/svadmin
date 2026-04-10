import type { DataProvider } from '@svadmin/core';
import { createRefineAdapter } from '@svadmin/refine-adapter';


/**
 * Creates a airtable data provider using the official @refinedev/airtable package.
 * Requires `@refinedev/airtable` to be installed.
 * 
 * @param args Arguments required by @refinedev/airtable
 * @returns A fully compatible svadmin DataProvider
 */
export function createAirtableDataProvider(...args: any[]): DataProvider {
  
  // @ts-ignore
  import * as pkg from '@refinedev/airtable';
  const init = pkg.default || pkg.dataProvider || pkg.DataProvider;
  const refineProvider = init(...args);
  return createRefineAdapter(refineProvider);
}
