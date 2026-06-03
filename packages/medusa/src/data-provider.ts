/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DataProvider } from '@svadmin/core';
import { createRefineAdapter } from '@svadmin/refine-adapter';


/**
 * Creates a medusa data provider using the official @refinedev/medusa package.
 * Requires `@refinedev/medusa` to be installed.
 * 
 * @param args Arguments required by @refinedev/medusa
 * @returns A fully compatible svadmin DataProvider
 */
export async function createMedusaDataProvider(...args: any[]): Promise<DataProvider> {
 
  // @ts-expect-error -- refine type mismatch
  const pkg = await import('@refinedev/medusa');
  const init = (pkg as any).default || (pkg as any).dataProvider || (pkg as any).DataProvider;
  const refineProvider = init(...args);
  return createRefineAdapter(refineProvider);
}
