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

let provider: AccessControlProvider | null = $state(null);

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

// ─── Feature Gate ─────────────────────────────────────────────

/**
 * 角色层级定义 (高权 → 低权)
 */
const ROLE_HIERARCHY = ["superadmin", "admin", "manager", "user", "viewer", "guest"];

export interface FeatureGateConfig {
  /** 允许访问的角色列表 */
  roles?: string[];
  /** 需要的最低角色 (含以上所有角色) */
  minRole?: string;
  /** 需要的权限列表 (全部匹配) */
  permissions?: string[];
}

export interface FeatureGateUser {
  role: string;
  permissions: string[];
}

/**
 * 创建功能门控函数 — 基于角色和权限判断用户是否可访问某功能。
 *
 * @example
 * ```ts
 * const canUseCode = createFeatureGate({
 *   minRole: 'manager',
 *   permissions: ['code:execute'],
 * });
 *
 * if (canUseCode(user)) { ... }
 * ```
 */
export function createFeatureGate(config: FeatureGateConfig): (user: FeatureGateUser) => boolean {
  return (user: FeatureGateUser): boolean => {
    // 角色白名单
    if (config.roles && !config.roles.includes(user.role)) {
      return false;
    }

    // 最低角色层级检查
    if (config.minRole) {
      const userIndex = ROLE_HIERARCHY.indexOf(user.role);
      const minIndex = ROLE_HIERARCHY.indexOf(config.minRole);
      if (userIndex === -1 || minIndex === -1 || userIndex > minIndex) {
        return false;
      }
    }

    // 权限检查 (全部匹配)
    if (config.permissions && config.permissions.length > 0) {
      const hasAll = config.permissions.every((permission) => {
        if (user.permissions.includes("*")) return true;
        if (user.permissions.includes(permission)) return true;
        const [resource] = permission.split(":");
        if (resource && user.permissions.includes(`${resource}:*`)) return true;
        return false;
      });
      if (!hasAll) return false;
    }

    return true;
  };
}
