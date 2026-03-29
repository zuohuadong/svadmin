// @svadmin/lite — Lightweight SSR Admin UI
// Zero client-side JS required. IE11 compatible.

// Server utilities (use in +page.server.ts / hooks.server.ts)
export {
  createListLoader,
  createDetailLoader,
  createCrudActions,
  createAuthGuard,
  createAuthActions,
  createLegacyRedirectHook,
  isLegacyBrowser,
} from './server-adapter';
export type { ListLoaderResult } from './server-adapter';

// Schema generator (use with sveltekit-superforms)
export {
  fieldsToZodSchema,
  resourceToZodSchema,
  fieldToInputType,
  fieldToPlaceholder,
} from './schema-generator';

// UI Components (use in +page.svelte with csr = false)
export { default as LiteLayout } from './components/LiteLayout.svelte';
export { default as LiteTable } from './components/LiteTable.svelte';
export { default as LitePagination } from './components/LitePagination.svelte';
export { default as LiteForm } from './components/LiteForm.svelte';
export { default as LiteLogin } from './components/LiteLogin.svelte';
export { default as LiteShow } from './components/LiteShow.svelte';
export { default as LiteSearch } from './components/LiteSearch.svelte';
export { default as LiteAlert } from './components/LiteAlert.svelte';
export { default as LitePermissionMatrix } from './components/LitePermissionMatrix.svelte';
export { default as LiteAuditLog } from './components/LiteAuditLog.svelte';
export { default as LiteArrayField } from './components/LiteArrayField.svelte';
