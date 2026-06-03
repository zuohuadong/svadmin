/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DataProvider } from '@svadmin/core';
import { createRefineAdapter } from '@svadmin/refine-adapter';

/**
 * Creates a Hasura data provider using the official @refinedev/hasura package.
 * Requires `graphql-request` and `@refinedev/hasura` to be installed.
 * 
 * @param client The GraphQLClient instance
 * @param options Optional configuration for the Hasura data provider
 * @returns A fully compatible svadmin DataProvider
 */
export async function createHasuraDataProvider(client: any, options?: any): Promise<DataProvider> {
  const pkg = (await import('@refinedev/hasura')) as any;
  const init: any = pkg.default || pkg.dataProvider || pkg.DataProvider;
  const refineHasuraProvider = init(client, options);
  return createRefineAdapter(refineHasuraProvider);
}
