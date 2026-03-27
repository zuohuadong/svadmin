// Core type definitions — DataProvider + AuthProvider + Providers

// ─── HttpError ─────────────────────────────────────────────────

export type ValidationErrors = Record<string, string | string[]>;

export class HttpError extends Error {
  statusCode: number;
  errors?: ValidationErrors;

  constructor(message: string, statusCode: number, errors?: ValidationErrors) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export class UndoError extends Error {
  constructor() {
    super('Mutation undone');
    this.name = 'UndoError';
  }
}

// ─── Base Types ───────────────────────────────────────────────

export type BaseRecord = any;

// ─── DataProvider ─────────────────────────────────────────────

export interface Pagination {
  current?: number;
  pageSize?: number;
  mode?: 'server' | 'client' | 'off';
}

export interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

export type CrudOperator =
  | 'eq' | 'ne' | 'lt' | 'gt' | 'lte' | 'gte'
  | 'contains' | 'ncontains'
  | 'startswith' | 'endswith'
  | 'in' | 'nin'
  | 'null' | 'nnull'
  | 'between' | 'nbetween';

export interface Filter {
  field: string;
  operator: CrudOperator;
  value: unknown;
}

export interface LogicalFilter {
  operator: 'or' | 'and';
  value: Filter[];
}

export interface GetListParams {
  resource: string;
  pagination?: Pagination;
  sorters?: Sort[];
  filters?: Filter[];
  meta?: Record<string, unknown>;
}

export interface GetListResult<TData extends BaseRecord = BaseRecord> {
  data: TData[];
  total: number;
}

export interface GetOneParams {
  resource: string;
  id: string | number;
  meta?: Record<string, unknown>;
}

export interface GetOneResult<TData extends BaseRecord = BaseRecord> {
  data: TData;
}

export interface GetManyParams {
  resource: string;
  ids: (string | number)[];
  meta?: Record<string, unknown>;
}

export interface GetManyResult<TData extends BaseRecord = BaseRecord> {
  data: TData[];
}

export interface CreateParams<TVariables = unknown> {
  resource: string;
  variables: TVariables;
  meta?: Record<string, unknown>;
}

export interface CreateResult<TData extends BaseRecord = BaseRecord> {
  data: TData;
}

export interface CreateManyParams<TVariables = unknown> {
  resource: string;
  variables: TVariables[];
  meta?: Record<string, unknown>;
}

export interface CreateManyResult<TData extends BaseRecord = BaseRecord> {
  data: TData[];
}

export interface UpdateParams<TVariables = unknown> {
  resource: string;
  id: string | number;
  variables: TVariables;
  meta?: Record<string, unknown>;
}

export interface UpdateResult<TData extends BaseRecord = BaseRecord> {
  data: TData;
}

export interface UpdateManyParams<TVariables = unknown> {
  resource: string;
  ids: (string | number)[];
  variables: TVariables;
  meta?: Record<string, unknown>;
}

export interface UpdateManyResult<TData extends BaseRecord = BaseRecord> {
  data: TData[];
}

export interface DeleteParams<TVariables = unknown> {
  resource: string;
  id: string | number;
  variables?: TVariables;
  meta?: Record<string, unknown>;
}

export interface DeleteResult<TData extends BaseRecord = BaseRecord> {
  data: TData;
}

export interface DeleteManyParams<TVariables = unknown> {
  resource: string;
  ids: (string | number)[];
  variables?: TVariables;
  meta?: Record<string, unknown>;
}

export interface DeleteManyResult<TData extends BaseRecord = BaseRecord> {
  data: TData[];
}

export interface CustomParams<TVariables = unknown> {
  url: string;
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  payload?: TVariables;
  query?: Record<string, unknown>;
  headers?: Record<string, string>;
  sorters?: Sort[];
  filters?: Filter[];
  meta?: Record<string, unknown>;
}

export interface CustomResult<TData = unknown> {
  data: TData;
}

export interface DataProvider {
  // Required methods
  getList: <TData extends BaseRecord = BaseRecord>(params: GetListParams) => Promise<GetListResult<TData>>;
  getOne: <TData extends BaseRecord = BaseRecord>(params: GetOneParams) => Promise<GetOneResult<TData>>;
  create: <TData extends BaseRecord = BaseRecord, TVariables = unknown>(params: CreateParams<TVariables>) => Promise<CreateResult<TData>>;
  update: <TData extends BaseRecord = BaseRecord, TVariables = unknown>(params: UpdateParams<TVariables>) => Promise<UpdateResult<TData>>;
  deleteOne: <TData extends BaseRecord = BaseRecord, TVariables = unknown>(params: DeleteParams<TVariables>) => Promise<DeleteResult<TData>>;
  getApiUrl: () => string;

  // Optional bulk methods
  getMany?: <TData extends BaseRecord = BaseRecord>(params: GetManyParams) => Promise<GetManyResult<TData>>;
  createMany?: <TData extends BaseRecord = BaseRecord, TVariables = unknown>(params: CreateManyParams<TVariables>) => Promise<CreateManyResult<TData>>;
  updateMany?: <TData extends BaseRecord = BaseRecord, TVariables = unknown>(params: UpdateManyParams<TVariables>) => Promise<UpdateManyResult<TData>>;
  deleteMany?: <TData extends BaseRecord = BaseRecord, TVariables = unknown>(params: DeleteManyParams<TVariables>) => Promise<DeleteManyResult<TData>>;

