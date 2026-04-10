import type { DataProvider } from '@svadmin/core';
import { createRefineAdapter } from '@svadmin/refine-adapter';


/**
 * Creates a supabase data provider using the official @refinedev/supabase package.
 * Requires `@refinedev/supabase` to be installed.
 * 
 * @param args Arguments required by @refinedev/supabase
 * @returns A fully compatible svadmin DataProvider
 */
export function createSupabaseDataProvider(...args: any[]): DataProvider {
  
  // @ts-ignore
  import * as pkg from '@refinedev/supabase';
  const init = pkg.default || pkg.dataProvider || pkg.DataProvider;
  const refineProvider = init(...args);
  return createRefineAdapter(refineProvider);
}
