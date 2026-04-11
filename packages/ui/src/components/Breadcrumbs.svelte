<script lang="ts">
  import { getResources } from '@svadmin/core';
  import { getPath } from '../router-state.svelte.js';
  import { formatLink } from '@svadmin/core/router';
  import { t } from '@svadmin/core/i18n';
  import * as Breadcrumb from './ui/breadcrumb/index.js';

  const resources = getResources();

  interface Crumb { label: string; href: string; }

  const crumbs = $derived.by(() => {
    const result: Crumb[] = [{ label: t('common.home') ?? 'Home', href: formatLink('/') }];
    const path = getPath().replace(/^\//, ''); // trim leading slash so segments[0] is the resource
    if (path === '') return result;

    const segments = path.split('/').filter(Boolean);
    const resourceName = segments[0];
    const res = resources.find(r => r.name === resourceName);

    if (res) {
      result.push({ label: res.label, href: formatLink(`/${res.name}`) });

      if (segments[1] === 'create') {
        result.push({ label: t('common.create') ?? 'Create', href: formatLink(`/${res.name}/create`) });
      } else if (segments[1] === 'edit' && segments[2]) {
        result.push({ label: `${t('common.edit') ?? 'Edit'} #${segments[2]}`, href: formatLink(`/${res.name}/edit/${segments[2]}`) });
      } else if (segments[1] === 'show' && segments[2]) {
        result.push({ label: `${t('common.detail') ?? 'Details'} #${segments[2]}`, href: formatLink(`/${res.name}/show/${segments[2]}`) });
      }
    }
    return result;
  });
</script>

{#if crumbs.length > 1}
  <Breadcrumb.Root class="mb-4">
    <Breadcrumb.List>
      {#each crumbs as crumb, i (crumb.href)}
        {#if i > 0}
          <Breadcrumb.Separator />
        {/if}
        <Breadcrumb.Item>
          <span class="inline-flex svadmin-page-enter" style="animation-duration: 0.2s;">
          {#if i === crumbs.length - 1}
            <Breadcrumb.Page>{crumb.label}</Breadcrumb.Page>
          {:else}
            <Breadcrumb.Link href={crumb.href}>{crumb.label}</Breadcrumb.Link>
          {/if}
          </span>
        </Breadcrumb.Item>
      {/each}
    </Breadcrumb.List>
  </Breadcrumb.Root>
{/if}
