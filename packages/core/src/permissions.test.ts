// Unit tests for permissions module
import { describe, test, expect, beforeEach } from 'bun:test';
import { setAccessControlProvider, getAccessControlProvider, getAccessControlOptions, canAccessAsync, type CanParams, type CanResult } from './permissions';
import type { Action, AccessControlProvider } from './permissions';

describe('permissions', () => {
  beforeEach(() => {
    // Reset to a permissive provider
    setAccessControlProvider({
      can: async () => ({ can: true }),
    });
  });

  test('canAccessAsync respects deny rule', async () => {
    setAccessControlProvider({
      can: async (p) => {
        const { action } = p as CanParams;
        if (action === 'delete') return { can: false, reason: 'Denied' };
        return { can: true };
      },
    });
    expect(await canAccessAsync('posts', 'delete')).toEqual({ can: false, reason: 'Denied' });
    expect((await canAccessAsync('posts', 'delete')) as CanResult).toEqual({ can: false, reason: 'Denied' });
    expect((await canAccessAsync('posts', 'list')) as CanResult).toEqual({ can: true });
  });

  test('canAccessAsync resolves with allowed status', async () => {
    setAccessControlProvider({
      can: async (params) => {
        expect((params as CanParams).params?.published).toBe(true);
        return { can: true };
      },
    });
    const result = await canAccessAsync('posts', 'edit', { published: true });
    expect((result as CanResult).can).toBe(true);
  });

  test('canAccessAsync resolves with denied status', async () => {
    setAccessControlProvider({
      can: async () => ({ can: false, reason: 'No permission' }),
    });
    const result = await canAccessAsync('users', 'delete');
    expect((result as CanResult).can).toBe(false);
    expect((result as CanResult).reason).toBe('No permission');
  });

  test('resource-specific rules', async () => {
    setAccessControlProvider({
      can: async (p) => {
        const { resource, action } = p as CanParams;
        if (resource === 'users' && action === 'delete') return { can: false, reason: 'Cannot delete users' };
        return { can: true };
      },
    });
    expect((await canAccessAsync('users', 'delete') as CanResult).can).toBe(false);
    expect((await canAccessAsync('users', 'list') as CanResult).can).toBe(true);
    expect((await canAccessAsync('posts', 'delete') as CanResult).can).toBe(true);
  });
});

describe('AccessControlProvider', () => {
  beforeEach(() => {
    setAccessControlProvider({
      can: async () => ({ can: true }),
    });
  });

  test('setAccessControlProvider registers a provider', () => {
    const provider = getAccessControlProvider();
    expect(provider).not.toBeNull();
  });

  test('provider can() is called via canAccessAsync', async () => {
    let callCount = 0;
    setAccessControlProvider({
      can: async (params) => {
        callCount++;
        expect((params as CanParams).resource).toBe('posts');
        if ((params as CanParams).action === 'delete') {
          return { can: false, reason: 'Cannot delete posts' };
        }
        return { can: true };
      },
    });
    const denied = await canAccessAsync('posts', 'delete') as CanResult;
    expect(denied.can).toBe(false);
    expect(denied.reason).toBe('Cannot delete posts');

    const allowed = await canAccessAsync('posts', 'list') as CanResult;
    expect(allowed.can).toBe(true);
    expect(callCount).toBe(2);
  });

  test('params.id is passed through', async () => {
    setAccessControlProvider({
      can: async (p) => {
        const { params } = p as CanParams;
        if (params?.id === 42) return { can: false, reason: 'Record locked' };
        return { can: true };
      },
    });
    const result = await canAccessAsync('posts', 'edit', { id: 42 });
    expect((result as CanResult).can).toBe(false);
    expect((result as CanResult).reason).toBe('Record locked');
  });

  test('extended action types work', async () => {
    setAccessControlProvider({
      can: async (p) => {
        const { action } = p as CanParams;
        if (action === 'show') return { can: false, reason: 'No show' };
        if (action === 'field') return { can: false, reason: 'No field' };
        return { can: true };
      },
    });
    expect(((await canAccessAsync('posts', 'show')) as CanResult).can).toBe(false);
    expect(((await canAccessAsync('posts', 'field')) as CanResult).can).toBe(false);
    expect(((await canAccessAsync('posts', 'list')) as CanResult).can).toBe(true);
  });

  test('getAccessControlOptions returns provider options', () => {
    setAccessControlProvider({
      can: async () => ({ can: true }),
      options: {
        buttons: { enableAccessControl: true, hideIfUnauthorized: true },
      },
    });
    const options = getAccessControlOptions();
    expect(options.buttons?.enableAccessControl).toBe(true);
    expect(options.buttons?.hideIfUnauthorized).toBe(true);
  });

  test('getAccessControlOptions returns {} when no options', () => {
    setAccessControlProvider({
      can: async () => ({ can: true }),
    });
    expect(getAccessControlOptions()).toEqual({});
  });
});

describe('CASL adapter', () => {
  test('createCaslAccessControl works', async () => {
    // Import dynamically to test the adapter
    const { createCaslAccessControl } = await import('./adapters/casl');

    // Mock CASL Ability
    const ability = {
      can: (action: string, subject: string) => !(action === 'delete' && subject === 'users'),
      cannot: (action: string, subject: string) => action === 'delete' && subject === 'users',
    };

    const provider = createCaslAccessControl(ability);

    const allowed = await provider.can({ resource: 'posts', action: 'edit' }) as CanResult;
    expect(allowed.can).toBe(true);

    const denied = await provider.can({ resource: 'users', action: 'delete' }) as CanResult;
    expect(denied.can).toBe(false);
    expect(denied.reason).toContain('Cannot "delete" on "users"');
  });
});

describe('Casbin adapter', () => {
  test('createCasbinAccessControl works', async () => {
    const { createCasbinAccessControl } = await import('./adapters/casbin');

    // Mock Casbin Enforcer
    const enforcer = {
      enforce: async (sub: string, obj: string, act: string) =>
        !(sub === 'alice' && obj === 'users' && act === 'delete'),
    };

    const provider = createCasbinAccessControl(enforcer, {
      getUser: () => 'alice',
    });

    const allowed = await provider.can({ resource: 'posts', action: 'edit' }) as CanResult;
    expect(allowed.can).toBe(true);

    const denied = await provider.can({ resource: 'users', action: 'delete' }) as CanResult;
    expect(denied.can).toBe(false);
    expect(denied.reason).toContain('alice');
  });
});
