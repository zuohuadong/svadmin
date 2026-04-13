import type { DataProvider } from '@svadmin/core';
// Dynamic import used for createRefineAdapter to avoid Vite plugin errors


/**
 * Creates a medusa data provider using the official @refinedev/medusa package.
 * Requires `@refinedev/medusa` to be installed.
 * 
 * @param args Arguments required by @refinedev/medusa
 * @returns A fully compatible svadmin DataProvider
 */
export async function createMedusaDataProvider(...args: any[]): Promise<DataProvider> {
 
  // @ts-ignore
  const pkg = await import('@refinedev/medusa');
  const init = (pkg as any).default || (pkg as any).dataProvider || (pkg as any).DataProvider;
  const refineProvider = init(...args);
  const { createRefineAdapter } = await import('@svadmin/refine-adapter');
  return createRefineAdapter(refineProvider);
}
