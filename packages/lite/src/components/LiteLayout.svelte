<script lang="ts">
  /**
   * LiteLayout — Minimal server-rendered sidebar + main layout.
   * No client-side JS required. Uses only IE11-safe CSS classes.
   * Supports multi-level menus via <details>/<summary> (pure HTML).
   */
  import type { ResourceDefinition, MenuItem } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';

  interface Props {
    resources: ResourceDefinition[];
    currentResource?: string;
    brandName?: string;
    userName?: string;
    basePath?: string;
    /** Optional multi-level menu configuration */
    menu?: MenuItem[];
    children: any;
  }

  let {
    resources,
    currentResource = '',
    brandName = 'Admin',
    userName = '',
    basePath = '/lite',
    menu,
    children,
  }: Props = $props();

  const menuResources = $derived(
    resources.filter((r: ResourceDefinition) => r.showInMenu !== false)
  );

  function isActive(href: string | undefined): boolean {
    if (!href) return false;
    return currentResource === href.replace(basePath + '/', '');
  }
</script>

<div class="lite-wrapper">
  <!-- Sidebar -->
  <nav class="lite-sidebar">
    <div class="lite-sidebar-brand">{brandName}</div>
    {#if menu && menu.length > 0}
      {#each menu as item}
        {#if item.children && item.children.length > 0}
          <details class="lite-menu-group">
            <summary class="lite-menu-parent">{item.label ?? item.name}</summary>
            {#each item.children as child}
              {#if child.children && child.children.length > 0}
                <details class="lite-menu-group" style="margin-left:12px">
                  <summary class="lite-menu-parent">{child.label ?? child.name}</summary>
                  {#each child.children as grandchild}
                    <a
                      href={grandchild.href ?? `${basePath}/${grandchild.name}`}
                      class={isActive(grandchild.href ?? `${basePath}/${grandchild.name}`) ? 'active' : ''}
                      target={grandchild.target === '_blank' ? '_blank' : undefined}
                      style="padding-left:40px"
                    >{grandchild.label ?? grandchild.name}</a>
                  {/each}
                </details>
              {:else}
                <a
                  href={child.href ?? `${basePath}/${child.name}`}
                  class={isActive(child.href ?? `${basePath}/${child.name}`) ? 'active' : ''}
                  target={child.target === '_blank' ? '_blank' : undefined}
                  style="padding-left:28px"
                >{child.label ?? child.name}</a>
              {/if}
            {/each}
          </details>
        {:else}
          <a
            href={item.href ?? `${basePath}/${item.name}`}
            class={isActive(item.href ?? `${basePath}/${item.name}`) ? 'active' : ''}
            target={item.target === '_blank' ? '_blank' : undefined}
          >{item.label ?? item.name}</a>
        {/if}
      {/each}
    {:else}
      {#each menuResources as res}
        <a
          href="{basePath}/{res.name}"
          class={res.name === currentResource ? 'active' : ''}
        >
          {res.label}
        </a>
      {/each}
    {/if}
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

