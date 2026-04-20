// @svadmin/supabase — Unit Tests
import { describe, test, expect, mock } from 'bun:test';
import type { SupabaseClient } from '@supabase/supabase-js';

// ─── Mock @svadmin/core ───────────────────────────────────────────
mock.module('@svadmin/core', () => {
  return {
    audit: mock(() => {}),
  };
});

// ─── Mock Refine Supabase Provider ────────────────────────────────
mock.module('@refinedev/supabase', () => {
  return {
    dataProvider: (..._args: any[]) => {
      const mockDp: any = {
        getList: async () => ({ data: [{ id: 1, title: 'Item 1' }], total: 1 }),
        getOne: async () => ({ data: { id: 1, title: 'Item 1' } }),
        create: async () => ({ data: { id: 2, title: 'New Item' } }),
        update: async () => ({ data: { id: 1, title: 'Updated' } }),
        deleteOne: async () => ({ data: { id: 1, title: 'Deleted' } }),
      };
      return mockDp;
    }
  };
});

// ─── Mock Supabase Client ──────────────────────────────────────────
function createMockSupabaseClient(overrides: Record<string, any> = {}) {
  const client = {
    auth: {
      signInWithPassword: mock(async ({ email, password }) => {
        if (password === 'bad') return { error: { message: 'Invalid credentials' } };
        return { data: { user: { id: 'user-1' } }, error: null };
      }),
      signOut: mock(async () => ({ error: null })),
      getSession: mock(async () => ({ data: { session: { access_token: 'valid-token' } } })),
      getUser: mock(async () => ({ 
        data: { 
          user: { 
            id: 'user-1', 
            email: 'admin@test.com', 
            user_metadata: { name: 'Admin', avatar_url: 'http://avatar', role: 'admin' } 
          } 
        } 
      })),
      signUp: mock(async ({ email }) => {
        if (email === 'bad@test.com') return { error: { message: 'Signup failed' } };
        return { error: null };
      }),
      resetPasswordForEmail: mock(async () => ({ error: null })),
      updateUser: mock(async () => ({ error: null })),
      ...(overrides.auth || {}),
    },
    channel: mock((name: string) => {
      const c: any = {
        name,
        on: mock(() => c),
        subscribe: mock(() => c),
        unsubscribe: mock(() => c),
        send: mock(() => c)
      };
      return c;
    }),
  };
  // If there are top-level overrides besides auth, merge them
  for (const [key, val] of Object.entries(overrides)) {
    if (key !== 'auth') (client as any)[key] = val;
  }
  return client as unknown as SupabaseClient;
}


// ─── DataProvider Tests ──────────────────────────────────────────
describe('Supabase DataProvider', () => {
  test('getList routes through refine-adapter', async () => {
    const { createSupabaseDataProvider } = await import('./data-provider');
    const dp = await createSupabaseDataProvider({} as any);
    const result = await dp.getList({ resource: 'posts' });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.data[0].id).toBe(1);
  });

  test('create returns new record', async () => {
    const { createSupabaseDataProvider } = await import('./data-provider');
    const dp = await createSupabaseDataProvider({} as any);
    const result = await dp.create({ resource: 'posts', variables: { title: 'New Item' } });
    expect(result.data.id).toBe(2);
  });
});


