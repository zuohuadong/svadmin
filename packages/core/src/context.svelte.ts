// Svelte 5 Context — module-level $state singletons (no setContext/getContext required)
// This removes the constraint that hooks must be called at component init time.

import type { DataProvider, AuthProvider, ResourceDefinition } from './types';
import type { RouterProvider } from './router-provider';

// ─── DataProvider (supports single or multiple) ─────────────────

/**
 * Accepts either:
 *   - A single DataProvider
 *   - A record of named providers: { default: rest, cms: graphql }
 */
export type DataProviderInput = DataProvider | Record<string, DataProvider>;

let providers = $state<Record<string, DataProvider> | null>(null);

export function setDataProvider(provider: DataProviderInput): void {
  if (isDataProvider(provider)) {
    providers = { default: provider } as Record<string, DataProvider>;
  } else {
    providers = provider as Record<string, DataProvider>;
  }
}

export function getDataProvider(name?: string): DataProvider {
  if (!providers) throw new Error('DataProvider not found. Did you call setDataProvider in App.svelte?');
  const key = name ?? 'default';
  const provider = providers[key];
  if (!provider) {
    throw new Error(`DataProvider "${key}" not found. Available: ${Object.keys(providers).join(', ')}`);
  }
  return provider;
}

export function getDataProviderNames(): string[] {
  return providers ? Object.keys(providers) : [];
}

export function getDataProviderForResource(resourceName: string, overrideName?: string): DataProvider {
  if (overrideName) {
    try {
      return getDataProvider(overrideName);
    } catch {
      // ignore
    }
  }
  try {
    const resource = getResource(resourceName);
    const dpName = resource.meta?.dataProviderName as string | undefined;
    if (dpName) return getDataProvider(dpName);
  } catch {
    // ignore
  }
  return getDataProvider();
}

function isDataProvider(value: unknown): value is DataProvider {
  return (
    value !== null &&
    typeof value === 'object' &&
    'getList' in value &&
    typeof (value as DataProvider).getList === 'function'
  );
}

// ─── Auth Provider ──────────────────────────────────────────────

let authProvider = $state<AuthProvider | null>(null);

export function setAuthProvider(provider: AuthProvider | null | undefined): void {
  authProvider = provider || null;
}

export function getAuthProvider(): AuthProvider;
export function getAuthProvider(options: { optional: true }): AuthProvider | null;
export function getAuthProvider(options?: { optional?: boolean }): AuthProvider | null {
  if (!authProvider && !options?.optional) throw new Error('AuthProvider not found. Did you call setAuthProvider in App.svelte?');
  return authProvider;
}

// ─── Resources ──────────────────────────────────────────────────

let resources = $state.raw<ResourceDefinition[]>([]);

export function setResources(newResources: ResourceDefinition[]): void {
  resources = newResources;
}

export function getResources(): ResourceDefinition[] {
  return resources ?? [];
}

export function getResource(nameOrIdentifier: string): ResourceDefinition {
  const rList = getResources();
  const resource = rList.find(r => r.identifier === nameOrIdentifier || r.name === nameOrIdentifier);
  if (!resource) throw new Error(`Resource "${nameOrIdentifier}" not found in resource definitions.`);
  return resource;
}

// ─── Router Provider ────────────────────────────────────────────

let routerProvider = $state<RouterProvider | undefined>(undefined);

export function setRouterProvider(provider: RouterProvider): void {
  routerProvider = provider;
}

export function getRouterProvider(): RouterProvider | undefined {
  return routerProvider;
}


// ─── Live Provider ──────────────────────────────────────────────

let liveProviderState = $state<import('./live.svelte').LiveProvider | undefined>(undefined);

export function setLiveProvider(provider: import('./live.svelte').LiveProvider): void {
  liveProviderState = provider;
}

export function getLiveProvider(): import('./live.svelte').LiveProvider | undefined {
  return liveProviderState;
}
