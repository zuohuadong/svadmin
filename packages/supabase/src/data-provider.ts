import type { DataProvider } from '@svadmin/core';
import { createRefineAdapter } from '@svadmin/refine-adapter';
// Static import — dynamic import() gets dropped by Vite/Rollup in static SPA builds
// @ts-ignore Peer dependency
import { dataProvider as refineDataProvider } from '@refinedev/supabase';

/**
 * Creates a supabase data provider using the official @refinedev/supabase package.
 * Requires `@refinedev/supabase` to be installed.
 * 
 * @param args Arguments required by @refinedev/supabase
 * @returns A fully compatible svadmin DataProvider
 */
export function createSupabaseDataProvider(...args: any[]): DataProvider {
  const init: any = refineDataProvider;
  if (typeof init !== 'function') {
    throw new Error(
      '[svadmin/supabase] Failed to resolve @refinedev/supabase data provider. ' +
      'Ensure the package is installed correctly: bun add @refinedev/supabase'
    );
  }
  const refineProvider = init(...args);
  return createRefineAdapter(refineProvider);
}
