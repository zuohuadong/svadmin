// Svelte 5 Context — application trees use scoped context while the module-level
// setters remain as a compatibility facade for non-component consumers.

import { createContext } from 'svelte';
import type { DataProvider, AuthProvider, ResourceDefinition, TaskProvider } from './types';
import type { RouterProvider } from './router-provider';
import type { LiveProvider } from './live.svelte';
import { resetNotificationProvider } from './notification.svelte';
import { resetAuditLogProvider } from './audit';
import { resetAccessControlProvider } from './permissions.svelte';
import { resetAdminOptions } from './options.svelte';
import { resetI18n } from './i18n.svelte';
import { resetChatProvider } from './chatProvider.svelte';
import { resetToast } from './toast.svelte';
import { resetTheme } from './theme.svelte';
import {
  currentPath as currentLegacyPath,
  currentPathWithProvider,
  formatLink as formatLegacyLink,
  formatLinkWithProvider,
  navigate as navigateLegacy,
  navigateWithProvider,
  resetRouter,
} from './router';
import { resetUnsavedChanges } from './unsaved-changes.svelte';
import { resetGlobalPath } from './useParsed.svelte';
import { resetLogoutVersion } from './auth-hooks.svelte';
import { resetSidebarCollapsed } from './hooks.svelte';

// ─── DataProvider (supports single or multiple) ─────────────────

/**
 * Accepts either:
 *   - A single DataProvider
 *   - A record of named providers: { default: rest, cms: graphql }
 */
export type DataProviderInput = DataProvider | Record<string, DataProvider>;

export interface AdminContextSource {
  readonly dataProvider: DataProviderInput;
  readonly authProvider?: AuthProvider | null;
  readonly resources: ResourceDefinition[];
  readonly routerProvider?: RouterProvider;
  readonly liveProvider?: LiveProvider;
  readonly taskProvider?: TaskProvider;
}

export interface AdminContextValue {
  readonly providers: Record<string, DataProvider>;
  readonly authProvider: AuthProvider | null;
  readonly resources: ResourceDefinition[];
  readonly routerProvider: RouterProvider | undefined;
  readonly liveProvider: LiveProvider | undefined;
  readonly taskProvider: TaskProvider | undefined;
}

/**
 * Initialization-time snapshot of the owning AdminContext tree.
 *
 * The accessor keeps the scoped context object (whose fields are reactive
 * getters) instead of calling Svelte's getContext from later DOM/query
 * callbacks. When no scoped context exists, getters intentionally continue to
 * read the module-level compatibility setters dynamically.
 */
export interface AdminContextAccessor {
  readonly providers: Record<string, DataProvider> | null;
  readonly authProvider: AuthProvider | null;
  readonly resources: ResourceDefinition[];
  readonly routerProvider: RouterProvider | undefined;
  readonly liveProvider: LiveProvider | undefined;
  readonly taskProvider: TaskProvider | undefined;
  getDataProvider(name?: string): DataProvider;
  getDataProviderNames(): string[];
  getDataProviderForResource(resourceName: string, overrideName?: string): DataProvider;
  getResource(nameOrIdentifier: string): ResourceDefinition;
  currentPath(): string;
  formatLink(path: string): string;
  navigate(path: string, options?: { replaceState?: boolean }): Promise<void>;
  back(): void;
}

const [getRequiredAdminContext, setAdminContext] = createContext<AdminContextValue>();

function normalizeDataProviders(provider: DataProviderInput): Record<string, DataProvider> {
  return isDataProvider(provider)
    ? { default: provider }
    : provider;
}

export function createAdminContext(source: AdminContextSource): AdminContextValue {
  return {
    get providers() { return normalizeDataProviders(source.dataProvider); },
    get authProvider() { return source.authProvider ?? null; },
    get resources() { return source.resources; },
    get routerProvider() { return source.routerProvider; },
    get liveProvider() { return source.liveProvider; },
    get taskProvider() { return source.taskProvider; },
  };
}

/** Provide request/tree-scoped admin state to all descendants. */
export function provideAdminContext(source: AdminContextSource): AdminContextValue {
  const context = createAdminContext(source);
  setAdminContext(context);
  return context;
}

/** Return the current tree context when called during component initialization/render. */
export function getAdminContext(): AdminContextValue | undefined {
  try {
    return getRequiredAdminContext();
  } catch {
    return undefined;
  }
}

let providers = $state<Record<string, DataProvider> | null>(null);

