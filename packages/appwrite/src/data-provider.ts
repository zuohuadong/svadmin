import type { DataProvider } from '@svadmin/core';
// Dynamic import used for createRefineAdapter to avoid Vite plugin errors


/**
 * Creates a appwrite data provider using the official @refinedev/appwrite package.
 * Requires `@refinedev/appwrite` to be installed.
 * 
 * @param args Arguments required by @refinedev/appwrite
 * @returns A fully compatible svadmin DataProvider
 */
export async function createAppwriteDataProvider(...args: any[]): Promise<DataProvider> {
 
  // @ts-ignore
  const pkg = await import('@refinedev/appwrite');
  const init = (pkg as any).default || (pkg as any).dataProvider || (pkg as any).DataProvider;
  if (typeof init !== 'function') throw new Error('[svadmin] Failed to resolve @refinedev/appwrite data provider. Ensure the package is installed correctly.');
  const refineProvider = init(...args);
  const { createRefineAdapter } = await import('@svadmin/refine-adapter');
  return createRefineAdapter(refineProvider);
}

export type AppwriteProviderOptions = any;
