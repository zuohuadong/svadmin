import type { DataProvider as SvadminDataProvider } from '@svadmin/core';

/**
 * Adapter to consume an official @refinedev/* data provider in SvelteAdmin.
 * Refine's DataProvider interface directly matches the core interface 
 * definition of @svadmin/core.
 */
export function createRefineAdapter(refineProvider: any): SvadminDataProvider {
  if (!refineProvider || typeof refineProvider !== 'object') {
    throw new Error('[svadmin] createRefineAdapter: expected a valid Refine DataProvider object, got ' + String(refineProvider));
  }
  const adapter: SvadminDataProvider = {
    getApiUrl: () => refineProvider.getApiUrl(),
    getList: refineProvider.getList.bind(refineProvider),
    getOne: refineProvider.getOne.bind(refineProvider),
    create: refineProvider.create.bind(refineProvider),
    update: refineProvider.update.bind(refineProvider),
    deleteOne: refineProvider.deleteOne.bind(refineProvider),
  };

  // Only attach optional methods if they actually exist
  if (refineProvider.getMany) adapter.getMany = refineProvider.getMany.bind(refineProvider);
  if (refineProvider.createMany) adapter.createMany = refineProvider.createMany.bind(refineProvider);
  if (refineProvider.updateMany) adapter.updateMany = refineProvider.updateMany.bind(refineProvider);
  if (refineProvider.deleteMany) adapter.deleteMany = refineProvider.deleteMany.bind(refineProvider);
  if (refineProvider.custom) adapter.custom = refineProvider.custom.bind(refineProvider);

  return adapter;
}
