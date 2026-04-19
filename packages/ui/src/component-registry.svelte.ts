/**
 * Component Registry — Svelte Context-based DI for component injection.
 *
 * Allows users to override any registered component via the `components`
 * prop on `AdminApp`, while providing sensible defaults.
 */
import { getContext, setContext, type Component } from 'svelte';

// ─── Overridable component slots ────────────────────────────────
export interface ComponentRegistry {
  // Layout primitives
  Layout: Component<any>;
  Sidebar: Component<any>;
  Header: Component<any>;

  // Pages
  LoginPage: Component<any>;
  AutoTable: Component<any>;
  AutoForm: Component<any>;
  ShowPage: Component<any>;

  // Shadcn primitives
  Button: Component<any>;
  Input: Component<any>;
  Badge: Component<any>;
  Skeleton: Component<any>;

  // ─── Extended slots (optional) ──────────────────────────────
  // These allow deeper customization without replacing entire Layout/Header.

  /** Custom dashboard page component (replaces default welcome message) */
  DashboardPage?: Component<any>;
  /** Custom breadcrumbs component (replaces built-in Breadcrumbs) */
  Breadcrumbs?: Component<any>;
  /** Custom theme toggle button (replaces built-in Sun/Moon toggle) */
  ThemeToggle?: Component<any>;
  /** Custom user menu / avatar dropdown in the header */
  UserMenu?: Component<any>;
  /** Custom notification panel / bell icon in the header */
  NotificationPanel?: Component<any>;
  /** Custom task queue drawer / task center trigger in the header */
  TaskQueueDrawer?: Component<any>;
}

const REGISTRY_KEY = 'svadmin:components';

/** Set the component registry in context (called by AdminApp). */
export function setComponentRegistry(registry: ComponentRegistry): void {
  setContext(REGISTRY_KEY, registry);
}

/** Retrieve the full component registry from context. */
export function getComponentRegistry(): ComponentRegistry {
  return getContext<ComponentRegistry>(REGISTRY_KEY);
}

/** Retrieve a single component by name from the registry. */
export function useComponent<K extends keyof ComponentRegistry>(
  name: K,
): ComponentRegistry[K] {
  return getComponentRegistry()[name];
}
