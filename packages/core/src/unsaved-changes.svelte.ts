// UnsavedChangesNotifier — guards against accidental navigation with dirty forms
// Supports: browser tab close, hash-based SPA routing, and framework router interception

import { useTranslation } from './i18n.svelte';
import { syncGlobalPath } from './useParsed.svelte';

let dirty = $state(false);

export function setUnsavedChanges(value: boolean) {
  dirty = value;
}

export function resetUnsavedChanges(): void {
  dirty = false;
  _unsavedChangesCleanup?.();
  _unsavedChangesCleanup = null;
}

export function getUnsavedChanges(): boolean {
  return dirty;
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
  const i18n = useTranslation();
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
        if (!confirm(i18n.t('common.unsavedChanges'))) {
          cancel();
        } else {
          dirty = false;
        }
      }
    });
  }

  const onHashChange = (e: HashChangeEvent) => {
    if (!dirty) return;
    if (!confirm(i18n.t('common.unsavedChanges'))) {
      if (e.oldURL) {
        history.replaceState(null, '', new URL(e.oldURL).hash || '#');
        syncGlobalPath();
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
