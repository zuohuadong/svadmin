/// <reference types="@sveltejs/kit" />
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { get } from 'svelte/store';
// NOTE: $app/stores is deprecated in SvelteKit 2.x in favor of $app/state (runes).
// However, $app/state requires a .svelte.ts file to use runes. This works for now.
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
        const p = get(page) as any;
        if (p?.url) {
          pathname = p.url.pathname;
        }
        if (p?.params) {
          // Do not spread path params into query params
          // SvelteKit route params (e.g. /posts/edit/[id]) are handled at the root
        }
        if (p?.url?.searchParams) {
          p.url.searchParams.forEach((v: string, k: string) => {
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

      let p_params = {} as any;
      try { p_params = (get(page) as any)?.params ?? {}; } catch {}

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
