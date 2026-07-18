/**
 * HTTP fetch 工具 — 带 CSRF 防护、401 自动跳转和结构化错误语义。
 */

import { HttpError, type ValidationErrors } from './types';

export interface FetchWithInterceptorOptions {
  /** 401 时跳转的登录页路径 */
  loginPath?: string;
  /** 403 且服务端未返回消息时使用的错误消息 */
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
  loginPath: '/auth/login',
  forbiddenMessage: 'Forbidden: 该操作已被安全策略拒绝',
  csrfProtection: true,
  get fetchImpl() {
    if (typeof globalThis !== 'undefined' && typeof globalThis.fetch === 'function') {
      return (url: string, init?: RequestInit) => globalThis.fetch(url, init);
    }
    return async () => {
      throw new Error('No fetch implementation found. Pass fetchImpl in options.');
    };
  },
  onUnauthorized: (loginPath, returnTo) => {
    if (typeof window !== 'undefined') {
      window.location.href = `${loginPath}?returnTo=${returnTo}`;
    }
  },
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null
    ? value as Record<string, unknown>
    : null;
}

function asStructuredHttpError(error: unknown): HttpError | null {
  const record = asRecord(error);
  if (!record || typeof record.statusCode !== 'number') return null;
  const message = typeof record.message === 'string' ? record.message : 'HTTP request failed';
  const errors = asValidationErrors(record.errors);
  return new HttpError(message, record.statusCode, errors, {
    code: typeof record.code === 'string' ? record.code : undefined,
    details: record.details,
    body: record.body,
    cause: error,
  });
}

function firstString(...values: unknown[]): string | undefined {
  return values.find((value): value is string => typeof value === 'string');
}

function asValidationErrors(value: unknown): ValidationErrors | undefined {
  const record = asRecord(value);
  if (!record) return undefined;

  const valid = Object.values(record).every((entry) => (
    typeof entry === 'string'
    || (Array.isArray(entry) && entry.every((item) => typeof item === 'string'))
  ));
  return valid ? record as ValidationErrors : undefined;
}

async function readErrorBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function createResponseError(
  response: Response,
  forbiddenMessage: string,
): Promise<HttpError> {
  const body = await readErrorBody(response);
  const record = asRecord(body);
  const nestedError = asRecord(record?.error);
  const code = response.headers.get('X-Svadmin-Auth-Retry') === 'exhausted'
    ? 'auth_retry_exhausted'
    : firstString(
      record?.code,
      record?.error_code,
      nestedError?.code,
      nestedError?.error_code,
      record?.error,
    );
  const details = record?.details ?? nestedError?.details;
  const message = firstString(
    record?.message,
    nestedError?.message,
    record?.error_description,
    nestedError?.error_description,
    body,
  ) ?? (response.status === 401 ? 'Unauthorized' : forbiddenMessage);

  return new HttpError(
    message,
    response.status,
    asValidationErrors(record?.errors ?? nestedError?.errors),
    { code, details, body },
  );
}

/**
 * 带拦截器的 fetch。Core 只保留错误语义；认证刷新和请求重放由认证提供方处理。
 */
export function createFetchWithInterceptor(
  options: FetchWithInterceptorOptions = {},
): FetchWithInterceptor {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return async (url: string, init: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(init.headers || {});
    if (
      opts.csrfProtection
      && init.method
      && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(init.method.toUpperCase())
    ) {
      headers.set('X-Requested-With', 'XMLHttpRequest');
    }

    let response: Response;
    try {
      response = await opts.fetchImpl(url, { ...init, headers });
    } catch (error) {
      if (error instanceof HttpError) throw error;
      const structuredError = asStructuredHttpError(error);
      if (structuredError) throw structuredError;
      throw error;
    }

    if (response.ok || (response.status !== 401 && response.status !== 403)) {
      return response;
    }

    const httpError = await createResponseError(response, opts.forbiddenMessage);
    if (response.status === 401) {
      const returnTo = typeof window !== 'undefined'
        ? encodeURIComponent(window.location.pathname)
        : '';
      try {
        opts.onUnauthorized(opts.loginPath, returnTo);
      } catch {
        // 重定向适配器失败不能覆盖服务端的结构化 401 错误。
      }
    }
    throw httpError;
  };
}

/** 便捷全局实例 — 使用默认配置。 */
export const fetchWithInterceptor = createFetchWithInterceptor();
