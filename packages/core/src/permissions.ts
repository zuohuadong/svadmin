// Permission / Access Control


export type Action = 'list' | 'create' | 'edit' | 'delete' | 'export';

export interface AccessControlResult {
  can: boolean;
  reason?: string;
}

export type AccessControlFn = (
  resource: string,
  action: Action,
  params?: Record<string, unknown>,
) => AccessControlResult | Promise<AccessControlResult>;

let accessControlFn: AccessControlFn | null = null;

export function setAccessControl(fn: AccessControlFn): void {
  accessControlFn = fn;
}

export function canAccess(resource: string, action: Action, params?: Record<string, unknown>): AccessControlResult {
  if (!accessControlFn) return { can: true };
  const result = accessControlFn(resource, action, params);
  if (result instanceof Promise) {
    console.warn('[permissions] canAccess called synchronously but accessControlFn returned a Promise. Defaulting to { can: true }. Use canAccessAsync() instead.');
    return { can: true };
  }
  return result;
}

export async function canAccessAsync(resource: string, action: Action, params?: Record<string, unknown>): Promise<AccessControlResult> {
  if (!accessControlFn) return { can: true };
  return accessControlFn(resource, action, params);
}

// Example usage:
// setAccessControl((resource, action) => {
//   if (resource === 'users' && action === 'delete') return { can: false, reason: '无权删除用户' };
//   return { can: true };
// });
