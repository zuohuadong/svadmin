/** 用户角色层级 */
export type VoltRole =
  | "superadmin"
  | "admin"
  | "manager"
  | "user"
  | "viewer"
  | "guest";

/** 角色权限映射 */
export const ROLE_PERMISSIONS: Record<VoltRole, string[]> = {
  superadmin: ["*"],
  admin: [
    "projects:read", "projects:write", "projects:delete",
    "users:read", "users:write", "users:delete",
    "automation:read", "automation:write", "automation:delete",
    "settings:read", "settings:write",
    "chat:read", "chat:write",
    "code:read", "code:write", "code:execute",
    "knowledge:read", "knowledge:write", "knowledge:admin",
    "models:read",
    "audit:read",
  ],
  manager: [
    "projects:read", "projects:write",
    "users:read",
    "automation:read", "automation:write",
    "settings:read",
    "chat:read", "chat:write",
    "code:read",
    "knowledge:read", "knowledge:write",
    "models:read",
  ],
  user: [
    "projects:read", "projects:write",
    "automation:read",
    "chat:read", "chat:write",
    "code:read",
    "knowledge:read",
    "models:read",
  ],
  viewer: [
    "projects:read",
    "automation:read",
    "chat:read",
    "knowledge:read",
    "models:read",
  ],
  guest: ["chat:read"],
};

/** 用户上下文 (从 JWT claims 映射) */
export interface VoltUser {
  /** 用户唯一 ID */
  id: string;
  /** 登录邮箱 */
  email: string;
  /** 展示名 */
  name: string;
  /** 用户角色 */
  role: VoltRole;
  /** 所属租户 ID */
  tenantId: string;
  /** 团队 ID (可选) */
  teamId?: string;
  /** 权限列表 */
  permissions: string[];
  /** JWT 原始 claims */
  rawClaims: Record<string, unknown>;
}

/** 审计事件 */
export interface AuditEvent {
  timestamp: string;
  action: string;
  userId: string;
  userRole: VoltRole;
  tenantId: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  sourceIp?: string;
  requestId?: string;
}

/** 认证配置 */
export interface SupauthConfig {
  /** OIDC Issuer URL */
  issuer: string;
  /** JWKS URL (可从 discovery 自动获取) */
  jwksUrl?: string;
  /** OIDC Client ID */
  clientId: string;
  /** OIDC Client Secret (用于 token exchange) */
  clientSecret?: string;
  /** 回调 URL */
  callbackUrl: string;
  /** JWT audience */
  audience?: string;
  /** HS256 JWT secret (GoTrue symmetric signing) */
  jwtSecret?: string;
  /** Claims 映射 */
  claimsMapping?: Partial<ClaimsMapping>;
  /** 跳过 JWT 签名验签 (仅本地调试使用) */
  skipSignatureVerification?: boolean;
}

/** Claims 到用户字段的映射 */
export interface ClaimsMapping {
  sub: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  teamId: string;
  permissions: string;
}

/** OIDC Discovery 文档 */
export interface OidcDiscovery {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  jwks_uri: string;
  end_session_endpoint?: string;
}
