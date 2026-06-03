/**
 * HTTP fetch 工具 — 带 CSRF 防护、401 自动跳转、403 拦截的 fetch wrapper。
 */

export interface FetchWithInterceptorOptions {
  /** 401 时跳转的登录页路径 */
  loginPath?: string;
  /** 403 时抛出的错误消息 */
  forbiddenMessage?: string;
  /** 是否自动添加 X-Requested-With header (CSRF 防护) */
  csrfProtection?: boolean;
  /** 自定义 fetch 实现，便于测试或 SSR 环境注入 */
  fetchImpl?: FetchWithInterceptor;
  /** 自定义 401 重定向处理，便于测试或 SSR 环境注入 */
  onUnauthorized?: (loginPath: string, returnTo: string) => void;
}

export type FetchWithInterceptor = (url: string, init?: RequestInit) => Promise<Response>;

const DEFAULT_OPTIONS: Required<Omit<FetchWithInterceptorOptions, 'fetchImpl' | 'onUnauthorized'>> & {
  fetchImpl: FetchWithInterceptor;
  onUnauthorized: (loginPath: string, returnTo: string) => void;
} = {
  loginPath: "/auth/login",
  forbiddenMessage: "Forbidden: 该操作已被安全策略拒绝",
  csrfProtection: true,
  get fetchImpl() {
    if (typeof globalThis !== "undefined" && typeof globalThis.fetch === "function") {
      return (url: string, init?: RequestInit) => globalThis.fetch(url, init);
    }
    return async () => {
      throw new Error("No fetch implementation found. Pass fetchImpl in options.");
    };
  },
  onUnauthorized: (loginPath, returnTo) => {
    if (typeof window !== "undefined") {
      window.location.href = `${loginPath}?returnTo=${returnTo}`;
    }
  },
};

/**
 * 带拦截器的 fetch — 自动注入 CSRF header，401 跳转登录，403 抛异常。
 *
 * @example
 * ```ts
 * const fetcher = createFetchWithInterceptor({ loginPath: '/login' });
 * const res = await fetcher('/api/users');
 * ```
 */
export function createFetchWithInterceptor(
  options: FetchWithInterceptorOptions = {},
): FetchWithInterceptor {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return async (url: string, init: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(init.headers || {});

    if (
      opts.csrfProtection &&
      init.method &&
      ["POST", "PUT", "DELETE", "PATCH"].includes(init.method.toUpperCase())
    ) {
      headers.set("X-Requested-With", "XMLHttpRequest");
    }

    const res = await opts.fetchImpl(url, { ...init, headers });

    if (!res.ok) {
      if (res.status === 401) {
        const returnTo = typeof window !== "undefined"
          ? encodeURIComponent(window.location.pathname)
          : "";
        opts.onUnauthorized(opts.loginPath, returnTo);
        throw new Error("Unauthorized");
      }
      if (res.status === 403) {
        throw new Error(opts.forbiddenMessage);
      }
    }
    return res;
  };
}

/**
 * 便捷全局实例 — 使用默认配置。
 */
export const fetchWithInterceptor = createFetchWithInterceptor();
