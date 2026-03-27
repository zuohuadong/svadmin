// @svadmin/drizzle — Drizzle ORM DataProvider for svadmin
//
// Usage:
//   import { createDrizzleDataProvider } from '@svadmin/drizzle';

export { createDrizzleDataProvider } from './data-provider';
export type { RefineSQLConfig } from './data-provider';

export { inferFieldsFromDrizzle } from './infer-fields';
export type { InferFieldsOptions } from './infer-fields';

// Re-export commonly used refine-sqlx utilities for convenience
export type {
  SecurityConfig,
  FeaturesConfig,
  CacheConfig,
  CacheAdapter,
} from 'refine-sqlx';

export {
  SecurityGuard,
  validateConfig,
  validateFeaturesConfig,
} from 'refine-sqlx';
