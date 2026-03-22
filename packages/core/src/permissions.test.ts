// Unit tests for permissions module
import { describe, test, expect, beforeEach } from 'bun:test';
import { setAccessControl, canAccess, canAccessAsync } from './permissions';
import type { Action } from './permissions';

describe('permissions', () => {
  beforeEach(() => {
    // Reset to no access control (allow all)
    setAccessControl((() => ({ can: true })) as Parameters<typeof setAccessControl>[0]);
  });

  test('canAccess returns { can: true } when no deny rules', () => {
    const result = canAccess('posts', 'list' as Action);
    expect(result.can).toBe(true);
  });

  test('canAccess respects deny rule', () => {
    setAccessControl((_resource: string, action: Action) => {
      if (action === 'delete') return { can: false, reason: 'Denied' };
      return { can: true };
    });
    expect(canAccess('posts', 'delete')).toEqual({ can: false, reason: 'Denied' });
    expect(canAccess('posts', 'list')).toEqual({ can: true });
  });

  test('canAccess returns { can: true } when async fn used sync', () => {
    setAccessControl(async () => ({ can: false }));
    // Should warn and default to { can: true }
    const result = canAccess('posts', 'list');
    expect(result.can).toBe(true);
  });

  test('canAccessAsync resolves with allowed status', async () => {
    setAccessControl(async () => ({ can: true }));
    const result = await canAccessAsync('posts', 'edit');
    expect(result.can).toBe(true);
  });

  test('canAccessAsync resolves with denied status', async () => {
    setAccessControl(async (_r: string, _a: Action) => ({ can: false, reason: 'No permission' }));
    const result = await canAccessAsync('users', 'delete');
    expect(result.can).toBe(false);
    expect(result.reason).toBe('No permission');
  });

  test('resource-specific rules', () => {
    setAccessControl((resource: string, action: Action) => {
      if (resource === 'users' && action === 'delete') return { can: false, reason: 'Cannot delete users' };
      return { can: true };
    });
    expect(canAccess('users', 'delete').can).toBe(false);
    expect(canAccess('users', 'list').can).toBe(true);
    expect(canAccess('posts', 'delete').can).toBe(true);
  });
});
