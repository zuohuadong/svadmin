import type { DataProvider } from '@svadmin/core';
// Dynamic import used for createRefineAdapter to avoid Vite plugin errors


/**
 * Creates a nestjsx-crud data provider using the official @refinedev/nestjsx-crud package.
 * Requires `@refinedev/nestjsx-crud` to be installed.
 * 
 * @param args Arguments required by @refinedev/nestjsx-crud
 * @returns A fully compatible svadmin DataProvider
 */
export async function createNestjsxCrudDataProvider(...args: any[]): Promise<DataProvider> {
  // @ts-ignore
  const pkg = await import('@refinedev/nestjsx-crud');
  const init = (pkg as any).default || (pkg as any).dataProvider || (pkg as any).DataProvider;
  const refineProvider = init(...args);
  const { createRefineAdapter } = await import('@svadmin/refine-adapter');
  return createRefineAdapter(refineProvider);
}
