// Supabase AuthProvider
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthProvider, Identity, AuthActionResult, CheckResult } from '@svadmin/core';
import { audit } from '@svadmin/core';

export function createSupabaseAuthProvider(client: SupabaseClient): AuthProvider {
  return {
    async login({ email, password }: Record<string, unknown>): Promise<AuthActionResult> {
      const { data, error } = await client.auth.signInWithPassword({
        email: email as string,
        password: password as string,
      });
      if (error) return { success: false, error: { message: error.message } };
      audit({ action: 'login', userId: data.user?.id });
      return { success: true, redirectTo: '/' };
    },

    async logout(): Promise<AuthActionResult> {
      const { data: { user } } = await client.auth.getUser();
      await client.auth.signOut();
      audit({ action: 'logout', userId: user?.id });
      return { success: true, redirectTo: '/login' };
    },

    async check(): Promise<CheckResult> {
      const { data: { session } } = await client.auth.getSession();
      if (session) return { authenticated: true };
      return { authenticated: false, redirectTo: '/login', logout: true };
    },

    async getIdentity(): Promise<Identity | null> {
      const { data: { user } } = await client.auth.getUser();
      if (!user) return null;
      
      const { data: { session } } = await client.auth.getSession();
      
      return {
        id: user.id,
        name: user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'User',
        email: user.email,
        avatar: user.user_metadata?.avatar_url,
        token: session?.access_token,
      };
    },

    async getPermissions(): Promise<unknown> {
      const { data: { user } } = await client.auth.getUser();
      return user?.user_metadata?.role ?? 'user';
    },

    async register({ email, password, ...rest }: Record<string, unknown>): Promise<AuthActionResult> {
      const { error } = await client.auth.signUp({
        email: email as string,
        password: password as string,
        options: { data: rest },
      });
      if (error) return { success: false, error: { message: error.message } };
      return { success: true, redirectTo: '/login' };
    },

    async forgotPassword({ email }: Record<string, unknown>): Promise<AuthActionResult> {
      const { error } = await client.auth.resetPasswordForEmail(email as string);
      if (error) return { success: false, error: { message: error.message } };
      return { success: true };
    },

    async updatePassword({ password }: Record<string, unknown>): Promise<AuthActionResult> {
      const { error } = await client.auth.updateUser({ password: password as string });
      if (error) return { success: false, error: { message: error.message } };
      return { success: true, redirectTo: '/' };
    },

    async onError(error: unknown): Promise<{ redirectTo?: string; logout?: boolean }> {
      if (error instanceof Error && error.message.includes('401')) {
        // Pre-flight check: race-condition guard
        // Supabase might have just refreshed the token in the background right after our fetch failed
        const { data: { session } } = await client.auth.getSession();
        
        if (session?.access_token) {
          // Token is actually still valid in Supabase! The 401 was a stale race condition.
          // We intercept and swallow the logout action so the user isn't falsely kicked.
          return {};
        }

        // Truly expired
        await client.auth.signOut();
        return { redirectTo: '/login', logout: true };
      }
      return {};
    },
  };
}
