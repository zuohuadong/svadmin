// Shared reactive hash router state — .svelte.ts enables $state at module level
import { matchRoute, setActiveRouterProvider } from '@svadmin/core/router';
import type { RouterProvider } from '@svadmin/core';

let _route = $state('/');
let _params: Record<string, string> = $state({});
let _path = $state('/');
let _initialized = false;
let _provider: RouterProvider | undefined;

const ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/update-password',
  '/settings',
  '/settings/:tab',
  '/',
  '/:resource',
  '/:resource/create',
  '/:resource/edit/:id',
  '/:resource/show/:id',
  '/:resource/clone/:id',
  '/:parent/:parentId/:resource',
  '/:parent/:parentId/:resource/create',
  '/:parent/:parentId/:resource/edit/:id',
  '/:parent/:parentId/:resource/show/:id',
  '/:parent/:parentId/:resource/clone/:id',
];

function sync() {
  let path: string;

  if (_provider) {
    const parsed = _provider.parse();
    path = parsed.pathname || '/';
    const m = matchRoute(path, ROUTES);
    _route = m?.route ?? '/';
    _path = path;
    _params = { ...(m?.params ?? {}), ...parsed.params };
  } else {
    path = typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') || '/' : '/';
    const m = matchRoute(path, ROUTES);
    _route = m?.route ?? '/';
    _path = path;
    _params = m?.params ?? {};
  }
}

export function initRouter(provider?: RouterProvider) {
  if (_initialized) return;
  _initialized = true;
  _provider = provider;
  setActiveRouterProvider(provider);
  sync();
  if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
  }
}

export function getRoute(): string {
  return _route;
}

export function getPath(): string {
  return _path;
}

export function getParams(): Record<string, string> {
  return _params;
}

export function getRouterProviderInstance(): RouterProvider | undefined {
  return _provider;
}
