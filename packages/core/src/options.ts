// Global admin options — centralized configuration
// Provides defaults that individual hooks can override

import { setContext, getContext } from 'svelte';
import type { MutationMode } from './types';
import type { InvalidateScope } from './hooks.svelte';

const OPTIONS_KEY = Symbol('admin-options');

export interface AdminOptions {
  mutationMode?: MutationMode;
  warnWhenUnsavedChanges?: boolean;
  syncWithLocation?: boolean;
  liveMode?: 'auto' | 'manual' | 'off';
  disableServerSideValidation?: boolean;
  undoableTimeout?: number;
}

const defaultOptions: AdminOptions = {
  mutationMode: 'pessimistic',
  warnWhenUnsavedChanges: false,
  syncWithLocation: false,
  liveMode: 'auto',
  disableServerSideValidation: false,
  undoableTimeout: 5000,
};

export function setAdminOptions(options: AdminOptions): void {
  setContext(OPTIONS_KEY, { ...defaultOptions, ...options });
}

export function getAdminOptions(): AdminOptions {
  try {
    const opts = getContext<AdminOptions>(OPTIONS_KEY);
    return opts ?? defaultOptions;
  } catch {
    return defaultOptions;
  }
}
