<script lang="ts">
  /**
   * LiteLayout — Minimal server-rendered sidebar + main layout.
   * No client-side JS required. Uses only IE11-safe CSS classes.
   */
  import type { ResourceDefinition } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';

  interface Props {
    resources: ResourceDefinition[];
    currentResource?: string;
    brandName?: string;
    userName?: string;
    basePath?: string;
    children: any;
  }

  let {
    resources,
    currentResource = '',
    brandName = 'Admin',
    userName = '',
    basePath = '/lite',
    children,
  }: Props = $props();

  const menuResources = $derived(
    resources.filter(r => r.showInMenu !== false)
  );
</script>

<div class="lite-wrapper">
  <!-- Sidebar -->
  <nav class="lite-sidebar">
    <div class="lite-sidebar-brand">{brandName}</div>
    {#each menuResources as res}
      <a
        href="{basePath}/{res.name}"
        class={res.name === currentResource ? 'active' : ''}
      >
        {res.label}
      </a>
    {/each}
    {#if userName}
      <div style="position:absolute;bottom:0;left:0;right:0;padding:12px 16px;border-top:1px solid #334155;font-size:12px;color:#94a3b8;">
        {userName}
        <form method="POST" action="{basePath}/login?/logout" style="display:inline;margin-left:8px;">
          <button type="submit" class="lite-btn lite-btn-sm" style="color:#94a3b8;border-color:#475569;background:transparent;">Logout</button>
        </form>
      </div>
    {/if}
  </nav>

  <!-- Main Content -->
  <main class="lite-main">
    {@render children()}
  </main>
</div>