// ─── AuthProvider Tests ──────────────────────────────────────────
describe('Supabase AuthProvider', () => {
  test('login success', async () => {
    const { createSupabaseAuthProvider } = await import('./auth-provider');
    const auth = createSupabaseAuthProvider(createMockSupabaseClient());
    const result = await auth.login({ email: 'admin@test.com', password: 'pass' });
    expect(result.success).toBe(true);
    expect(result.redirectTo).toBe('/');
  });

  test('login failure', async () => {
    const { createSupabaseAuthProvider } = await import('./auth-provider');
    const auth = createSupabaseAuthProvider(createMockSupabaseClient());
    const result = await auth.login({ email: 'admin@test.com', password: 'bad' });
    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('Invalid credentials');
  });

  test('logout success', async () => {
    const { createSupabaseAuthProvider } = await import('./auth-provider');
    const auth = createSupabaseAuthProvider(createMockSupabaseClient());
    const result = await auth.logout();
    expect(result.success).toBe(true);
    expect(result.redirectTo).toBe('/login');
  });

  test('check returns authenticated when session exists', async () => {
    const { createSupabaseAuthProvider } = await import('./auth-provider');
    const auth = createSupabaseAuthProvider(createMockSupabaseClient());
    const result = await auth.check();
    expect(result.authenticated).toBe(true);
  });

  test('check returns unauthenticated when no session', async () => {
    const { createSupabaseAuthProvider } = await import('./auth-provider');
    const auth = createSupabaseAuthProvider(createMockSupabaseClient({
      auth: { getSession: mock(async () => ({ data: { session: null } })) }
    }));
    const result = await auth.check();
    expect(result.authenticated).toBe(false);
    expect(result.redirectTo).toBe('/login');
    expect(result.logout).toBe(true);
  });

  test('check clears invalid refresh token sessions', async () => {
    const { createSupabaseAuthProvider } = await import('./auth-provider');
    const client = createMockSupabaseClient({
      auth: {
        getSession: mock(async () => ({
          data: { session: null },
          error: new Error('Refresh token is not valid'),
        })),
      }
    });
    const auth = createSupabaseAuthProvider(client);
    const result = await auth.check();
    expect(result.authenticated).toBe(false);
    expect(result.logout).toBe(true);
    expect(result.redirectTo).toBe('/login');
    expect(client.auth.signOut).toHaveBeenCalled();
  });

  test('getIdentity surfaces user metadata', async () => {
    const { createSupabaseAuthProvider } = await import('./auth-provider');
    const auth = createSupabaseAuthProvider(createMockSupabaseClient());
    const identity = await auth.getIdentity();
    expect(identity).not.toBeNull();
    expect(identity!.id).toBe('user-1');
    expect(identity!.name).toBe('Admin');
    expect(identity!.avatar).toBe('http://avatar');
  });

  test('getPermissions surfaces role from user_metadata', async () => {
    const { createSupabaseAuthProvider } = await import('./auth-provider');
    const auth = createSupabaseAuthProvider(createMockSupabaseClient());
    const role = await auth.getPermissions?.();
    expect(role).toBe('admin');
  });

  test('getIdentity clears invalid refresh token sessions', async () => {
    const { createSupabaseAuthProvider } = await import('./auth-provider');
    const client = createMockSupabaseClient({
      auth: {
        getUser: mock(async () => ({
          data: { user: null },
          error: new Error('Invalid refresh token'),
        })),
      }
    });
    const auth = createSupabaseAuthProvider(client);
    const identity = await auth.getIdentity();
    expect(identity).toBeNull();
    expect(client.auth.signOut).toHaveBeenCalled();
  });

  test('onError returns logout true on 401 with no session', async () => {
    const { createSupabaseAuthProvider } = await import('./auth-provider');
    const client = createMockSupabaseClient({
      auth: { getSession: mock(async () => ({ data: { session: null } })) }
    });
    const auth = createSupabaseAuthProvider(client);
    const result = await auth.onError!(new Error('401 Unauthorized'));
    expect(result.logout).toBe(true);
    expect(result.redirectTo).toBe('/login');
    expect(client.auth.signOut).toHaveBeenCalled();
  });

  test('onError swallows 401 if token actually exists (race condition guard)', async () => {
    const { createSupabaseAuthProvider } = await import('./auth-provider');
    const client = createMockSupabaseClient();
    const auth = createSupabaseAuthProvider(client);
    const result = await auth.onError!(new Error('401 Unauthorized'));
    expect(result.logout).toBeUndefined();
    expect(client.auth.signOut).not.toHaveBeenCalled();
  });

  test('onError logs out on invalid refresh token', async () => {
    const { createSupabaseAuthProvider } = await import('./auth-provider');
    const client = createMockSupabaseClient();
    const auth = createSupabaseAuthProvider(client);
    const result = await auth.onError!(new Error('Refresh token is not valid'));
    expect(result.logout).toBe(true);
    expect(result.redirectTo).toBe('/login');
    expect(client.auth.signOut).toHaveBeenCalled();
  });
});


// ─── LiveProvider Tests ──────────────────────────────────────────
describe('Supabase LiveProvider', () => {
  test('subscribe builds channel and binds events', async () => {
    const { createSupabaseLiveProvider } = await import('./live-provider');
    const client = createMockSupabaseClient();
    const live = createSupabaseLiveProvider(client);
    
    let callbackTriggered = false;
    const unsub = live.subscribe({
      resource: 'posts',
      callback: (event) => { callbackTriggered = true; }
    });
    
    expect(client.channel).toHaveBeenCalledWith('live-posts');
    const channelMock = (client.channel as ReturnType<typeof mock>).mock.results[0].value;
    expect(channelMock.on).toHaveBeenCalled();
    expect(channelMock.subscribe).toHaveBeenCalled();
    
    unsub();
    expect(channelMock.unsubscribe).toHaveBeenCalled();
  });

  test('publish triggers broadcast send', async () => {
    const { createSupabaseLiveProvider } = await import('./live-provider');
    const client = createMockSupabaseClient();
    const live = createSupabaseLiveProvider(client);
    
    live.publish?.({ type: 'INSERT', resource: 'posts', payload: { a: 1 } });
    
    const channelMock = (client.channel as ReturnType<typeof mock>).mock.results[0].value;
    expect(channelMock.send).toHaveBeenCalled();
    const sendArgs = channelMock.send.mock.calls[0][0];
    expect(sendArgs.type).toBe('broadcast');
    expect(sendArgs.event).toBe('live-event');
    expect(sendArgs.payload.type).toBe('INSERT');
  });
});
