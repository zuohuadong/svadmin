/**
 * @svadmin/supauth-middleware
 *
 * Supauth/OIDC 身份、RBAC 与审计上下文中间件。
 * 支持任意 OIDC 兼容身份提供商 (GoTrue, Keycloak, Auth0, Okta 等)。
 *
 * 功能:
 *   - JWT 验签 (RS256 via JWKS, HS256 symmetric)
 *   - OIDC Discovery 自动发现
 *   - Claims 到用户模型映射 (含 GoTrue app_metadata 路径)
 *   - RBAC 角色/权限检查
 *   - 审计事件生成
 */

export {
  SupauthAuthMiddleware,
  AuthError,
} from './middleware';

export {
  mapClaimsToUser,
  validateRole,
  hasPermission,
  hasMinRole,
} from './rbac';

export {
  fetchOidcDiscovery,
  buildAuthorizationUrl,
} from './oidc';

export type {
  VoltUser,
  VoltRole,
  AuditEvent,
  SupauthConfig,
  ClaimsMapping,
  OidcDiscovery,
} from './types';

export { ROLE_PERMISSIONS } from './types';