/** Capture the current tree once so delayed callbacks never re-enter getContext. */
export function captureAdminContext(): AdminContextAccessor {
  const scopedContext = getAdminContext();

  const accessor: AdminContextAccessor = {
    get providers() { return scopedContext ? scopedContext.providers : providers; },
    get authProvider() { return scopedContext ? scopedContext.authProvider : authProvider; },
    get resources() { return scopedContext ? scopedContext.resources : resources ?? []; },
    get routerProvider() { return scopedContext ? scopedContext.routerProvider : routerProvider; },
    get liveProvider() { return scopedContext ? scopedContext.liveProvider : liveProviderState; },
    get taskProvider() { return scopedContext ? scopedContext.taskProvider : taskProviderState; },
    getDataProvider(name) {
      const activeProviders = accessor.providers;
      if (!activeProviders) throw new Error('DataProvider not found. Did you call setDataProvider in App.svelte?');
      const key = name ?? 'default';
      const provider = activeProviders[key];
      if (!provider) {
        throw new Error(`DataProvider "${key}" not found. Available: ${Object.keys(activeProviders).join(', ')}`);
      }
      return provider;
    },
    getDataProviderNames() {
      return accessor.providers ? Object.keys(accessor.providers) : [];
    },
    getDataProviderForResource(resourceName, overrideName) {
      if (overrideName) {
        try {
          return accessor.getDataProvider(overrideName);
        } catch {
          // Preserve the historical fallback to the resource/default provider.
        }
      }
      try {
        const resource = accessor.getResource(resourceName);
        const dataProviderName = resource.meta?.dataProviderName as string | undefined;
        if (dataProviderName) return accessor.getDataProvider(dataProviderName);
      } catch {
        // Preserve the historical fallback when a resource is not registered.
      }
      return accessor.getDataProvider();
    },
    getResource(nameOrIdentifier) {
      const resource = accessor.resources.find(
        (candidate) => candidate.identifier === nameOrIdentifier || candidate.name === nameOrIdentifier,
      );
      if (!resource) throw new Error(`Resource "${nameOrIdentifier}" not found in resource definitions.`);
      return resource;
    },
    currentPath() {
      if (scopedContext) return currentPathWithProvider(scopedContext.routerProvider);
      return currentLegacyPath();
    },
    formatLink(path) {
      if (scopedContext) return formatLinkWithProvider(scopedContext.routerProvider, path);
      return formatLegacyLink(path);
    },
    async navigate(path, options) {
      if (scopedContext) {
        await navigateWithProvider(scopedContext.routerProvider, path, options);
        return;
      }
      await navigateLegacy(path, options);
    },
    back() {
      const activeRouter = accessor.routerProvider;
      if (activeRouter?.back) {
        activeRouter.back();
      } else if (typeof window !== 'undefined') {
        window.history.back();
      }
    },
  };

  return accessor;
}

export function setDataProvider(provider: DataProviderInput): void {
  providers = normalizeDataProviders(provider);
}

export function getDataProvider(name?: string): DataProvider {
  return captureAdminContext().getDataProvider(name);
}

export function getDataProviderNames(): string[] {
  return captureAdminContext().getDataProviderNames();
}

export function getDataProviderForResource(resourceName: string, overrideName?: string): DataProvider {
  return captureAdminContext().getDataProviderForResource(resourceName, overrideName);
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
  const activeAuthProvider = captureAdminContext().authProvider;
  if (!activeAuthProvider && !options?.optional) throw new Error('AuthProvider not found. Did you call setAuthProvider in App.svelte?');
  return activeAuthProvider;
}

// ─── Resources ──────────────────────────────────────────────────

let resources = $state.raw<ResourceDefinition[]>([]);

export function setResources(newResources: ResourceDefinition[]): void {
  resources = newResources;
}

export function getResources(): ResourceDefinition[] {
  return captureAdminContext().resources;
}

export function getResource(nameOrIdentifier: string): ResourceDefinition {
  return captureAdminContext().getResource(nameOrIdentifier);
}

// ─── Router Provider ────────────────────────────────────────────

let routerProvider = $state<RouterProvider | undefined>(undefined);

export function setRouterProvider(provider: RouterProvider | undefined): void {
  routerProvider = provider;
}

export function getRouterProvider(): RouterProvider | undefined {
  return captureAdminContext().routerProvider;
}


// ─── Live Provider ──────────────────────────────────────────────

let liveProviderState = $state<LiveProvider | undefined>(undefined);

export function setLiveProvider(provider: LiveProvider): void {
  liveProviderState = provider;
}

export function getLiveProvider(): LiveProvider | undefined {
  return captureAdminContext().liveProvider;
}

// ─── Task Provider ──────────────────────────────────────────────

let taskProviderState = $state<TaskProvider | undefined>(undefined);

export function setTaskProvider(provider: TaskProvider | undefined): void {
  taskProviderState = provider;
}

export function getTaskProvider(): TaskProvider;
export function getTaskProvider(options: { optional: true }): TaskProvider | undefined;
export function getTaskProvider(options?: { optional?: boolean }): TaskProvider | undefined {
  const activeTaskProvider = captureAdminContext().taskProvider;
  if (!activeTaskProvider && !options?.optional) {
    throw new Error('TaskProvider not found. Did you call setTaskProvider in App.svelte?');
  }
  return activeTaskProvider;
}

// ─── Reset — for testing / HMR ─────────────────────────────────

export function resetContext(): void {
  providers = null;
  authProvider = null;
  resources = [];
  routerProvider = undefined;
  liveProviderState = undefined;
  taskProviderState = undefined;
  resetNotificationProvider();
  resetAuditLogProvider();
  resetAccessControlProvider();
  resetAdminOptions();
  resetI18n();
  resetChatProvider();
  resetToast();
  resetTheme();
  resetRouter();
  resetUnsavedChanges();
  resetGlobalPath();
  resetLogoutVersion();
  resetSidebarCollapsed();
}
