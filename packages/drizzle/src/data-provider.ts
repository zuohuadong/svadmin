/**
 * @svadmin/drizzle — Drizzle ORM DataProvider adapter
 *
 * Thin wrapper around refine-sqlx that returns a @svadmin/core DataProvider.
 * Supports SQLite, PostgreSQL, MySQL, and Cloudflare D1.
 *
 * @example
 * ```ts
 * import { createDrizzleDataProvider } from '@svadmin/drizzle';
 * import { drizzle } from 'drizzle-orm/bun-sqlite';
 * import * as schema from './schema';
 *
 * const db = drizzle(new Database(':memory:'), { schema });
 * const dataProvider = await createDrizzleDataProvider({ connection: db, schema });
 * ```
 */

import type { DataProvider } from '@svadmin/core';
import type { RefineSQLConfig } from 'refine-sqlx';
import { createRefineSQL } from 'refine-sqlx';

export type { RefineSQLConfig } from 'refine-sqlx';

/**
 * Create a svadmin DataProvider backed by Drizzle ORM.
 *
 * Wraps refine-sqlx's `createRefineSQL()` and returns a `@svadmin/core` DataProvider.
 * Both type systems are structurally compatible (duck typing), so the wrapper is
 * a simple type-level bridge with no runtime overhead.
 *
 * @param config - refine-sqlx configuration (connection, schema, features, etc.)
 * @returns A @svadmin/core DataProvider
 *
 * @example
 * ```ts
 * import { createDrizzleDataProvider } from '@svadmin/drizzle';
 * import { drizzle } from 'drizzle-orm/bun-sqlite';
 * import { Database } from 'bun:sqlite';
 * import * as schema from './schema';
 *
 * const db = drizzle(new Database('./app.db'), { schema });
 *
 * const dataProvider = await createDrizzleDataProvider({
 *   connection: db,
 *   schema,
 *   softDelete: { enabled: true },
 *   features: {
 *     relations: { enabled: true },
 *     transactions: { enabled: true },
 *   },
 * });
 * ```
 */
export async function createDrizzleDataProvider<
  TSchema extends Record<string, unknown>,
>(config: RefineSQLConfig<TSchema>): Promise<DataProvider> {
  const provider = await createRefineSQL(config);

  // refine-sqlx's DataProvider is structurally compatible with @svadmin/core's DataProvider:
  //   - Same method names: getList, getOne, getMany, create, update, deleteOne, etc.
  //   - Same parameter shapes: { resource, pagination, sorters, filters, meta, ... }
  //   - Same return shapes: { data, total } / { data }
  //
  // The only nominal difference is type naming (GetListResponse vs GetListResult, etc.)
  // which TypeScript's structural type system bridges automatically.
  //
  // The `custom()` method has a minor signature superset (refine-sqlx supports
  // 'head' and 'options' HTTP methods that svadmin doesn't define), which is
  // a non-breaking superset — safe to cast.
  return provider as unknown as DataProvider;
}
