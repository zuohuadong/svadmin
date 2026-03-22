// Svelte context — provides DataProvider, AuthProvider, and Resources to all components

import { getContext, setContext } from 'svelte';
import type { DataProvider, AuthProvider, ResourceDefinition } from './types';

const DATA_PROVIDER_KEY = Symbol('data-provider');
const AUTH_PROVIDER_KEY = Symbol('auth-provider');
const RESOURCES_KEY = Symbol('resources');

// ─── Setters (called once in App.svelte) ────────────────────────

export function setDataProvider(provider: DataProvider): void {
  setContext(DATA_PROVIDER_KEY, provider);
}

export function setAuthProvider(provider: AuthProvider): void {
  setContext(AUTH_PROVIDER_KEY, provider);
}

export function setResources(resources: ResourceDefinition[]): void {
  setContext(RESOURCES_KEY, resources);
}

// ─── Getters (called from any child component) ──────────────────

export function getDataProvider(): DataProvider {
  const provider = getContext<DataProvider>(DATA_PROVIDER_KEY);
  if (!provider) throw new Error('DataProvider not found. Did you call setDataProvider in App.svelte?');
  return provider;
}

export function getAuthProvider(): AuthProvider {
  const provider = getContext<AuthProvider>(AUTH_PROVIDER_KEY);
  if (!provider) throw new Error('AuthProvider not found. Did you call setAuthProvider in App.svelte?');
  return provider;
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
