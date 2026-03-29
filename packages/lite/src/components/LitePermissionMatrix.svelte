<script lang="ts">
  /**
   * LitePermissionMatrix — SSR-compatible permission matrix.
   * Pure HTML table with checkbox inputs. No client-side JS required.
   * Works with form POST actions for state changes.
   */

  interface LiteRole {
    code: string;
    name: string;
  }

  interface LiteResource {
    code: string;
    name: string;
    section?: string;
  }

  interface LiteAction {
    code: string;
    name: string;
  }

  interface Props {
    roles: LiteRole[];
    resources: LiteResource[];
    actions: LiteAction[];
    /** Current permissions map: { "resource:action": true } */
    permissions: Record<string, boolean>;
    selectedRole?: string;
    /** Form POST action URL */
    actionUrl?: string;
    disabled?: boolean;
  }

  let {
    roles,
    resources,
    actions,
    permissions,
    selectedRole = roles[0]?.code || '',
    actionUrl = '?/updatePermissions',
    disabled = false,
  }: Props = $props();

  function isGranted(resource: string, action: string): boolean {
    return permissions[`${resource}:${action}`] === true;
  }
</script>

<div class="lite-permission-matrix">
  <!-- Role Tabs -->
  <div class="lite-role-tabs">
    {#each roles as role}
      <a
        href="?role={role.code}"
        class="lite-role-tab {selectedRole === role.code ? 'active' : ''}"
      >
        {role.name}
      </a>
    {/each}
  </div>

  <!-- Matrix Table -->
  <form method="POST" action={actionUrl}>
    <input type="hidden" name="role" value={selectedRole} />

    <table class="lite-table" style="margin-top:0;">
      <thead>
        <tr>
          <th style="width:200px;">Resource</th>
          {#each actions as action}
            <th style="text-align:center;">{action.name}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each resources as resource, i}
          {#if resource.section && (i === 0 || resource.section !== resources[i-1].section)}
            <tr>
              <td colspan={actions.length + 1} style="background:#f1f5f9;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#475569;">
                {resource.section}
              </td>
            </tr>
          {/if}
          <tr>
            <td><strong>{resource.name}</strong><br/><small style="color:#94a3b8;">{resource.code}</small></td>
            {#each actions as action}
              <td style="text-align:center;">
                <input
                  type="checkbox"
                  name="perm_{resource.code}_{action.code}"
                  checked={isGranted(resource.code, action.code)}
                  {disabled}
                  style="width:18px;height:18px;cursor:{disabled ? 'not-allowed' : 'pointer'};"
                />
              </td>
            {/each}
          </tr>
        {/each}
        {#if resources.length === 0}
          <tr>
            <td colspan={actions.length + 1} style="text-align:center;padding:24px;color:#94a3b8;">
              No resources configured.
            </td>
          </tr>
        {/if}
      </tbody>
    </table>

    {#if !disabled}
      <div style="margin-top:12px;text-align:right;">
        <button type="submit" class="lite-btn lite-btn-primary">Save Permissions</button>
      </div>
    {/if}
  </form>
</div>

<style>
  .lite-role-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 16px;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 0;
  }
  .lite-role-tab {
    padding: 8px 16px;
    text-decoration: none;
    color: #64748b;
    font-size: 14px;
    font-weight: 500;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    transition: color 0.15s, border-color 0.15s;
  }
  .lite-role-tab:hover {
    color: #1e293b;
  }
  .lite-role-tab.active {
    color: #3b82f6;
    border-bottom-color: #3b82f6;
    font-weight: 600;
  }
</style>
