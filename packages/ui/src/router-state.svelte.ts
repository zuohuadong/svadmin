// Shared reactive hash router state — .svelte.ts enables $state at module level
import { matchRoute } from '@svadmin/core/router';
import type { RouterProvider } from '@svadmin/core';

let _route = $state('/');
let _params: Record<string, string> = $state({});
let _initialized = false;
let _provider: RouterProvider | undefined;

const ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/update-password',
  '/',
  '/:resource',
  '/:resource/create',
  '/:resource/edit/:id',
  '/:resource/show/:id',
];

function sync() {
  if (_provider) {
    // Use RouterProvider for parsing
    const parsed = _provider.parse();
    const path = parsed.pathname || '/';
    const m = matchRoute(path.startsWith('#') ? path : `#${path}`, ROUTES);
    _route = m?.route ?? '/';
    _params = { ...(m?.params ?? {}), ...parsed.params };
  } else {
    // Fallback: direct hash parsing
    const hash = window.location.hash;
    const m = matchRoute(hash, ROUTES);
    _route = m?.route ?? '/';
    _params = m?.params ?? {};
  }
}

export function initRouter(provider?: RouterProvider) {
  if (_initialized) return;
  _initialized = true;
  _provider = provider;
  sync();
  window.addEventListener('hashchange', sync);
  window.addEventListener('popstate', sync);
}

export function getRoute(): string {
  return _route;
}

export function getParams(): Record<string, string> {
  return _params;
}

export function getRouterProviderInstance(): RouterProvider | undefined {
  return _provider;
}
