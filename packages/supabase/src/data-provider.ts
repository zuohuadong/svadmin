import type { DataProvider } from '@svadmin/core';
// Dynamic import used for createRefineAdapter to avoid Vite plugin errors
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
  const { createRefineAdapter } = await import('@svadmin/refine-adapter');
  return createRefineAdapter(refineProvider);
}
