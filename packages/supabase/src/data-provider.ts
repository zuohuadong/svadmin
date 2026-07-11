import type { DataProvider } from '@svadmin/core';
import { createRefineAdapter } from '@svadmin/refine-adapter';
// Static import — dynamic import() gets dropped by Vite/Rollup in static SPA builds
import { dataProvider as refineDataProvider } from '@refinedev/supabase';

/**
 * Creates a supabase data provider using the official @refinedev/supabase package.
 * Requires `@refinedev/supabase` to be installed.
 * 
 * @param args Arguments required by @refinedev/supabase
 * @returns A fully compatible svadmin DataProvider
 */
export function createSupabaseDataProvider(
  ...args: Parameters<typeof refineDataProvider>
): DataProvider {
  if (typeof refineDataProvider !== 'function') {
    throw new Error(
      '[svadmin/supabase] Failed to resolve @refinedev/supabase data provider. ' +
      'Ensure the package is installed correctly: bun add @refinedev/supabase'
    );
  }
  const refineProvider = refineDataProvider(...args);
  return createRefineAdapter(refineProvider);
}
