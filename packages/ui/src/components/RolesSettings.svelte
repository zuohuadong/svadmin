<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import { getAuthProvider, getResources } from '@svadmin/core';
  import type { Role } from '@svadmin/core';
  import PermissionMatrix from './PermissionMatrix.svelte';
  import type { RoleInfo, ResourceInfo, ActionInfo } from '../types.js';
  import { toast } from '@svadmin/core/toast';
  import { AlertCircle } from '@lucide/svelte';

  const authProvider = getAuthProvider();
  const rawResources = getResources();

  let roles = $state<RoleInfo[]>([]);
  let selectedRoleCode = $state<string>('');
  
  // Matrix format: { "roleId": { "resourceName": ["action1", "action2"] } }
  let permissionsCache = $state<Record<string, Record<string, string[]>>>({});
  
  let loadingRoles = $state(true);
  let loadingPermissions = $state(false);
  let saving = $state(false);
  let error = $state<string | null>(null);

  // Convert system resources to MatrixResource format
  let matrixResources = $derived<ResourceInfo[]>(
    rawResources.map(r => ({
      code: r.name,
      name: r.label || r.name,
    }))
  );

  let matrixActions = $state<ActionInfo[]>([
    { code: 'create', name: t('common.create') ?? 'Create' },
    { code: 'read', name: t('common.detail') ?? 'Read' },
    { code: 'update', name: t('common.edit') ?? 'Update' },
    { code: 'delete', name: t('common.delete') ?? 'Delete' },
  ]);

  async function loadRoles() {
    if (!authProvider?.getRoles) {
      error = t('settings.rbacNotSupported') ?? 'RBAC not supported by AuthProvider';
      loadingRoles = false;
      return;
    }
    try {
      const fetchedRoles = await authProvider.getRoles();
      roles = fetchedRoles.map(r => ({ code: r.id, ...r }));
      if (roles.length > 0 && !selectedRoleCode) {
        selectedRoleCode = roles[0].code;
      }
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loadingRoles = false;
    }
  }

  async function loadPermissionsForRole(roleId: string) {
    if (!authProvider?.getRolePermissions || permissionsCache[roleId]) return;
    
    loadingPermissions = true;
    try {
      const perms = await authProvider.getRolePermissions(roleId);
      permissionsCache[roleId] = perms;
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      loadingPermissions = false;
    }
  }

  // Load permissions whenever the selected role changes
  $effect(() => {
    if (selectedRoleCode && !permissionsCache[selectedRoleCode] && !loadingPermissions) {
      loadPermissionsForRole(selectedRoleCode);
    }
  });

  $effect(() => {
    loadRoles();
  });

  // isGranted logic
  function checkGrant(roleCode: string, resourceCode: string, actionCode: string) {
    const rolePerms = permissionsCache[roleCode];
    if (!rolePerms) return false;
    return rolePerms[resourceCode]?.includes(actionCode) ?? false;
  }

  async function handleToggle(roleCode: string, resourceCode: string, actionCode: string, grant: boolean) {
    if (!authProvider?.updateRolePermissions) return;
    
    // Copy state
    const currentRolePerms = { ...(permissionsCache[roleCode] || {}) };
    const currentResPerms = [...(currentRolePerms[resourceCode] || [])];

    // Optimistic update
    if (grant) {
      if (!currentResPerms.includes(actionCode)) currentResPerms.push(actionCode);
    } else {
      const idx = currentResPerms.indexOf(actionCode);
      if (idx > -1) currentResPerms.splice(idx, 1);
    }
    
    currentRolePerms[resourceCode] = currentResPerms;
    permissionsCache[roleCode] = currentRolePerms;

    saving = true;
    try {
      // Send the entire role's permissions back (as defined by our AuthProvider interface)
      const result = await authProvider.updateRolePermissions(roleCode, currentRolePerms);
      if (result.success) {
        // Success silently
      } else {
         throw new Error(result.error?.message ?? t('common.operationFailed'));
      }
    } catch (e) {
      toast.error((e as Error).message);
      // Rollback on fail
      delete permissionsCache[roleCode];
      loadPermissionsForRole(roleCode);
    } finally {
      saving = false;
    }
  }
</script>

{#if error}
  <div class="h-full flex items-center justify-center">
    <div class="max-w-md p-6 border border-destructive/20 bg-destructive/10 text-destructive rounded-lg flex flex-col items-center gap-3 text-center">
      <AlertCircle class="h-8 w-8" />
      <h3 class="font-bold text-lg">{t('common.error') ?? 'Error'}</h3>
      <p>{error}</p>
    </div>
  </div>
{:else}
  <PermissionMatrix 
    {roles}
    resources={matrixResources}
    actions={matrixActions}
    isGranted={checkGrant}
    bind:selectedRole={selectedRoleCode}
    loading={loadingRoles || loadingPermissions || saving}
    onToggle={handleToggle}
  />
{/if}
