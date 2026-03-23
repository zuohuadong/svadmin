<script lang="ts">
  import { getResources } from '@svadmin/core';
  import { currentPath } from '@svadmin/core/router';
  import { t } from '@svadmin/core/i18n';
  import * as Breadcrumb from './ui/breadcrumb/index.js';

  const resources = getResources();
  let path = $state(currentPath());

  function onHashChange() { path = currentPath(); }

  interface Crumb { label: string; href: string; }

  const crumbs = $derived.by(() => {
    const result: Crumb[] = [{ label: t('common.home'), href: '#/' }];
    if (path === '/') return result;

    const segments = path.split('/').filter(Boolean);
    const resourceName = segments[0];
    const res = resources.find(r => r.name === resourceName);

    if (res) {
      result.push({ label: res.label, href: `#/${res.name}` });

      if (segments[1] === 'create') {
        result.push({ label: t('common.create'), href: `#/${res.name}/create` });
      } else if (segments[1] === 'edit' && segments[2]) {
        result.push({ label: `${t('common.edit')} #${segments[2]}`, href: `#/${res.name}/edit/${segments[2]}` });
      } else if (segments[1] === 'show' && segments[2]) {
        result.push({ label: `${t('common.detail')} #${segments[2]}`, href: `#/${res.name}/show/${segments[2]}` });
      }
    }
    return result;
  });
</script>

<svelte:window onhashchange={onHashChange} />

{#if crumbs.length > 1}
  <Breadcrumb.Root class="mb-4">
    <Breadcrumb.List>
      {#each crumbs as crumb, i}
        {#if i > 0}
          <Breadcrumb.Separator />
        {/if}
        <Breadcrumb.Item>
          {#if i === crumbs.length - 1}
            <Breadcrumb.Page>{crumb.label}</Breadcrumb.Page>
          {:else}
            <Breadcrumb.Link href={crumb.href}>{crumb.label}</Breadcrumb.Link>
          {/if}
        </Breadcrumb.Item>
      {/each}
    </Breadcrumb.List>
  </Breadcrumb.Root>
{/if}
