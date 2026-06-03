/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DataProvider } from '@svadmin/core';
import { createRefineAdapter } from '@svadmin/refine-adapter';


/**
 * Creates a graphql data provider using the official @refinedev/graphql package.
 * Requires `@refinedev/graphql` to be installed.
 * 
 * @param args Arguments required by @refinedev/graphql
 * @returns A fully compatible svadmin DataProvider
 */
export async function createGraphQLDataProvider(...args: any[]): Promise<DataProvider> {
  const pkg = await import('@refinedev/graphql');
  const init = (pkg as any).default || (pkg as any).dataProvider || (pkg as any).DataProvider;
  const refineProvider = init(...args);
  return createRefineAdapter(refineProvider);
}

export type GraphQLDataProviderOptions = any;
