// Global admin options — centralized configuration (module-level $state)
// Provides defaults that individual hooks can override

import type { MutationMode } from './types';

export type InvalidateScope = 'all' | 'resourceAll' | 'detail' | 'list' | false | string[];

export interface TextTransformers {
  humanize: (text: string) => string;
  plural: (text: string) => string;
  singular: (text: string) => string;
}

export interface OvertimeConfig {
  enabled?: boolean;
  interval?: number;
  onInterval?: (elapsedInterval: number, context?: { resource?: string; action?: string; id?: string | number }) => void;
}

export interface AdminOptions {
  mutationMode?: MutationMode;
  warnWhenUnsavedChanges?: boolean;
  syncWithLocation?: boolean;
  liveMode?: 'auto' | 'manual' | 'off';
  disableServerSideValidation?: boolean;
  undoableTimeout?: number;
  textTransformers?: Partial<TextTransformers>;
  redirect?: {
    afterCreate?: 'list' | 'edit' | 'show' | false;
    afterEdit?: 'list' | 'edit' | 'show' | false;
    afterClone?: 'list' | 'edit' | 'show' | false;
  };
  reactQuery?: {
    staleTime?: number;
    gcTime?: number;
    refetchOnWindowFocus?: boolean;
  };
  title?: {
    text?: string;
    icon?: string;
  };
  overtime?: OvertimeConfig;
  breadcrumb?: false | 'default';
  disableRouteChangeHandler?: boolean;
  onLiveEvent?: (event: unknown) => void;
  menuItems?: (items: { name: string; route: string; label: string; icon?: string; parentName?: string; order?: number }[]) => { name: string; route: string; label: string; icon?: string; parentName?: string; order?: number }[];
  /** Default page size for tables. Falls back to localStorage 'svadmin-default-page-size' or 10. */
  defaultPageSize?: number;
}

const defaultTextTransformers: TextTransformers = {
  humanize: (text: string) => text.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
  plural: (text: string) => text.endsWith('s') ? text : text + 's',
  singular: (text: string) => text.endsWith('s') ? text.slice(0, -1) : text,
};

const defaultOptions: AdminOptions = {
  mutationMode: 'pessimistic',
  warnWhenUnsavedChanges: false,
  syncWithLocation: false,
  liveMode: 'auto',
  disableServerSideValidation: false,
  undoableTimeout: 5000,
  textTransformers: defaultTextTransformers,
  redirect: { afterCreate: 'list', afterEdit: 'list', afterClone: 'list' },
  breadcrumb: 'default',
  disableRouteChangeHandler: false,
};

let adminOptions = $state<AdminOptions>(defaultOptions);

export function setAdminOptions(options: AdminOptions, merge?: boolean): void {
  if (merge) {
    adminOptions = {
      ...adminOptions,
      ...options,
      textTransformers: { ...adminOptions.textTransformers, ...options.textTransformers },
      redirect: { ...adminOptions.redirect, ...options.redirect },
      reactQuery: { ...adminOptions.reactQuery, ...options.reactQuery },
      title: { ...adminOptions.title, ...options.title },
      overtime: { ...adminOptions.overtime, ...options.overtime },
    };
  } else {
    adminOptions = {
      ...defaultOptions,
      ...options,
      textTransformers: { ...defaultTextTransformers, ...options.textTransformers },
      redirect: { ...defaultOptions.redirect, ...options.redirect },
      reactQuery: { ...defaultOptions.reactQuery, ...options.reactQuery },
      title: { ...defaultOptions.title, ...options.title },
      overtime: { ...defaultOptions.overtime, ...options.overtime },
    };
  }
}

export function getAdminOptions(): AdminOptions {
  return adminOptions;
}

export function resetAdminOptions(): void {
  adminOptions = defaultOptions;
}

/** Get the resolved text transformers (always returns full set) */
export function getTextTransformers(): TextTransformers {
  const opts = getAdminOptions();
  return { ...defaultTextTransformers, ...opts.textTransformers };
}
