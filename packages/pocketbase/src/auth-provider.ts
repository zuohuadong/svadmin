// @svadmin/pocketbase — PocketBase AuthProvider
import type { AuthProvider, Identity, AuthActionResult, CheckResult } from '@svadmin/core';

interface PocketBaseAuthOptions {
  /** PocketBase client instance */
  pb: unknown; // PocketBase
}

// Duck-typed PocketBase client with auth methods
interface PBClientAuth {
  authStore: {
    isValid: boolean;
    model: { id: string; name?: string; email: string; avatar?: string; [key: string]: unknown } | null;
    clear: () => void;
    token: string;
  };
  collection: (name: string) => {
    authWithPassword: (email: string, password: string) => Promise<{ record: Record<string, unknown>; token: string }>;
    create: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
    requestPasswordReset: (email: string) => Promise<boolean>;
    confirmPasswordReset: (token: string, password: string, passwordConfirm: string) => Promise<boolean>;
  };
}

/**
 * Create an AuthProvider backed by PocketBase.
 *
 * Usage:
 * ```ts
 * import PocketBase from 'pocketbase';
 * import { createPocketBaseAuthProvider } from '@svadmin/pocketbase';
 *
 * const pb = new PocketBase('http://127.0.0.1:8090');
 * const authProvider = createPocketBaseAuthProvider({ pb });
 * ```
 */
export function createPocketBaseAuthProvider(options: PocketBaseAuthOptions): AuthProvider {
  const pb = options.pb as PBClientAuth;

  return {
    async login({ email, password, collection }: Record<string, unknown>): Promise<AuthActionResult> {
      try {
        const col = (collection as string) || 'users';
        await pb.collection(col).authWithPassword(email as string, password as string);
        return { success: true, redirectTo: '/' };
      } catch (err) {
        return { success: false, error: { message: (err as Error).message } };
      }
    },

    async logout(): Promise<AuthActionResult> {
      pb.authStore.clear();
      return { success: true, redirectTo: '/login' };
    },

    async check(): Promise<CheckResult> {
      if (pb.authStore.isValid && pb.authStore.model) {
        return { authenticated: true };
      }
      return { authenticated: false, redirectTo: '/login', logout: true };
    },

    async getIdentity(): Promise<Identity | null> {
      const model = pb.authStore.model;
      if (!model) return null;
      return {
        id: model.id,
        name: model.name || model.email.split('@')[0],
        email: model.email,
        avatar: model.avatar,
      };
    },

    async register({ email, password, passwordConfirm, name, collection }: Record<string, unknown>): Promise<AuthActionResult> {
      try {
        const col = (collection as string) || 'users';
        await pb.collection(col).create({
          email: email as string,
          password: password as string,
          passwordConfirm: (passwordConfirm ?? password) as string,
          name: name as string | undefined,
        });
        return { success: true, redirectTo: '/login' };
      } catch (err) {
        return { success: false, error: { message: (err as Error).message } };
      }
    },

    async forgotPassword({ email, collection }: Record<string, unknown>): Promise<AuthActionResult> {
      try {
        const col = (collection as string) || 'users';
        await pb.collection(col).requestPasswordReset(email as string);
        return { success: true };
      } catch (err) {
        return { success: false, error: { message: (err as Error).message } };
      }
    },

    async updatePassword({ token, password, passwordConfirm, collection }: Record<string, unknown>): Promise<AuthActionResult> {
      try {
        const col = (collection as string) || 'users';
        await pb.collection(col).confirmPasswordReset(
          token as string,
          password as string,
          (passwordConfirm ?? password) as string,
        );
        return { success: true, redirectTo: '/' };
      } catch (err) {
        return { success: false, error: { message: (err as Error).message } };
      }
    },

    async onError(error: unknown): Promise<{ redirectTo?: string; logout?: boolean }> {
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('403'))) {
        return { redirectTo: '/login', logout: true };
      }
      return {};
    },
  };
}
