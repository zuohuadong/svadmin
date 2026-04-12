import { describe, test, expect, mock } from 'bun:test';
import { invalidateByScopes, publishLiveEvent } from './mutation-hooks.svelte.ts';
import { QueryClient } from '@tanstack/svelte-query';
import * as HookUtils from './hook-utils.svelte.ts';

describe('mutation-hooks', () => {

  describe('invalidateByScopes - Multi-Provider Cache Isolation', () => {
    test('filters perfectly by dataProviderName when passed', () => {
      const queryClient = new QueryClient();
      queryClient.invalidateQueries = mock(async () => {});

      const resource = 'posts';
      const providerName = 'secondaryProvider';
      
      // Act
      invalidateByScopes(queryClient, resource, ['list'], ['list'], undefined, providerName);
      
      expect(queryClient.invalidateQueries).toHaveBeenCalled();
      
      // Assert predicate captures DataProvider scopes
      const calls = (queryClient.invalidateQueries as ReturnType<typeof mock>).mock.calls;
      const predicateStr = calls[0][0].predicate.toString();
      
      // Using arbitrary mock objects simulating Query keys
      const predicateFn = calls[0][0].predicate;
      
      const shouldPass = predicateFn({ queryKey: ['secondaryProvider', 'posts', 'list'] });
      const shouldFail = predicateFn({ queryKey: ['default', 'posts', 'list'] });
      const shouldFailResource = predicateFn({ queryKey: ['secondaryProvider', 'users', 'list'] });

      expect(shouldPass).toBe(true);
      expect(shouldFail).toBe(false);
      expect(shouldFailResource).toBe(false);
    });
    
    test('falls back to all providers when NO provider is specified', () => {
      const queryClient = new QueryClient();
      queryClient.invalidateQueries = mock(async () => {});

      // Act without providerName
      invalidateByScopes(queryClient, 'posts', ['list'], ['list']);
      
      const predicateFn = (queryClient.invalidateQueries as ReturnType<typeof mock>).mock.calls[0][0].predicate;
      
      const pass1 = predicateFn({ queryKey: ['default', 'posts', 'list'] });
      const pass2 = predicateFn({ queryKey: ['custom', 'posts', 'list'] });
      expect(pass1).toBe(true);
      expect(pass2).toBe(true);
    });
  });

});
