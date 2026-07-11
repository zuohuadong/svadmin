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
type SuccessfulResponse<Response> = Response extends { 200: infer Payload }
  ? Payload
  : Response extends { '200': infer Payload }
    ? Payload
    : Response;

type ResourceItem<Response> = SuccessfulResponse<Response> extends infer Payload
  ? Payload extends { items: readonly (infer Item)[] }
    ? Item
    : Payload extends { data: readonly (infer Item)[] }
      ? Item
      : Payload extends readonly (infer Item)[]
        ? Item
        : never
  : never;

type RouteResource<Route> = Route extends { get: { response: infer Response } }
  ? ResourceItem<Response>
  : never;

type InferEdenResourceMap<Routes> = {
  [Resource in keyof Routes as Resource extends string
    ? Routes[Resource] extends { get: { response: unknown } }
      ? [RouteResource<Routes[Resource]>] extends [never] ? never : Resource
      : never
    : never
  ]: RouteResource<Routes[Resource]>
};

type InferLegacyResourceMap<Routes> = {
  [Path in keyof Routes as Path extends `/${infer Resource}`
    ? Resource extends `${string}/${string}`
      ? never
      : [RouteResource<Routes[Path]>] extends [never] ? never : Resource
    : never
  ]: RouteResource<Routes[Path]>
};

export type InferResourceMap<App> = App extends { '~Routes': infer Routes }
  ? InferEdenResourceMap<Routes>
  : App extends { _routes: infer Routes }
    ? InferLegacyResourceMap<Routes>
    : Record<string, never>;
