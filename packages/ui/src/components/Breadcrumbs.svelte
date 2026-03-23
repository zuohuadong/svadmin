<script lang="ts">
  import { getResources } from '@svadmin/core';
  import { currentPath } from '@svadmin/core/router';
  import { t } from '@svadmin/core/i18n';

  const resources = getResources();
  let path = $state(currentPath());

  $effect(() => {
    function onHash() { path = currentPath(); }
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  });

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

{#if crumbs.length > 1}
  <nav class="mb-4 flex items-center gap-1.5 text-sm text-gray-500">
    {#each crumbs as crumb, i}
      {#if i > 0}
        <span class="text-gray-300">/</span>
      {/if}
      {#if i === crumbs.length - 1}
        <span class="font-medium text-gray-700">{crumb.label}</span>
      {:else}
        <a href={crumb.href} class="hover:text-primary transition">{crumb.label}</a>
      {/if}
    {/each}
  </nav>
{/if}
