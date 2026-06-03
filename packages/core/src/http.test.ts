import { afterEach, describe, expect, mock, test } from 'bun:test';
import { createFetchWithInterceptor } from './http';

interface MutableLocation {
  href: string;
  pathname: string;
}

interface TestWindow {
  location: MutableLocation;
}

const originalWindow = (globalThis as { window?: TestWindow }).window;

afterEach(() => {
  if (originalWindow) {
    (globalThis as { window?: TestWindow }).window = originalWindow;
  } else {
    delete (globalThis as { window?: TestWindow }).window;
  }
});

function mockFetchWithStatus(status: number) {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fetchImpl = mock(async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    return new Response(null, { status });
  });

  return { calls, fetchImpl };
}

function expectPresent<T>(value: T | undefined): T {
  expect(value).toBeDefined();
  return value as T;
}

describe('createFetchWithInterceptor', () => {
  test('adds CSRF header for mutating requests', async () => {
    const { calls, fetchImpl } = mockFetchWithStatus(200);
    const fetcher = createFetchWithInterceptor({ fetchImpl });

    await fetcher('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    expect(calls).toHaveLength(1);
    const headers = new Headers(expectPresent(calls[0]).init?.headers);
    expect(headers.get('X-Requested-With')).toBe('XMLHttpRequest');
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  test('does not add CSRF header for safe requests', async () => {
    const { calls, fetchImpl } = mockFetchWithStatus(200);
    const fetcher = createFetchWithInterceptor({ fetchImpl });

    await fetcher('/api/users', { method: 'GET' });

    const headers = new Headers(expectPresent(calls[0]).init?.headers);
    expect(headers.get('X-Requested-With')).toBeNull();
  });

  test('throws configured forbidden message for 403', async () => {
    const { fetchImpl } = mockFetchWithStatus(403);
    const fetcher = createFetchWithInterceptor({
      fetchImpl,
      forbiddenMessage: 'No access',
    });

    await expect(fetcher('/api/admin')).rejects.toThrow('No access');
  });

  test('uses injected fetch implementation', async () => {
    const { fetchImpl } = mockFetchWithStatus(204);
    const fetcher = createFetchWithInterceptor({ fetchImpl });

    const response = await fetcher('/api/ping');

    expect(response.status).toBe(204);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  test('redirects to login on browser 401', async () => {
    const { fetchImpl } = mockFetchWithStatus(401);
    (globalThis as { window?: TestWindow }).window = {
      location: { href: 'https://app.test/current', pathname: '/projects/list' },
    };
    const fetcher = createFetchWithInterceptor({ fetchImpl, loginPath: '/login' });

    await expect(fetcher('/api/private')).rejects.toThrow('Unauthorized');

    expect((globalThis as { window?: TestWindow }).window?.location.href).toBe(
      '/login?returnTo=%2Fprojects%2Flist',
    );
  });

  test('throws unauthorized without redirecting when window is unavailable', async () => {
    const { fetchImpl } = mockFetchWithStatus(401);
    delete (globalThis as { window?: TestWindow }).window;
    const fetcher = createFetchWithInterceptor({ fetchImpl });

    await expect(fetcher('/api/private')).rejects.toThrow('Unauthorized');
  });
});
