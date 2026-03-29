// Router — path matching + navigation (supports hash & history via RouterProvider)

import type { RouterProvider } from './router-provider';

interface RouteMatch {
  route: string;
  params: Record<string, string>;
}

// Store a reference to the active RouterProvider (set by router-state.svelte.ts)
let _routerProvider: RouterProvider | undefined;

export function setActiveRouterProvider(provider: RouterProvider | undefined) {
  _routerProvider = provider;
}

// Parse route pattern like /products/edit/:id into regex
function compileRoute(pattern: string): { regex: RegExp; keys: string[] } {
  const keys: string[] = [];
  const regexStr = pattern
    .replace(/:(\w+)/g, (_, key) => {
      keys.push(key);
      return '([^/]+)';
    })
    .replace(/\//g, '\\/');
  return { regex: new RegExp(`^${regexStr}$`), keys };
}

/**
 * Match a pathname against a list of route patterns.
 * Accepts both hash paths (#/foo) and plain paths (/foo).
 */
export function matchRoute(
  pathname: string,
  routes: string[]
): RouteMatch | null {
  const path = pathname.replace(/^#/, '').split('?')[0] || '/';

  for (const pattern of routes) {
    const { regex, keys } = compileRoute(pattern);
    const match = path.match(regex);
    if (match) {
      const params: Record<string, string> = {};
      keys.forEach((key, i) => {
        params[key] = match[i + 1];
      });
      return { route: pattern, params };
    }
  }
  return null;
}

/**
 * Navigate to a path. Uses RouterProvider if available, falls back to hash.
 */
export function navigate(path: string, options?: { replaceState?: boolean }): void {
  if (_routerProvider) {
    _routerProvider.go({ to: path, type: options?.replaceState ? 'replace' : 'push' });
  } else {
    window.location.hash = '#' + path.replace(/^#/, '');
  }
}

export function currentPath(): string {
  if (_routerProvider) {
    const parsed = _routerProvider.parse();
    return parsed.pathname || '/';
  }
  return window.location.hash.replace(/^#/, '') || '/';
}
