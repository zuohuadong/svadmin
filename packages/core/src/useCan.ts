// useCan — reactive permission check hook

import { canAccessAsync } from './permissions';
import type { Action, AccessControlResult } from './permissions';

interface UseCanResult {
  allowed: boolean;
  reason?: string;
  isLoading: boolean;
}

/**
 * Reactive permission check. Calls canAccessAsync() and returns reactive state.
 * Usage: const can = useCan('posts', 'delete');
 *        if (can.allowed) { ... }
 */
export function useCan(resource: string, action: Action, params?: Record<string, unknown>): UseCanResult {
  let allowed = $state(true);
  let reason = $state<string | undefined>(undefined);
  let isLoading = $state(true);

  // Run the async check
  canAccessAsync(resource, action, params).then((result: AccessControlResult) => {
    allowed = result.can;
    reason = result.reason;
    isLoading = false;
  }).catch(() => {
    allowed = true; // default to allowed on error
    isLoading = false;
  });

  return {
    get allowed() { return allowed; },
    get reason() { return reason; },
    get isLoading() { return isLoading; },
  };
}
