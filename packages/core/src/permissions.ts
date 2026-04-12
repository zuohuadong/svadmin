// Permission / Access Control

// ─── Types ────────────────────────────────────────────────────

/** Actions that can be checked for access control. Extensible via string literal union. */
export type Action = 'list' | 'show' | 'create' | 'edit' | 'delete' | 'export' | 'field' | (string & {});

export interface CanParams {
  resource: string;
  action: Action;
  params?: { id?: string | number; [key: string]: unknown };
}

export interface CanResult {
  can: boolean;
  reason?: string;
}



/**
 * Formal Access Control Provider interface.
 * Implement this to define your authorization logic.
 *
 * @example
 * ```ts
 * const accessControlProvider: AccessControlProvider = {
 *   can: async ({ resource, action, params }) => {
 *     if (resource === 'users' && action === 'delete') {
 *       return { can: false, reason: 'Cannot delete users' };
 *     }
 *     return { can: true };
 *   },
 *   options: {
 *     buttons: { enableAccessControl: true, hideIfUnauthorized: false },
 *   },
 * };
 * ```
 */
export interface AccessControlProvider {
  can: (params: CanParams | CanParams[]) => Promise<CanResult | CanResult[]>;
  options?: {
    buttons?: {
      /** Enable access control checks on CRUD buttons globally. Default: false */
      enableAccessControl?: boolean;
      /** Hide buttons when unauthorized instead of disabling. Default: false */
      hideIfUnauthorized?: boolean;
    };
  };
}

// ─── State ────────────────────────────────────────────────────

let provider: AccessControlProvider | null = null;

// ─── API ──────────────────────────────────────────────────────

/**
 * Register an AccessControlProvider.
 */
export function setAccessControlProvider(p: AccessControlProvider): void {
  provider = p;
}

/** Get the current AccessControlProvider (or null) */
export function getAccessControlProvider(): AccessControlProvider | null {
  return provider;
}

export function resetAccessControlProvider(): void {
  provider = null;
}

/** Get global button options from the AccessControlProvider */
export function getAccessControlOptions() {
  return provider?.options ?? {};
}

/**
 * Async access check. 
 * Supports both single capability requests or an array of batched checks.
 */
export async function canAccessAsync(params: CanParams[]): Promise<CanResult[]>;
export async function canAccessAsync(resource: string, action: Action, params?: Record<string, unknown>): Promise<CanResult>;
export async function canAccessAsync(resourceOrBatch: string | CanParams[], action?: Action, params?: Record<string, unknown>): Promise<CanResult | CanResult[]> {
  if (!provider) {
    return Array.isArray(resourceOrBatch)
      ? resourceOrBatch.map(() => ({ can: true }))
      : { can: true };
  }
  
  if (Array.isArray(resourceOrBatch)) {
    return provider.can(resourceOrBatch);
  }
  
  return provider.can({ resource: resourceOrBatch, action: action!, params }) as Promise<CanResult>;
}
