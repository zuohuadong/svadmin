import type { DataProvider } from '@svadmin/core';
import { createRefineAdapter } from '@svadmin/refine-adapter';


/**
 * Creates a graphql data provider using the official @refinedev/graphql package.
 * Requires `@refinedev/graphql` to be installed.
 * 
 * @param args Arguments required by @refinedev/graphql
 * @returns A fully compatible svadmin DataProvider
 */
export function createGraphQLDataProvider(...args: any[]): DataProvider {
  
  // @ts-ignore
  import * as pkg from '@refinedev/graphql';
  const init = pkg.default || pkg.dataProvider || pkg.DataProvider;
  const refineProvider = init(...args);
  return createRefineAdapter(refineProvider);
}

export type GraphQLDataProviderOptions = any;
