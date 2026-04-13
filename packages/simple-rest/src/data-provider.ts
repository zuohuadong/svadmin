import type { DataProvider } from '@svadmin/core';
// Dynamic import used for createRefineAdapter to avoid Vite plugin errors


/**
 * Creates a simple-rest data provider using the official @refinedev/simple-rest package.
 * Requires `@refinedev/simple-rest` to be installed.
 * 
 * @param args Arguments required by @refinedev/simple-rest
 * @returns A fully compatible svadmin DataProvider
 */
export async function createSimpleRestDataProvider(...args: any[]): Promise<DataProvider> {
  // @ts-ignore
  const pkg = await import('@refinedev/simple-rest');
  const init = (pkg as any).default || (pkg as any).dataProvider || (pkg as any).DataProvider;
  if (typeof init !== 'function') throw new Error('[svadmin] Failed to resolve @refinedev/simple-rest data provider. Ensure the package is installed correctly.');
  const refineProvider = init(...args);
  const { createRefineAdapter } = await import('@svadmin/refine-adapter');
  return createRefineAdapter(refineProvider);
}

export type SimpleRestOptions = any;
