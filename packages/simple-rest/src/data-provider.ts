import type { DataProvider } from '@svadmin/core';
import { createRefineAdapter } from '@svadmin/refine-adapter';


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
  return createRefineAdapter(refineProvider);
}

export type SimpleRestOptions = any;
