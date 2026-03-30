/**
 * Casbin adapter for svadmin AccessControlProvider.
 *
 * Converts a Casbin `Enforcer` instance into an `AccessControlProvider`.
 *
 * @example
 * ```ts
 * import { newEnforcer } from 'casbin';
 * import { createCasbinAccessControl } from '@svadmin/core/adapters/casbin';
 * import { setAccessControlProvider } from '@svadmin/core';
 *
 * const enforcer = await newEnforcer('model.conf', 'policy.csv');
 * const currentUser = 'alice';
 *
 * setAccessControlProvider(
 *   createCasbinAccessControl(enforcer, { getUser: () => currentUser })
 * );
 * ```
 */

import type { AccessControlProvider, CanParams, CanResult } from '../permissions';

/** Casbin Enforcer interface (minimal, to avoid hard dependency on casbin) */
interface CasbinEnforcer {
  enforce: (...args: string[]) => Promise<boolean>;
}

export interface CasbinAdapterOptions {
  /** Function to get the current user/subject for enforcement. */
  getUser: () => string;
  /** Provider-level options */
  providerOptions?: AccessControlProvider['options'];
}

/**
 * Create an AccessControlProvider from a Casbin Enforcer.
 *
 * Uses the standard (sub, obj, act) enforcement model:
 * - sub = current user (from `getUser()`)
 * - obj = resource name
 * - act = action
 *
 * @param enforcer - A Casbin Enforcer instance
 * @param options - Configuration with user getter
 */
export function createCasbinAccessControl(
  enforcer: CasbinEnforcer,
  options: CasbinAdapterOptions,
): AccessControlProvider {
  return {
    can: async (params: CanParams | CanParams[]): Promise<CanResult | CanResult[]> => {
      const executeCheck = async ({ resource, action }: CanParams) => {
        const user = options.getUser();
        const allowed = await enforcer.enforce(user, resource, action);
        return {
          can: allowed,
          reason: allowed ? undefined : `User "${user}" cannot "${action}" on "${resource}"`,
        };
      };

      if (Array.isArray(params)) {
        return Promise.all(params.map(p => executeCheck(p)));
      }
      return executeCheck(params);
    },
    options: options.providerOptions,
  };
}