  // Optional custom method
  custom?: <TData = unknown, TVariables = unknown>(params: CustomParams<TVariables>) => Promise<CustomResult<TData>>;
}

// ─── AuthProvider ─────────────────────────────────────────────

export interface Identity {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  [key: string]: unknown;
}

export interface AuthActionResult {
  success: boolean;
  redirectTo?: string;
  error?: { message: string; name?: string };
}

export interface CheckResult {
  authenticated: boolean;
  redirectTo?: string;
  error?: { message: string; name?: string };
  logout?: boolean;
}

export interface AuthProvider {
  login: (params: Record<string, unknown>) => Promise<AuthActionResult>;
  logout: (params?: Record<string, unknown>) => Promise<AuthActionResult>;
  check: (params?: Record<string, unknown>) => Promise<CheckResult>;
  getIdentity: () => Promise<Identity | null>;
  getPermissions?: (params?: Record<string, unknown>) => Promise<unknown>;
  register?: (params: Record<string, unknown>) => Promise<AuthActionResult>;
  forgotPassword?: (params: Record<string, unknown>) => Promise<AuthActionResult>;
  updatePassword?: (params: Record<string, unknown>) => Promise<AuthActionResult>;
  onError?: (error: unknown) => Promise<{ redirectTo?: string; logout?: boolean }>;
}

// ─── NotificationProvider ─────────────────────────────────────

export interface NotificationProvider {
  open: (params: { type: 'success' | 'error' | 'warning' | 'info'; message: string; description?: string; key?: string }) => void;
  close: (key: string) => void;
}

// ─── MutationMode ─────────────────────────────────────────────

export type MutationMode = 'pessimistic' | 'optimistic' | 'undoable';

// ─── ResourceDefinition ───────────────────────────────────────

export interface ResourceDefinition {
  name: string;
  /** Unique identifier — use when multiple resources share the same `name` but target different DataProviders */
  identifier?: string;
  label: string;
  icon?: string;
  primaryKey?: string;
  fields: FieldDefinition[];
  defaultSort?: Sort;
  pageSize?: number;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canShow?: boolean;
  showInMenu?: boolean;
  parentName?: string;
  menuOrder?: number;
  /** Navigation group name — resources with the same group are displayed in a collapsible section */
  group?: string;
  meta?: Record<string, unknown> & { dataProviderName?: string; parent?: string };
}

// ─── MenuItem (Multi-Level Menu) ──────────────────────────────

export interface MenuItem {
  /** Unique identifier, also used as i18n fallback key: t(`menu.${name}`) */
  name: string;
  /** Display label. Falls back to `t('menu.${name}')` if omitted */
  label?: string;
  /** Icon name string (maps to lucide icon set) or Svelte component */
  icon?: string;
  /** Navigation path — omit for parent-only menu nodes */
  href?: string;
  /** Open in new tab (useful for external links) */
  target?: '_blank' | '_self';
  /** Permission check metadata */
  meta?: {
    resource?: string;
    action?: string;
    /** Hide this item from the menu entirely */
    hidden?: boolean;
  };
  /** Sub-menu items — supports infinite nesting */
  children?: MenuItem[];
}

export interface FieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'select' | 'multiselect' | 'tags'
    | 'textarea' | 'richtext' | 'image' | 'images' | 'json' | 'relation' | 'color' | 'url' | 'email' | 'phone';
  required?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  showInList?: boolean;
  showInForm?: boolean;
  showInCreate?: boolean;
  showInEdit?: boolean;
  showInShow?: boolean;
  options?: { label: string; value: string | number }[];
  defaultValue?: unknown;
  // Relation support
  resource?: string;       // related resource name
  optionLabel?: string;    // field to use as label
  optionValue?: string;    // field to use as value
  // Validation
  validate?: (value: unknown) => string | null;
  // Grouping
  group?: string;
}

// ─── Resource Type Registry ───────────────────────────────────

/**
 * Extend this interface via declaration merging to register resource types.
 * When registered, all hooks automatically infer data types from resource names.
 *
 * @example
 * ```ts
 * declare module '@svadmin/core' {
 *   interface ResourceTypeMap {
 *     users: { id: string; name: string; email: string }
 *     posts: { id: string; title: string; content: string }
 *   }
 * }
 *
 * // Now hooks auto-infer:
 * const list = useList({ resource: 'users' })
 * // list.data → { id: string; name: string; email: string }[]
 * ```
 */
export interface ResourceTypeMap {}

/** When ResourceTypeMap is empty → string (backward compatible); otherwise → registered keys */
export type KnownResources = keyof ResourceTypeMap extends never
  ? string
  : Extract<keyof ResourceTypeMap, string>

/** Infer data type from resource name. Falls back to Record<string, unknown> for unregistered resources */
export type InferData<R extends string> = R extends keyof ResourceTypeMap
  ? ResourceTypeMap[R]
  : Record<string, unknown>
