// Tests for enhanced Elysia DataProvider
import { describe, it, expect, beforeEach, mock, afterEach } from 'bun:test';
import { createElysiaDataProvider } from './data-provider';
import type { DataProvider } from '@svadmin/core';

// ─── Mock fetch ──────────────────────────────────────────────

const originalFetch = globalThis.fetch;
let mockFetchFn: ReturnType<typeof mock>;

function setupMockFetch(response: unknown, status = 200, statusText = 'OK') {
  mockFetchFn = mock(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      statusText,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    } as Response)
  );
  globalThis.fetch = mockFetchFn as unknown as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

// ─── Basic CRUD ──────────────────────────────────────────────

describe('createElysiaDataProvider', () => {
  let provider: DataProvider;

  beforeEach(() => {
    provider = createElysiaDataProvider({ apiUrl: 'http://localhost:3000' });
  });

  it('should return the API URL', () => {
    expect(provider.getApiUrl()).toBe('http://localhost:3000');
  });

  // ─── getList ───────────────────────────────────────────────

  describe('getList', () => {
    it('should fetch list with { items, total } format', async () => {
      const mockData = { items: [{ id: 1, name: 'Test' }], total: 1 };
      setupMockFetch(mockData);

      const result = await provider.getList({ resource: 'posts' });

      expect(result.data).toEqual([{ id: 1, name: 'Test' }]);
      expect(result.total).toBe(1);
      expect(mockFetchFn).toHaveBeenCalledTimes(1);
      const [url] = mockFetchFn.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('http://localhost:3000/posts?');
      expect(url).toContain('_page=1');
      expect(url).toContain('_limit=10');
    });

    it('should fetch list with { data, total } format', async () => {
      const mockData = { data: [{ id: 1 }, { id: 2 }], total: 42 };
      setupMockFetch(mockData);

      const result = await provider.getList({ resource: 'users' });
      expect(result.data).toEqual([{ id: 1 }, { id: 2 }]);
      expect(result.total).toBe(42);
    });

    it('should fetch list with raw array format', async () => {
      const mockData = [{ id: 1 }, { id: 2 }, { id: 3 }];
      setupMockFetch(mockData);

      const result = await provider.getList({ resource: 'channels' });
      expect(result.data).toEqual(mockData);
      expect(result.total).toBe(3);
    });

    it('should apply pagination params', async () => {
      setupMockFetch({ items: [], total: 0 });

      await provider.getList({
        resource: 'posts',
        pagination: { current: 3, pageSize: 25 },
      });

      const [url] = mockFetchFn.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('_page=3');
      expect(url).toContain('_limit=25');
    });

    it('should apply sorters', async () => {
      setupMockFetch({ items: [], total: 0 });

      await provider.getList({
        resource: 'posts',
        sorters: [{ field: 'name', order: 'asc' }],
      });

      const [url] = mockFetchFn.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('_sort=name');
      expect(url).toContain('_order=asc');
    });

    it('should apply filters', async () => {
      setupMockFetch({ items: [], total: 0 });

      await provider.getList({
        resource: 'posts',
        filters: [
          { field: 'status', operator: 'eq', value: 'active' },
          { field: 'name', operator: 'contains', value: 'test' },
          { field: 'age', operator: 'gte', value: 18 },
        ],
      });

      const [url] = mockFetchFn.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('status=active');
      expect(url).toContain('name_like=test');
      expect(url).toContain('age_gte=18');
    });
  });

  // ─── getOne ────────────────────────────────────────────────

  describe('getOne', () => {
    it('should fetch a single record', async () => {
      const mockData = { id: 1, name: 'Test' };
      setupMockFetch(mockData);

      const result = await provider.getOne({ resource: 'posts', id: 1 });
      expect(result.data).toEqual(mockData);

      const [url] = mockFetchFn.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('http://localhost:3000/posts/1');
    });
  });

  // ─── create ────────────────────────────────────────────────

  describe('create', () => {
    it('should create a record with POST', async () => {
      const mockData = { id: 1, name: 'New' };
      setupMockFetch(mockData);

      const result = await provider.create({
        resource: 'posts',
        variables: { name: 'New' },
      });

      expect(result.data).toEqual(mockData);
      const [url, init] = mockFetchFn.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('http://localhost:3000/posts');
      expect(init.method).toBe('POST');
      expect(init.body).toBe('{"name":"New"}');
    });
  });

  // ─── update ────────────────────────────────────────────────

  describe('update', () => {
    it('should default to PATCH method', async () => {
      const mockData = { id: 1, name: 'Updated' };
      setupMockFetch(mockData);

      await provider.update({
        resource: 'posts',
        id: 1,
        variables: { name: 'Updated' },
      });

      const [, init] = mockFetchFn.mock.calls[0] as [string, RequestInit];
      expect(init.method).toBe('PATCH');
    });
  });

  // ─── deleteOne ─────────────────────────────────────────────

  describe('deleteOne', () => {
    it('should delete a record', async () => {
      setupMockFetch({ id: 1 });

      const result = await provider.deleteOne({ resource: 'posts', id: 1 });
      expect(result.data).toEqual({ id: 1 });

      const [url, init] = mockFetchFn.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('http://localhost:3000/posts/1');
      expect(init.method).toBe('DELETE');
    });
  });

  // ─── error handling ────────────────────────────────────────

  describe('error handling', () => {
    it('should throw on non-OK response', async () => {
      setupMockFetch({ error: 'Not found' }, 404, 'Not Found');

      await expect(
        provider.getOne({ resource: 'posts', id: 999 })
      ).rejects.toThrow('HTTP 404');
    });
  });
});

