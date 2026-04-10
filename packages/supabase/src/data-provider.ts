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
  // Dynamic import — @refinedev/supabase is a peerDependency
  const pkg = await import('@refinedev/supabase');
  const init = (pkg as any).default || (pkg as any).dataProvider || (pkg as any).DataProvider;
  const refineProvider = init(...args);
  return createRefineAdapter(refineProvider);
}
