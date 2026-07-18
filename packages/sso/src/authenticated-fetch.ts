import { SSOAuthError } from './errors';
import type { GetAccessTokenOptions } from './session-manager';

interface AccessTokenSource {
  getAuthorizationHeader: (options?: GetAccessTokenOptions) => Promise<string | null>;
}

function cloneReplayableRequest(request: Request): Request {
  try {
    return request.clone();
  } catch (error) {
    throw new SSOAuthError('Authenticated request body cannot be safely replayed', 0, {
      code: 'request_not_replayable',
      retryable: false,
      cause: error,
    });
  }
}

function withAuthorization(request: Request, authorization: string | null): Request {
  if (!authorization) return request;

  const headers = new Headers(request.headers);
  headers.set('Authorization', authorization);
  return new Request(request, { headers });
}

function markRetryExhausted(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('X-Svadmin-Auth-Retry', 'exhausted');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function createAuthenticatedFetch(
  source: AccessTokenSource,
  fetcher: typeof fetch,
): typeof fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    if (input instanceof Request && input.bodyUsed) {
      throw new SSOAuthError('Authenticated request body cannot be safely replayed', 0, {
        code: 'request_not_replayable',
        retryable: false,
      });
    }

    let request: Request;
    try {
      request = new Request(input, init);
    } catch (error) {
      throw new SSOAuthError('Authenticated request could not be constructed', 0, {
        code: 'request_not_replayable',
        retryable: false,
        cause: error,
      });
    }

    // 两份副本都在首次发送前创建，避免流式 body 被消费后静默丢失。
    const firstAttempt = cloneReplayableRequest(request);
    const retryAttempt = cloneReplayableRequest(request);
    const authorization = await source.getAuthorizationHeader();
    const response = await fetcher(withAuthorization(firstAttempt, authorization));

    if (response.status !== 401) return response;

    const currentAuthorization = await source.getAuthorizationHeader();
    const refreshedAuthorization = currentAuthorization && currentAuthorization !== authorization
      ? currentAuthorization
      : await source.getAuthorizationHeader({ forceRefresh: true });
    if (!refreshedAuthorization) return response;

    const retryResponse = await fetcher(withAuthorization(retryAttempt, refreshedAuthorization));
    return retryResponse.status === 401 ? markRetryExhausted(retryResponse) : retryResponse;
  }) as typeof fetch;
}