// ─── updateMethod option ─────────────────────────────────────

describe('updateMethod: PUT', () => {
  it('should use PUT for updates when configured', async () => {
    const provider = createElysiaDataProvider({
      apiUrl: 'http://localhost:3000',
      updateMethod: 'PUT',
    });

    setupMockFetch({ id: 1, name: 'Updated' });

    await provider.update({
      resource: 'channels',
      id: 1,
      variables: { name: 'Updated' },
    });

    const [url, init] = mockFetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://localhost:3000/channels/1');
    expect(init.method).toBe('PUT');
  });

  it('should use PUT for updateMany when configured', async () => {
    const provider = createElysiaDataProvider({
      apiUrl: 'http://localhost:3000',
      updateMethod: 'PUT',
    });

    setupMockFetch({ id: 1 });

    await provider.updateMany!({
      resource: 'channels',
      ids: [1, 2],
      variables: { status: 'active' },
    });

    for (const call of mockFetchFn.mock.calls) {
      const [, init] = call as [string, RequestInit];
      expect(init.method).toBe('PUT');
    }
  });
});

// ─── withCredentials option ──────────────────────────────────

describe('withCredentials', () => {
  it('should include credentials when enabled', async () => {
    const provider = createElysiaDataProvider({
      apiUrl: 'http://localhost:3000',
      withCredentials: true,
    });

    setupMockFetch({ items: [], total: 0 });

    await provider.getList({ resource: 'posts' });

    const [, init] = mockFetchFn.mock.calls[0] as [string, RequestInit];
    expect(init.credentials).toBe('include');
  });

  it('should not include credentials when disabled', async () => {
    const provider = createElysiaDataProvider({
      apiUrl: 'http://localhost:3000',
    });

    setupMockFetch({ items: [], total: 0 });

    await provider.getList({ resource: 'posts' });

    const [, init] = mockFetchFn.mock.calls[0] as [string, RequestInit];
    expect(init.credentials).toBeUndefined();
  });
});

// ─── resourceUrlMap option ───────────────────────────────────

describe('resourceUrlMap', () => {
  it('should map resource names to custom URL segments', async () => {
    const provider = createElysiaDataProvider({
      apiUrl: 'http://localhost:3000/admin',
      resourceUrlMap: {
        user_groups: 'user-groups',
        rateLimits: 'rate-limits',
      },
    });

    setupMockFetch([{ id: 1 }]);

    await provider.getList({ resource: 'user_groups' });
    const [url1] = mockFetchFn.mock.calls[0] as [string, RequestInit];
    expect(url1).toContain('http://localhost:3000/admin/user-groups?');

    setupMockFetch({ id: 1 });

    await provider.getOne({ resource: 'rateLimits', id: 1 });
    const [url2] = mockFetchFn.mock.calls[0] as [string, RequestInit];
    expect(url2).toBe('http://localhost:3000/admin/rate-limits/1');
  });

  it('should use resource name as-is when no mapping exists', async () => {
    const provider = createElysiaDataProvider({
      apiUrl: 'http://localhost:3000',
      resourceUrlMap: { mapped: 'mapped-url' },
    });

    setupMockFetch({ items: [], total: 0 });

    await provider.getList({ resource: 'unmapped' });
    const [url] = mockFetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('http://localhost:3000/unmapped?');
  });
});

