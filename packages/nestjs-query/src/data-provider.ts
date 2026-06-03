/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DataProvider } from '@svadmin/core';
import { createRefineAdapter } from '@svadmin/refine-adapter';


/**
 * Creates a nestjs-query data provider using the official @refinedev/nestjs-query package.
 * Requires `@refinedev/nestjs-query` to be installed.
 * 
 * @param args Arguments required by @refinedev/nestjs-query
 * @returns A fully compatible svadmin DataProvider
 */
export async function createNestjsQueryDataProvider(...args: any[]): Promise<DataProvider> {
 
  // @ts-expect-error -- refine type mismatch
  const pkg = await import('@refinedev/nestjs-query');
  const init = (pkg as any).default || (pkg as any).dataProvider || (pkg as any).DataProvider;
  const refineProvider = init(...args);
  return createRefineAdapter(refineProvider);
}
