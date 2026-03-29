import { currentPath, navigate } from './router';
import { getResource, getResources, getRouterProvider } from './context.svelte';
import { useParsed } from './useParsed.svelte';

// ─── routing-hooks.svelte.ts ───────────────────────────────────

export function useGetToPath() {
  const routerProvider = getRouterProvider();

  return (options: { resource?: string; action?: 'list' | 'create' | 'edit' | 'show'; id?: string | number; meta?: Record<string, unknown> }) => {
    const { resource, action, id } = options;
    if (!resource) return '/';
    let path = `/${resource}`;
    if (action === 'create') path += '/create';
    else if (action === 'edit' && id) path += `/edit/${id}`;
    else if (action === 'show' && id) path += `/show/${id}`;

    // Apply router mapping if the router provider defines custom path transformers
    if (routerProvider?.go) {
      // SvelteKit path generation can be injected here.
    }
    return path;
  };
}

export function useGo() {
  const getToPath = useGetToPath();
  const routerProvider = getRouterProvider();

  return (options: { to?: string; query?: Record<string, unknown>; type?: 'push' | 'replace'; resource?: string; action?: 'list' | 'create' | 'edit' | 'show' | 'clone'; id?: string | number }) => {
    let targetUrl = options.to;
    if (!targetUrl && options.resource) {
      targetUrl = getToPath({ resource: options.resource, action: options.action === 'clone' ? 'edit' : options.action, id: options.id });
    }
    if (!targetUrl) targetUrl = '/';

    if (options.query && Object.keys(options.query).length > 0) {
      const qs = new URLSearchParams(options.query as Record<string, string>).toString();
      targetUrl += `?${qs}`;
    }

    if (routerProvider?.go) {
      routerProvider.go({ to: targetUrl, type: options.type });
    } else {
      navigate(targetUrl, options.type === 'replace' ? { replaceState: true } : undefined);
    }
  };
}

export function useBack() {
  const routerProvider = getRouterProvider();
  return () => {
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
  const routerProvider = getRouterProvider() as Record<string, unknown> | undefined;
  return (routerProvider?.Link as string) ?? 'a';
}

export function useResource(resourceName?: string) {
  const parsed = useParsed();
  const targetResource = resourceName ?? parsed.resource;
  if (!targetResource) {
    return { resource: undefined, resources: getResources() };
  }
  try {
    const resource = getResource(targetResource);
    return { resource, resources: getResources() };
  } catch {
    return { resource: undefined, resources: getResources() };
  }
}

export function useNavigation() {
  const go = useGo();
  const parsed = useParsed();

  return {
    create: (resource?: string) => go({ type: 'push', resource: resource ?? parsed.resource, action: 'create' }),
    edit: (resource?: string, id?: string | number) => go({ type: 'push', resource: resource ?? parsed.resource, action: 'edit', id: id ?? parsed.id }),
    clone: (resource?: string, id?: string | number) => go({ type: 'push', resource: resource ?? parsed.resource, action: 'clone', id: id ?? parsed.id }),
    show: (resource?: string, id?: string | number) => go({ type: 'push', resource: resource ?? parsed.resource, action: 'show', id: id ?? parsed.id }),
    list: (resource?: string) => go({ type: 'push', resource: resource ?? parsed.resource, action: 'list' }),
    push: (url: string) => go({ to: url, type: 'push' }),
    replace: (url: string) => go({ to: url, type: 'replace' }),
    goBack: useBack(),
  };
}
