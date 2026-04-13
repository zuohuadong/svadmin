import type { DataProvider } from '@svadmin/core';
import { createRefineAdapter } from '@svadmin/refine-adapter';
/**
 * Creates a supabase data provider using the official @refinedev/supabase package.
 * Requires `@refinedev/supabase` to be installed.
 * 
 * @param args Arguments required by @refinedev/supabase
 * @returns A fully compatible svadmin DataProvider
 */
export async function createSupabaseDataProvider(...args: any[]): Promise<DataProvider> {
  // @ts-ignore Peer dependency
  const pkg = (await import('@refinedev/supabase')) as any;
  const init: any = pkg.dataProvider || pkg.default || pkg.DataProvider;
  if (typeof init !== 'function') throw new Error('[svadmin] Failed to resolve @refinedev/supabase data provider. Ensure the package is installed correctly.');
  const refineProvider = init(...args);
  return createRefineAdapter(refineProvider);
}
