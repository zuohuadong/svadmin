// Svelte context — provides DataProvider, AuthProvider, and Resources to all components

import { getContext, setContext } from 'svelte';
import type { DataProvider, AuthProvider, ResourceDefinition } from './types';
import type { RouterProvider } from './router-provider';

const DATA_PROVIDER_KEY = Symbol('data-provider');
const AUTH_PROVIDER_KEY = Symbol('auth-provider');
const RESOURCES_KEY = Symbol('resources');
const ROUTER_PROVIDER_KEY = Symbol('router-provider');

// ─── DataProvider (supports single or multiple) ─────────────────

/**
 * Accepts either:
 *   - A single DataProvider (backwards compatible)
 *   - A record of named providers: { default: rest, cms: graphql }
 */
export type DataProviderInput = DataProvider | Record<string, DataProvider>;

export function setDataProvider(provider: DataProviderInput): void {
  if (isDataProvider(provider)) {
    setContext(DATA_PROVIDER_KEY, { default: provider } as Record<string, DataProvider>);
  } else {
    setContext(DATA_PROVIDER_KEY, provider as Record<string, DataProvider>);
  }
}

export function getDataProvider(name?: string): DataProvider {
  const providers = getContext<Record<string, DataProvider>>(DATA_PROVIDER_KEY);
  if (!providers) throw new Error('DataProvider not found. Did you call setDataProvider in App.svelte?');
  const key = name ?? 'default';
  const provider = providers[key];
  if (!provider) {
    throw new Error(`DataProvider "${key}" not found. Available: ${Object.keys(providers).join(', ')}`);
  }
  return provider;
}

export function getDataProviderNames(): string[] {
  const providers = getContext<Record<string, DataProvider>>(DATA_PROVIDER_KEY);
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

export function setAuthProvider(provider: AuthProvider): void {
  setContext(AUTH_PROVIDER_KEY, provider);
}

export function getAuthProvider(): AuthProvider {
  const provider = getContext<AuthProvider>(AUTH_PROVIDER_KEY);
  if (!provider) throw new Error('AuthProvider not found. Did you call setAuthProvider in App.svelte?');
  return provider;
}

// ─── Resources ──────────────────────────────────────────────────

export function setResources(resources: ResourceDefinition[]): void {
  setContext(RESOURCES_KEY, resources);
}

export function getResources(): ResourceDefinition[] {
  const resources = getContext<ResourceDefinition[]>(RESOURCES_KEY);
  if (!resources) throw new Error('Resources not found. Did you call setResources in App.svelte?');
  return resources;
}

export function getResource(name: string): ResourceDefinition {
  const resources = getResources();
  const resource = resources.find(r => r.name === name);
  if (!resource) throw new Error(`Resource "${name}" not found in resource definitions.`);
  return resource;
}

// ─── Router Provider ────────────────────────────────────────────

export function setRouterProvider(provider: RouterProvider): void {
  setContext(ROUTER_PROVIDER_KEY, provider);
}

export function getRouterProvider(): RouterProvider | undefined {
  return getContext<RouterProvider>(ROUTER_PROVIDER_KEY);
}
