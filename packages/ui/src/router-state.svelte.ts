// Shared reactive hash router state — .svelte.ts enables $state at module level
import { matchRoute } from '@svadmin/core/router';

let _route = $state('/');
let _params: Record<string, string> = $state({});
let _initialized = false;

const ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/',
  '/:resource',
  '/:resource/create',
  '/:resource/edit/:id',
  '/:resource/show/:id',
];

function sync() {
  const hash = window.location.hash;
  const m = matchRoute(hash, ROUTES);
  _route = m?.route ?? '/';
  _params = m?.params ?? {};
}

export function initRouter() {
  if (_initialized) return;
  _initialized = true;
  sync();
  window.addEventListener('hashchange', sync);
}

export function getRoute(): string {
  return _route;
}

export function getParams(): Record<string, string> {
  return _params;
}
