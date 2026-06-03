/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DataProvider } from '@svadmin/core';
import { createRefineAdapter } from '@svadmin/refine-adapter';


/**
 * Creates a nestjsx-crud data provider using the official @refinedev/nestjsx-crud package.
 * Requires `@refinedev/nestjsx-crud` to be installed.
 * 
 * @param args Arguments required by @refinedev/nestjsx-crud
 * @returns A fully compatible svadmin DataProvider
 */
export async function createNestjsxCrudDataProvider(...args: any[]): Promise<DataProvider> {
  const pkg = await import('@refinedev/nestjsx-crud');
  const init = (pkg as any).default || (pkg as any).dataProvider || (pkg as any).DataProvider;
  const refineProvider = init(...args);
  return createRefineAdapter(refineProvider);
}
