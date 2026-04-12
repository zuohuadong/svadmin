/// <reference types="@sveltejs/kit" />
import { goto } from '$app/navigation';
import { page } from '$app/state';
import type { RouterProvider } from '@svadmin/core';

export function createSvelteKitRouterProvider(): RouterProvider {
  return {
    go({ to, query, hash, type = 'push' }) {
      let url = to;
      if (query) {
        const params = new URLSearchParams(query).toString();
        if (params) url += url.includes('?') ? `&${params}` : `?${params}`;
      }
      if (hash) {
        url += url.includes('#') ? `&${hash}` : `#${hash}`;
      }
      
      if (type === 'replace') {
        goto(url, { replaceState: true });
      } else {
        goto(url);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    },
    back() {
      if (typeof window !== 'undefined') {
        history.back();
      }
    },
    formatLink(path: string) {
      return path.startsWith('/') ? path : `/${path}`;
    },
    parse() {
      let pathname = '/';
      let params: Record<string, string> = {};
      
      try {
        if (page.url) {
          pathname = page.url.pathname;
        }
        if (page.url?.searchParams) {
          page.url.searchParams.forEach((v: string, k: string) => {
            params[k] = v;
          });
        }
      } catch {
        if (typeof window !== 'undefined') {
          pathname = window.location.pathname;
          new URLSearchParams(window.location.search).forEach((v, k) => {
            params[k] = v;
          });
        }
      }

      let p_params: Record<string, string> = {};
      try { p_params = (page.params ?? {}) as Record<string, string>; } catch {}

      return {
        resource: p_params?.resource,
        action: p_params?.action,
        id: p_params?.id,
        pathname,
        params
      };
    }
  };
}
