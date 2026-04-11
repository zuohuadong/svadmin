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
    const path = getPath().replace(/^\//, ''); 
    if (path === '') return result;

    const segments = path.split('/').filter(Boolean);
    const resourceNames = resources.map(r => r.name);
    
    let currentPath = '';

    for (let i = 0; i < segments.length; i++) {
       const seg = segments[i];
       currentPath += `/${seg}`;

       if (resourceNames.includes(seg)) {
          const res = resources.find(r => r.name === seg)!;
          result.push({ label: res.label, href: formatLink(currentPath) });
       } else if (i > 0 && resourceNames.includes(segments[i-1])) {
          // This is a parent ID (e.g. /teams/123/users)
          result.push({ label: `#${seg}`, href: formatLink(currentPath) });
       } else if (seg === 'create') {
          result.push({ label: t('common.create') ?? 'Create', href: formatLink(currentPath) });
       } else if (['edit', 'show', 'clone'].includes(seg) && segments[i+1]) {
          const actionLabel = seg === 'edit' ? (t('common.edit') ?? 'Edit') : 
                              seg === 'show' ? (t('common.detail') ?? 'Details') : 
                              (t('common.clone') ?? 'Clone');
          const id = segments[i+1];
          currentPath += `/${id}`; // advance path by id
          result.push({ label: `${actionLabel} #${id}`, href: formatLink(currentPath) });
          i++; // skip next segment since we consumed the id
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
