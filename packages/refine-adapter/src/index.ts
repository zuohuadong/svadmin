import type { DataProvider as SvadminDataProvider } from '@svadmin/core';

type RequiredRefineDataProvider = Pick<
  SvadminDataProvider,
  'getList' | 'getOne' | 'create' | 'update' | 'deleteOne'
>;

type OptionalRefineDataProvider = Partial<
  Pick<SvadminDataProvider, 'getApiUrl' | 'getMany' | 'createMany' | 'updateMany' | 'deleteMany' | 'custom'>
>;

export type RefineDataProviderLike = RequiredRefineDataProvider & OptionalRefineDataProvider;

const requiredMethods = [
  'getList',
  'getOne',
  'create',
  'update',
  'deleteOne',
] as const satisfies readonly (keyof RequiredRefineDataProvider)[];

const optionalMethods = [
  'getMany',
  'createMany',
  'updateMany',
  'deleteMany',
  'custom',
] as const satisfies readonly (keyof OptionalRefineDataProvider)[];

function isObjectLike(value: unknown): value is Record<PropertyKey, unknown> {
  return typeof value === 'object' && value !== null;
}

function assertRefineDataProvider(value: unknown): asserts value is RefineDataProviderLike {
  if (!isObjectLike(value)) {
    throw new Error('[svadmin] createRefineAdapter: expected a valid Refine DataProvider object, got ' + String(value));
  }

  for (const method of requiredMethods) {
    if (typeof value[method] !== 'function') {
      throw new Error(`[svadmin] createRefineAdapter: missing required Refine DataProvider method "${method}"`);
    }
  }
}

/**
 * Adapter to consume an official @refinedev/* data provider in SvelteAdmin.
 * Refine's DataProvider interface directly matches the core interface 
 * definition of @svadmin/core.
 */
export function createRefineAdapter(refineProvider: unknown): SvadminDataProvider {
  assertRefineDataProvider(refineProvider);

  const adapter: SvadminDataProvider = {
    getApiUrl: () => refineProvider.getApiUrl?.() ?? '',
    getList: refineProvider.getList.bind(refineProvider),
    getOne: refineProvider.getOne.bind(refineProvider),
    create: refineProvider.create.bind(refineProvider),
    update: refineProvider.update.bind(refineProvider),
    deleteOne: refineProvider.deleteOne.bind(refineProvider),
  };

  // Only attach optional methods if they actually exist
  for (const method of optionalMethods) {
    const handler = refineProvider[method];
    if (typeof handler === 'function') {
      adapter[method] = handler.bind(refineProvider) as never;
    }
  }

  return adapter;
}
