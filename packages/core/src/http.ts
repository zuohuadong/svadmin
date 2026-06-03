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
}

const DEFAULT_OPTIONS: Required<FetchWithInterceptorOptions> = {
  loginPath: "/auth/login",
  forbiddenMessage: "Forbidden: 该操作已被安全策略拒绝",
  csrfProtection: true,
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
): (url: string, init?: RequestInit) => Promise<Response> {
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

    const res = await fetch(url, { ...init, headers });

    if (!res.ok) {
      if (res.status === 401) {
        const returnTo = typeof window !== "undefined"
          ? encodeURIComponent(window.location.pathname)
          : "";
        window.location.href = `${opts.loginPath}?returnTo=${returnTo}`;
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