// ─── parseListResponse option ────────────────────────────────

describe('parseListResponse', () => {
  it('should use custom parser when provided', async () => {
    const provider = createElysiaDataProvider({
      apiUrl: 'http://localhost:3000',
      parseListResponse: <T>(json: unknown) => {
        const obj = json as { results: T[]; count: number };
        return { data: obj.results, total: obj.count };
      },
    });

    setupMockFetch({ results: [{ id: 1 }], count: 100 });

    const result = await provider.getList({ resource: 'posts' });
    expect(result.data).toEqual([{ id: 1 }]);
    expect(result.total).toBe(100);
  });
});

// ─── headers option ──────────────────────────────────────────

describe('headers', () => {
  it('should support static headers', async () => {
    const provider = createElysiaDataProvider({
      apiUrl: 'http://localhost:3000',
      headers: { 'Authorization': 'Bearer token123' },
    });

    setupMockFetch({ items: [], total: 0 });

    await provider.getList({ resource: 'posts' });

    const [, init] = mockFetchFn.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer token123');
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('should support dynamic headers function', async () => {
    let token = 'token1';
    const provider = createElysiaDataProvider({
      apiUrl: 'http://localhost:3000',
      headers: () => ({ 'Authorization': `Bearer ${token}` }),
    });

    setupMockFetch({ items: [], total: 0 });

    await provider.getList({ resource: 'posts' });
    let [, init] = mockFetchFn.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer token1');

    // Change token
    token = 'token2';
    setupMockFetch({ items: [], total: 0 });

    await provider.getList({ resource: 'posts' });
    [, init] = mockFetchFn.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer token2');
  });
});

// ─── custom method ───────────────────────────────────────────

describe('custom', () => {
  it('should support custom API calls', async () => {
    const provider = createElysiaDataProvider({
      apiUrl: 'http://localhost:3000',
      withCredentials: true,
    });

    setupMockFetch({ success: true, modelsCount: 42 });

    const result = await provider.custom!({
      url: 'http://localhost:3000/channels/1/sync-models',
      method: 'post',
    });

    expect(result.data).toEqual({ success: true, modelsCount: 42 });
    const [url, init] = mockFetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://localhost:3000/channels/1/sync-models');
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('include');
  });
});

// ─── bulk operations ─────────────────────────────────────────

describe('bulk operations', () => {
  it('should support getMany', async () => {
    const provider = createElysiaDataProvider({ apiUrl: 'http://localhost:3000' });
    setupMockFetch([{ id: 1 }, { id: 2 }]);

    const result = await provider.getMany!({ resource: 'posts', ids: [1, 2] });
    expect(result.data).toEqual([{ id: 1 }, { id: 2 }]);

    const [url] = mockFetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('id=1&id=2');
  });

  it('should support createMany', async () => {
    const provider = createElysiaDataProvider({ apiUrl: 'http://localhost:3000' });
    setupMockFetch({ id: 1, name: 'A' });

    const result = await provider.createMany!({
      resource: 'posts',
      variables: [{ name: 'A' }, { name: 'B' }],
    });

    expect(mockFetchFn).toHaveBeenCalledTimes(2);
  });

  it('should support deleteMany', async () => {
    const provider = createElysiaDataProvider({ apiUrl: 'http://localhost:3000' });
    setupMockFetch({ success: true });

    await provider.deleteMany!({ resource: 'posts', ids: [1, 2, 3] });

    expect(mockFetchFn).toHaveBeenCalledTimes(3);
    for (const call of mockFetchFn.mock.calls) {
      const [, init] = call as [string, RequestInit];
      expect(init.method).toBe('DELETE');
    }
  });
});
