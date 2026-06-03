import * as jose from "jose";
import type { SupauthConfig, AuditEvent, VoltUser, VoltRole } from "./types";
import { mapClaimsToUser, hasPermission, hasMinRole } from "./rbac";

export class AuthError extends Error {
  readonly status: number;

  constructor(message: string, status: number = 401) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new AuthError("Invalid JWT format", 401);
  }
  const payload = parts[1]!;
  const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(decoded);
}

export interface SupauthMiddleware {
  /** 从请求中提取并验证用户 */
  authenticate(request: Request): Promise<VoltUser>;
  /** 检查权限，无权限时抛出 AuthError */
  requirePermission(permission: string): (user: VoltUser) => void;
  /** 检查角色，不满足时抛出 AuthError */
  requireMinRole(role: VoltRole): (user: VoltUser) => void;
  /** 创建审计事件 */
  createAuditEvent(
    user: VoltUser,
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: Record<string, unknown>,
  ): AuditEvent;
}

export class SupauthAuthMiddleware implements SupauthMiddleware {
  private config: SupauthConfig;
  private jwksSet?: ReturnType<typeof jose.createRemoteJWKSet>;
  private initError?: Error;

  constructor(config: SupauthConfig) {
    this.config = config;
    if (config.issuer && !config.skipSignatureVerification) {
      const jwksUrl = config.jwksUrl || `${config.issuer.replace(/\/+$/, "")}/.well-known/jwks.json`;
      try {
        this.jwksSet = jose.createRemoteJWKSet(new URL(jwksUrl));
      } catch (err) {
        const errorInstance = err instanceof Error ? err : new Error(String(err));
        this.initError = errorInstance;
        console.error(`[supauth-middleware] Failed to initialize remote JWKSet: ${errorInstance.message}`);
      }
    }
  }

  async authenticate(request: Request): Promise<VoltUser> {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AuthError("Missing or invalid Authorization header", 401);
    }

    const token = authHeader.slice(7);
    let claims: Record<string, unknown>;

    if (this.config.issuer && !this.config.skipSignatureVerification) {
      try {
        const header = jose.decodeProtectedHeader(token);
        const secret = this.config.jwtSecret;
        if (header.alg === "HS256" && secret) {
          const { payload } = await jose.jwtVerify(token, new TextEncoder().encode(secret), {
            issuer: this.config.issuer,
            audience: this.config.audience,
            algorithms: ["HS256"],
          });
          claims = payload as Record<string, unknown>;
        } else {
          if (!this.jwksSet) {
            if (this.initError) {
              throw new AuthError(`JWKS verifier initialization failed: ${this.initError.message}`, 401);
            }
            throw new AuthError("JWKS verifier is uninitialized or failed to fetch keys", 401);
          }
          const { payload } = await jose.jwtVerify(token, this.jwksSet, {
            issuer: this.config.issuer,
            audience: this.config.audience,
          });
          claims = payload as Record<string, unknown>;
        }
      } catch (err) {
        if (err instanceof AuthError) throw err;
        throw new AuthError(`JWT signature verification failed: ${err instanceof Error ? err.message : err}`, 401);
      }
    } else {
      claims = decodeJwtPayload(token);
      const exp = claims.exp as number | undefined;
      if (exp && Date.now() / 1000 > exp) {
        throw new AuthError("Token expired", 401);
      }
      if (this.config.issuer && claims.iss !== this.config.issuer) {
        throw new AuthError(`Invalid issuer: ${claims.iss}`, 401);
      }
      if (this.config.audience) {
        const aud = claims.aud;
        const audienceMatch = Array.isArray(aud)
          ? aud.includes(this.config.audience)
          : aud === this.config.audience;
        if (!audienceMatch) {
          throw new AuthError("Invalid audience", 401);
        }
      }
    }

    return mapClaimsToUser(claims, this.config.claimsMapping);
  }

  requirePermission(permission: string): (user: VoltUser) => void {
    return (user: VoltUser) => {
      if (!hasPermission(user, permission)) {
        throw new AuthError(
          `Permission denied: requires ${permission}, user has [${user.permissions.join(", ")}]`,
          403,
        );
      }
    };
  }

  requireMinRole(role: VoltRole): (user: VoltUser) => void {
    return (user: VoltUser) => {
      if (!hasMinRole(user, role)) {
        throw new AuthError(
          `Role denied: requires ${role} or higher, user is ${user.role}`,
          403,
        );
      }
    };
  }

  createAuditEvent(
    user: VoltUser,
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: Record<string, unknown>,
  ): AuditEvent {
    return {
      timestamp: new Date().toISOString(),
      action,
      userId: user.id,
      userRole: user.role,
      tenantId: user.tenantId,
      resourceType,
      resourceId,
      details,
    };
  }
}
