import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { get } from 'svelte/store';
import type { RouterProvider } from '@svadmin/core';

export function createSvelteKitRouterProvider(): RouterProvider {
  return {
    go({ to, query, type = 'push' }) {
      let url = to;
      if (query) {
        const params = new URLSearchParams(query).toString();
        if (params) url += url.includes('?') ? `&${params}` : `?${params}`;
      }
      
      if (type === 'replace') {
        goto(url, { replaceState: true });
      } else {
        goto(url);
      }
    },
    back() {
      if (typeof window !== 'undefined') {
        history.back();
      }
    },
    parse() {
      let pathname = '/';
      let params: Record<string, string> = {};
      
      try {
        const p = get(page);
        if (p?.url) {
          pathname = p.url.pathname;
        }
        if (p?.params) {
          params = { ...p.params };
        }
        if (p?.url?.searchParams) {
          p.url.searchParams.forEach((v, k) => {
            params[k] = v;
          });
        }
      } catch (e) {
        // Fallback for SSR or non-SvelteKit context
        if (typeof window !== 'undefined') {
          pathname = window.location.pathname;
          new URLSearchParams(window.location.search).forEach((v, k) => {
            params[k] = v;
          });
        }
      }

      return {
        pathname,
        params
      };
    }
  };
}
