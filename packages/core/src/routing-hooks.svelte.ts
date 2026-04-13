import { currentPath, navigate } from './router';
import { getResource, getResources, getRouterProvider } from './context.svelte';
import { useParsed } from './useParsed.svelte';

// ─── routing-hooks.svelte.ts ───────────────────────────────────

export function useGetToPath() {
  const routerProvider = getRouterProvider();
  const parsed = useParsed();

  return (options: { resource?: string; action?: 'list' | 'create' | 'edit' | 'show' | 'clone'; id?: string | number; meta?: Record<string, unknown> }) => {
    const { resource, action, id, meta } = options;
    if (!resource) return '/';

    // Support nested resources: use meta.parentPath or auto-detect from current URL
    let basePath: string;
    if (meta?.parentPath) {
      basePath = `${meta.parentPath}/${resource}`;
    } else if (parsed.resourcePath && parsed.resource === resource) {
      // Re-use the current nested path context (e.g., /teams/123/users)
      basePath = `/${parsed.resourcePath}`;
    } else {
      basePath = `/${resource}`;
    }

    let path = basePath;
    if (action === 'create') path += '/create';
    else if (action === 'edit' && id) path += `/edit/${id}`;
    else if (action === 'show' && id) path += `/show/${id}`;
    else if (action === 'clone' && id) path += `/clone/${id}`;

    // Apply router mapping if the router provider defines custom path transformers
    if (routerProvider?.go) {
      // SvelteKit path generation can be injected here.
    }
    return path;
  };
}

export function useGo() {
  const getToPath = useGetToPath();

  return (options: { to?: string; query?: Record<string, unknown>; type?: 'push' | 'replace'; resource?: string; action?: 'list' | 'create' | 'edit' | 'show' | 'clone'; id?: string | number }) => {
    let targetUrl = options.to;
    if (!targetUrl && options.resource) {
      targetUrl = getToPath({ resource: options.resource, action: options.action, id: options.id });
    }
    if (!targetUrl) targetUrl = '/';

    if (options.query && Object.keys(options.query).length > 0) {
      const qs = new URLSearchParams(Object.entries(options.query).map(([k, v]) => [k, String(v)])).toString();
      if (qs) {
        targetUrl += targetUrl.includes('?') ? `&${qs}` : `?${qs}`;
      }
    }

    const routerProvider = getRouterProvider();
    if (routerProvider?.go) {
      routerProvider.go({ to: targetUrl, type: options.type });
    } else {
      navigate(targetUrl, options.type === 'replace' ? { replaceState: true } : undefined);
    }
  };
}

export function useBack() {
  return () => {
    const routerProvider = getRouterProvider();
    if (routerProvider?.back) {
      routerProvider.back();
    } else if (typeof window !== 'undefined') {
      window.history.back();
    }
  };
}

/**
 * useLink replaces standard <a> tags with Svelte routing-aware links 
 * (to avoid full page reloads in SSR apps)
 */
export function useLink() {
  return () => {
    const routerProvider = getRouterProvider() as Record<string, unknown> | undefined;
    return (routerProvider?.Link as string) ?? 'a';
  };
}

export function useResource(resourceName?: string) {
  const parsed = useParsed();

  // Derived resource — re-evaluates when parsed.resource or resourceName changes
  const resolvedResource = $derived.by(() => {
    const target = resourceName ?? parsed.resource;
    if (!target) return undefined;
    try {
      return getResource(target);
    } catch {
      return undefined;
    }
  });

  return {
    get resource() { return resolvedResource; },
    get resources() { return getResources(); },
    get identifier() { return resolvedResource?.identifier ?? resolvedResource?.name; },
    /** Resolve a resource by name — useful for dynamic lookups inside callbacks */
    select: (name: string) => {
      try {
        const res = getResource(name);
        return { resource: res, identifier: res.identifier ?? res.name };
      } catch {
        return { resource: undefined, identifier: undefined };
      }
    },
  };
}

export function useNavigation() {
  const go = useGo();
  const parsed = useParsed();

  return {
    create: (resource?: string) => go({ type: 'push', resource: resource ?? parsed.resourcePath ?? parsed.resource, action: 'create' }),
    edit: (resource?: string, id?: string | number) => go({ type: 'push', resource: resource ?? parsed.resourcePath ?? parsed.resource, action: 'edit', id: id ?? parsed.id }),
    clone: (resource?: string, id?: string | number) => go({ type: 'push', resource: resource ?? parsed.resourcePath ?? parsed.resource, action: 'clone', id: id ?? parsed.id }),
    show: (resource?: string, id?: string | number) => go({ type: 'push', resource: resource ?? parsed.resourcePath ?? parsed.resource, action: 'show', id: id ?? parsed.id }),
    list: (resource?: string) => go({ type: 'push', resource: resource ?? parsed.resourcePath ?? parsed.resource, action: 'list' }),
    push: (url: string) => go({ to: url, type: 'push' }),
    replace: (url: string) => go({ to: url, type: 'replace' }),
    goBack: useBack(),
  };
}
