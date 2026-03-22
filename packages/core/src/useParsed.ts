// useParsed — parse current URL hash into structured route info

import { currentPath } from './router';
import { getResources } from './context';

interface ParsedRoute {
  resource?: string;
  action?: 'list' | 'create' | 'edit' | 'show';
  id?: string;
  params: Record<string, string>;
}

/**
 * Parse the current hash URL into a structured route object.
 * Returns reactive properties that update when the URL changes.
 *
 * Usage:
 *   const parsed = useParsed();
 *   // parsed.resource === 'posts'
 *   // parsed.action === 'edit'
 *   // parsed.id === '123'
 */
export function useParsed(): ParsedRoute {
  const path = $derived(currentPath());
  const resources = $derived((() => { try { return getResources(); } catch { return []; } })());

  const parsed = $derived.by(() => {
    const p = path;
    const result: ParsedRoute = { params: {} };

    // Parse query params from hash
    const [pathname, queryString] = p.split('?');
    if (queryString) {
      const sp = new URLSearchParams(queryString);
      for (const [k, v] of sp.entries()) {
        result.params[k] = v;
      }
    }

    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return result;

    // First segment is typically the resource name
    const resourceNames = resources.map(r => r.name);
    if (resourceNames.includes(segments[0])) {
      result.resource = segments[0];

      if (segments.length === 1) {
        result.action = 'list';
      } else if (segments[1] === 'create') {
        result.action = 'create';
      } else if (segments[1] === 'edit' && segments[2]) {
        result.action = 'edit';
        result.id = segments[2];
      } else if (segments[1] === 'show' && segments[2]) {
        result.action = 'show';
        result.id = segments[2];
      } else if (segments[1]) {
        // Legacy: /:resource/:id
        result.action = 'show';
        result.id = segments[1];
      }
    }

    return result;
  });

  return {
    get resource() { return parsed.resource; },
    get action() { return parsed.action; },
    get id() { return parsed.id; },
    get params() { return parsed.params; },
  };
}
