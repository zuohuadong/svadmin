// Router Provider — abstracts routing strategy (hash, history, SvelteKit, etc.)

export interface RouterProvider {
  /** Navigate to a path */
  go: (options: {
    to: string;
    query?: Record<string, string>;
    hash?: string;
    type?: 'push' | 'replace';
  }) => void;
  /** Navigate back */
  back: () => void;
  /** Parse current URL into structured route info */
  parse: () => {
    resource?: string;
    action?: string;
    id?: string;
    params: Record<string, string>;
    pathname: string;
  };
}

// ─── Hash Router (default) ──────────────────────────────────

export function createHashRouterProvider(): RouterProvider {
  return {
    go({ to, query, type = 'push' }) {
      let url = `#${to}`;
      if (query) {
        const params = new URLSearchParams(query).toString();
        if (params) url += `?${params}`;
      }
      if (type === 'replace') {
        window.location.replace(url);
      } else {
        window.location.hash = to;
      }
    },
    back() {
      history.back();
    },
    parse() {
      const hash = window.location.hash.slice(1) || '/';
      const [pathname, queryString] = hash.split('?');
      const params: Record<string, string> = {};
      if (queryString) {
        for (const [k, v] of new URLSearchParams(queryString).entries()) {
          params[k] = v;
        }
      }
      const segments = pathname.split('/').filter(Boolean);
      return {
        resource: segments[0],
        action: segments[1],
        id: segments[2],
        params,
        pathname,
      };
    },
  };
}

// ─── History Router (HTML5 pushState) ───────────────────────

export function createHistoryRouterProvider(basePath = ''): RouterProvider {
  return {
    go({ to, query, type = 'push' }) {
      let url = `${basePath}${to}`;
      if (query) {
        const params = new URLSearchParams(query).toString();
        if (params) url += `?${params}`;
      }
      if (type === 'replace') {
        history.replaceState(null, '', url);
      } else {
        history.pushState(null, '', url);
      }
      // Dispatch event so other parts of the app can react
      window.dispatchEvent(new PopStateEvent('popstate'));
    },
    back() {
      history.back();
    },
    parse() {
      const pathname = window.location.pathname.replace(basePath, '') || '/';
      const params: Record<string, string> = {};
      for (const [k, v] of new URLSearchParams(window.location.search).entries()) {
        params[k] = v;
      }
      const segments = pathname.split('/').filter(Boolean);
      return {
        resource: segments[0],
        action: segments[1],
        id: segments[2],
        params,
        pathname,
      };
    },
  };
}
