// UnsavedChangesNotifier — warns user before leaving page with unsaved changes
// Svelte 5 component using runes

// No lifecycle imports needed — uses module-level $state pattern

let warnWhenUnsavedChanges = $state(false);

/**
 * Call this to mark the form as dirty (has unsaved changes).
 * When set to true, navigating away or closing the tab will trigger a warning.
 */
export function setUnsavedChanges(dirty: boolean) {
  warnWhenUnsavedChanges = dirty;
}

export function getUnsavedChanges(): boolean {
  return warnWhenUnsavedChanges;
}

const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
  if (warnWhenUnsavedChanges) {
    e.preventDefault();
    // Modern browsers ignore custom messages but require returnValue to be set
    e.returnValue = '';
    return '';
  }
};

/**
 * Initialize the UnsavedChangesNotifier.
 * Call this in your root layout or AdminApp component.
 * It handles both browser tab close and in-app navigation.
 */
export function initUnsavedChangesNotifier() {
  if (typeof window === 'undefined') return;

  window.addEventListener('beforeunload', beforeUnloadHandler);

  // For hash-based navigation, intercept hashchange
  const hashChangeHandler = (e: HashChangeEvent) => {
    if (warnWhenUnsavedChanges) {
      const confirmed = confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) {
        e.preventDefault();
        // Restore original hash
        if (e.oldURL) {
          const oldHash = new URL(e.oldURL).hash;
          history.replaceState(null, '', oldHash || '#');
        }
      } else {
        warnWhenUnsavedChanges = false;
      }
    }
  };

  window.addEventListener('hashchange', hashChangeHandler);

  return () => {
    window.removeEventListener('beforeunload', beforeUnloadHandler);
    window.removeEventListener('hashchange', hashChangeHandler);
  };
}
