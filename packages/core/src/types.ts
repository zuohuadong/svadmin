// Core type definitions — 100% Refine-compatible DataProvider + AuthProvider + Providers

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

export interface GetListResult<T = Record<string, unknown>> {
  data: T[];
  total: number;
}

export interface GetOneParams {
  resource: string;
  id: string | number;
  meta?: Record<string, unknown>;
}

export interface GetOneResult<T = Record<string, unknown>> {
  data: T;
}

export interface GetManyParams {
  resource: string;
  ids: (string | number)[];
  meta?: Record<string, unknown>;
}

export interface GetManyResult<T = Record<string, unknown>> {
  data: T[];
}

export interface CreateParams {
  resource: string;
  variables: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

export interface CreateResult<T = Record<string, unknown>> {
  data: T;
}

export interface CreateManyParams {
  resource: string;
  variables: Record<string, unknown>[];
  meta?: Record<string, unknown>;
}

export interface CreateManyResult<T = Record<string, unknown>> {
  data: T[];
}

export interface UpdateParams {
  resource: string;
  id: string | number;
  variables: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

export interface UpdateResult<T = Record<string, unknown>> {
  data: T;
}

export interface UpdateManyParams {
  resource: string;
  ids: (string | number)[];
  variables: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

export interface UpdateManyResult<T = Record<string, unknown>> {
  data: T[];
}

export interface DeleteParams {
  resource: string;
  id: string | number;
  variables?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

export interface DeleteResult<T = Record<string, unknown>> {
  data: T;
}

export interface DeleteManyParams {
  resource: string;
  ids: (string | number)[];
  variables?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

export interface DeleteManyResult<T = Record<string, unknown>> {
  data: T[];
}

export interface CustomParams {
  url: string;
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  payload?: Record<string, unknown>;
  query?: Record<string, unknown>;
  headers?: Record<string, string>;
  sorters?: Sort[];
  filters?: Filter[];
  meta?: Record<string, unknown>;
}

export interface CustomResult<T = unknown> {
  data: T;
}

export interface DataProvider {
  // Required methods
  getList: <T = Record<string, unknown>>(params: GetListParams) => Promise<GetListResult<T>>;
  getOne: <T = Record<string, unknown>>(params: GetOneParams) => Promise<GetOneResult<T>>;
  create: <T = Record<string, unknown>>(params: CreateParams) => Promise<CreateResult<T>>;
  update: <T = Record<string, unknown>>(params: UpdateParams) => Promise<UpdateResult<T>>;
  deleteOne: <T = Record<string, unknown>>(params: DeleteParams) => Promise<DeleteResult<T>>;
  getApiUrl: () => string;

  // Optional bulk methods
  getMany?: <T = Record<string, unknown>>(params: GetManyParams) => Promise<GetManyResult<T>>;
  createMany?: <T = Record<string, unknown>>(params: CreateManyParams) => Promise<CreateManyResult<T>>;
  updateMany?: <T = Record<string, unknown>>(params: UpdateManyParams) => Promise<UpdateManyResult<T>>;
  deleteMany?: <T = Record<string, unknown>>(params: DeleteManyParams) => Promise<DeleteManyResult<T>>;

  // Optional custom method
  custom?: <T = unknown>(params: CustomParams) => Promise<CustomResult<T>>;
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
  meta?: Record<string, unknown> & { dataProviderName?: string };
}

export interface FieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'select' | 'multiselect' | 'tags'
    | 'textarea' | 'richtext' | 'image' | 'images' | 'json' | 'relation' | 'color' | 'url' | 'email' | 'phone';
  required?: boolean;
  searchable?: boolean;
  sortable?: boolean;
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
}
