/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DataProvider } from '@svadmin/core';
import { createRefineAdapter } from '@svadmin/refine-adapter';


/**
 * Creates a airtable data provider using the official @refinedev/airtable package.
 * Requires `@refinedev/airtable` to be installed.
 * 
 * @param args Arguments required by @refinedev/airtable
 * @returns A fully compatible svadmin DataProvider
 */
export async function createAirtableDataProvider(...args: any[]): Promise<DataProvider> {
  const pkg = await import('@refinedev/airtable');
  const init = (pkg as any).default || (pkg as any).dataProvider || (pkg as any).DataProvider;
  const refineProvider = init(...args);
  return createRefineAdapter(refineProvider);
}
