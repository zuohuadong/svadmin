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
  '/2fa',
  '/settings',
  '/settings/:tab',
  '/',
  '/public-profile',
  '/public-profile/projects/:columns',
  '/public-profile/activity',
  '/public-profile/teams',
  '/public-profile/profiles/:variant',
  '/account/get-started',
  '/account/company-profile',
  '/account/settings-plain',
  '/account/settings-sidebar',
  '/account/settings-enterprise',
  '/account/import-members',
  '/account/members-starter',
  '/account/team-members',
  '/account/security-log',
  '/network/user-cards',
  '/network/team-crew',
  '/store-inventory/dashboard',
  '/mail/inbox',
  '/calendar/page',
  '/todo/all-tasks',
  '/crm/dashboard',
  '/real-estate/page',
  '/ai/start',
  '/user-management/users',
  '/account/home/user-profile',
  '/account/home/settings-plain',
  '/account/home/get-started',
  '/account/notifications',
  '/account/integrations',
  '/network/user-cards/nft',
  '/network/user-table/team-crew',
  '/account/members/team-members',
  '/authentication/branded/2fa',
  '/authentication/error-404',
  '/authentication/error-500',
  '/account/appearance',
  '/account/home/company-profile',
  '/account/home/settings-sidebar',
  '/account/api-keys',
  '/account/members/import-members',
  '/account/security/security-log',
  '/account/home/settings-enterprise',
  '/account/members/members-starter',
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
  _provider = provider;
  setActiveRouterProvider(provider);
  if (_initialized) {
    sync(); // Re-sync manually since provider might have switched format/URLs
    return;
  }
  _initialized = true;
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
