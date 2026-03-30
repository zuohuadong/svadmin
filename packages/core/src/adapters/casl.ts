/**
 * CASL adapter for svadmin AccessControlProvider.
 *
 * Converts a CASL `Ability` instance into an `AccessControlProvider`.
 *
 * @example
 * ```ts
 * import { AbilityBuilder, createMongoAbility } from '@casl/ability';
 * import { createCaslAccessControl } from '@svadmin/core/adapters/casl';
 * import { setAccessControlProvider } from '@svadmin/core';
 *
 * const { can, build } = new AbilityBuilder(createMongoAbility);
 * can('read', 'Post');
 * can('create', 'Post');
 * can('manage', 'User');
 * const ability = build();
 *
 * setAccessControlProvider(createCaslAccessControl(ability));
 * ```
 */

import type { AccessControlProvider, CanParams, CanResult } from '../permissions';

/** CASL Ability interface (minimal, to avoid hard dependency on @casl/ability) */
interface CaslAbility {
  can: (action: string, subject: string, field?: string) => boolean;
  cannot: (action: string, subject: string, field?: string) => boolean;
}

/**
 * Create an AccessControlProvider from a CASL Ability.
 *
 * @param ability - A CASL Ability instance
 * @param options - Optional configuration
 */
export function createCaslAccessControl(
  ability: CaslAbility,
  options?: AccessControlProvider['options'],
): AccessControlProvider {
  return {
    can: async (params: CanParams | CanParams[]): Promise<CanResult | CanResult[]> => {
      const executeCheck = async ({ resource, action, params: actionParams }: CanParams) => {
        const field = actionParams?.field as string | undefined;
        // CaslAbility's can only accepts string for subject based on its internal definition in this file
        // To support object subjects when CanParams might pass them, cast it to any here to satisfy the local interface
        const allowed = ability.can(action as string, resource as any, field);
        return {
          can: allowed,
          reason: allowed ? undefined : `Cannot "${action}" on "${resource}"${field ? ` (field: ${field})` : ''}`,
        };
      };

      if (Array.isArray(params)) {
        return Promise.all(params.map(p => executeCheck(p)));
      }
      return executeCheck(params);
    },
    options,
  };
}
