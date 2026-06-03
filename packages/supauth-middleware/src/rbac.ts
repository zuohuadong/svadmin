import type { VoltRole, VoltUser, ClaimsMapping } from "./types";
import { ROLE_PERMISSIONS } from "./types";

const DEFAULT_CLAIMS_MAPPING: ClaimsMapping = {
  sub: "sub",
  email: "email",
  name: "name",
  role: "role",
  tenantId: "app_metadata.supaoauth.current_org_id",
  teamId: "app_metadata.supaoauth.current_team_id",
  permissions: "app_metadata.supaoauth.permissions",
};

/** 嵌套属性访问 (支持 "a.b.c" 格式) */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

/** 验证角色值 */
export function validateRole(role: string): VoltRole {
  const validRoles: VoltRole[] = ["superadmin", "admin", "manager", "user", "viewer", "guest"];
  if (validRoles.includes(role as VoltRole)) {
    return role as VoltRole;
  }
  return "user";
}

/**
 * 从 JWT claims 提取业务角色。
 * GoTrue 模式下 JWT role 只有 anon/authenticated，业务角色在 app_metadata.supaoauth.roles 数组中。
 */
function extractRole(rawRole: unknown, claims: Record<string, unknown>): VoltRole {
  if (Array.isArray(rawRole) && rawRole.length > 0) {
    return validateRole(String(rawRole[0]));
  }
  if (typeof rawRole === "string" && rawRole !== "anon" && rawRole !== "authenticated") {
    return validateRole(rawRole);
  }
  const supaoauthRoles = getNestedValue(claims, "app_metadata.supaoauth.roles");
  if (Array.isArray(supaoauthRoles) && supaoauthRoles.length > 0) {
    return validateRole(String(supaoauthRoles[0]));
  }
  return "user";
}

/** 从 JWT claims 映射 VoltUser */
export function mapClaimsToUser(
  claims: Record<string, unknown>,
  mapping?: Partial<ClaimsMapping>,
): VoltUser {
  const m = { ...DEFAULT_CLAIMS_MAPPING, ...mapping };

  const id = String(getNestedValue(claims, m.sub) ?? "");
  const email = String(getNestedValue(claims, m.email) ?? "");
  const rawName = getNestedValue(claims, m.name) ?? getNestedValue(claims, "preferred_username") ?? "";
  const name = String(rawName);
  const rawRole = getNestedValue(claims, m.role);
  const role = extractRole(rawRole, claims);
  const tenantId = String(
    getNestedValue(claims, m.tenantId)
    ?? getNestedValue(claims, "app_metadata.tenant_id")
    ?? "default"
  );
  const teamId = String(
    getNestedValue(claims, m.teamId)
    ?? getNestedValue(claims, "app_metadata.team_id")
    ?? ""
  ) || undefined;
  const rawPerms = getNestedValue(claims, m.permissions)
    ?? getNestedValue(claims, "app_metadata.permissions");
  const permissions = Array.isArray(rawPerms)
    ? rawPerms.map(String)
    : ROLE_PERMISSIONS[role];

  return { id, email, name, role, tenantId, teamId, permissions, rawClaims: claims };
}

/** 检查用户是否有指定权限 */
export function hasPermission(user: VoltUser, permission: string): boolean {
  if (user.permissions.includes("*")) return true;
  if (user.permissions.includes(permission)) return true;
  const [resource] = permission.split(":");
  if (resource && user.permissions.includes(`${resource}:*`)) return true;
  return false;
}

/** 检查用户是否属于指定角色或更高 */
export function hasMinRole(user: VoltUser, minRole: VoltRole): boolean {
  const hierarchy: VoltRole[] = ["superadmin", "admin", "manager", "user", "viewer", "guest"];
  const userIndex = hierarchy.indexOf(user.role);
  const minIndex = hierarchy.indexOf(minRole);
  return userIndex <= minIndex;
}
