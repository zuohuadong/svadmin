// Type utility: Infer ResourceTypeMap from an Elysia App type
//
// This extracts CRUD resource names and their response types from an Elysia app
// that uses the CRUD plugin convention (GET /resource → list, GET /resource/:id → record).
//
// Usage:
//   import type { InferResourceMap } from '@svadmin/elysia'
//   import type { App } from '../server'
//
//   declare module '@svadmin/core' {
//     interface ResourceTypeMap extends InferResourceMap<App> {}
//   }

/**
 * Extract resource types from an Elysia App type.
 *
 * This works by inspecting the app's route schema type:
 * - Looks for GET routes at `/:resource` that return `{ items: T[], total: number }`
 * - Extracts `T` as the resource data type
 *
 * Note: This is a best-effort type inference. For complex Elysia setups,
 * you may want to manually declare your ResourceTypeMap instead.
 *
 * @example
 * ```ts
 * // server.ts
 * const app = new Elysia()
 *   .use(crud('users', { schema: UserSchema, ... }))
 *   .use(crud('posts', { schema: PostSchema, ... }))
 *
 * export type App = typeof app
 *
 * // client-side types.d.ts
 * import type { InferResourceMap } from '@svadmin/elysia'
 * import type { App } from '../server'
 *
 * declare module '@svadmin/core' {
 *   interface ResourceTypeMap extends InferResourceMap<App> {}
 * }
 * ```
 */
export type InferResourceMap<App> = App extends { _routes: infer Routes }
  ? {
      [K in keyof Routes as K extends `/${infer Resource}`
        ? Resource extends `${string}/${string}` ? never : Resource
        : never
      ]: Routes[K] extends { get: { response: { 200: infer Res } } }
        ? Res extends { items: (infer Item)[] }
          ? Item
          : Res
        : never
    }
  : Record<string, never>;
