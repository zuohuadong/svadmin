import { describe, expect, it } from 'vitest';
import { checkError } from './hook-utils.svelte';
import type { AdminContextAccessor } from './context.svelte';

describe('checkError', () => {
  it('does not navigate when logout cannot clear the session', async () => {
    let navigations = 0;
    const context = {
      authProvider: {
        onError: async () => ({ logout: true, redirectTo: '/login' }),
        logout: async () => { throw new Error('session could not be cleared'); },
      },
      navigate: async () => { navigations += 1; },
    } as unknown as AdminContextAccessor;

    await checkError({ statusCode: 401 }, context);

    expect(navigations).toBe(0);
  });
});
