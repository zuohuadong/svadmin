// UnsavedChangesNotifier — guards against accidental navigation with dirty forms
// Supports: browser tab close, hash-based SPA routing, and framework router interception

import { t } from './i18n.svelte';

let dirty = $state(false);

/** Mark whether the current form has unsaved changes */
export function setUnsavedChanges(value: boolean) {
  dirty = value;
}

export function getUnsavedChanges(): boolean {
  return dirty;
}

/**
 * Navigation interceptor callback type.
 * Frameworks like SvelteKit can register a cancel function here.
 * Return `true` to allow navigation, `false` to block it.
 */
interface NavigationGuard {
  (opts: { cancel: () => void }): void;
}

let _navigationGuard: NavigationGuard | null = null;

/**
 * Register a framework-level navigation guard.
 * 
 * In SvelteKit, call this from your root layout:
 * ```ts
 * import { beforeNavigate } from '$app/navigation';
 * import { registerNavigationGuard } from '@svadmin/core';
 * 
 * registerNavigationGuard(({ cancel }) => {
 *   beforeNavigate(({ cancel: kitCancel }) => {
 *     cancel = kitCancel;
 *   });
 * });
 * ```
 * 
 * Or more idiomatically, use the built-in `initUnsavedChangesNotifier` 
 * and pass a `beforeNavigate` callback.
 */
export function registerNavigationGuard(guard: NavigationGuard): void {
  _navigationGuard = guard;
}

/**
 * Initialize the UnsavedChangesNotifier.
 * 
 * @param options.beforeNavigate - Framework-level navigation interceptor.
 *   For SvelteKit: pass the `beforeNavigate` function from `$app/navigation`.
 *   For hash-based SPAs: omit this, hash navigation is handled automatically.
 * 
 * @example SvelteKit
 * ```svelte
 * <script>
 *   import { beforeNavigate } from '$app/navigation';
 *   import { initUnsavedChangesNotifier } from '@svadmin/core';
 *   initUnsavedChangesNotifier({ beforeNavigate });
 * </script>
 * ```
 * 
 * @example Hash-based SPA
 * ```ts
 * initUnsavedChangesNotifier();
 * ```
 */
let _unsavedChangesCleanup: (() => void) | null = null;

export function initUnsavedChangesNotifier(options?: {
  beforeNavigate?: (callback: (nav: { cancel: () => void }) => void) => void;
}) {
  if (typeof window === 'undefined') return;
  _unsavedChangesCleanup?.();

  const onBeforeUnload = (e: BeforeUnloadEvent) => {
    if (!dirty) return;
    e.preventDefault();
    e.returnValue = '';
  };
  window.addEventListener('beforeunload', onBeforeUnload);

  if (options?.beforeNavigate) {
    options.beforeNavigate(({ cancel }) => {
      if (dirty) {
        if (!confirm(t('common.unsavedChanges'))) {
          cancel();
        } else {
          dirty = false;
        }
      }
    });
  }

  const onHashChange = (e: HashChangeEvent) => {
    if (!dirty) return;
    if (!confirm(t('common.unsavedChanges'))) {
      if (e.oldURL) {
        history.replaceState(null, '', new URL(e.oldURL).hash || '#');
      }
    } else {
      dirty = false;
    }
  };
  window.addEventListener('hashchange', onHashChange);

  _unsavedChangesCleanup = () => {
    window.removeEventListener('beforeunload', onBeforeUnload);
    window.removeEventListener('hashchange', onHashChange);
  };
  return _unsavedChangesCleanup;
}
