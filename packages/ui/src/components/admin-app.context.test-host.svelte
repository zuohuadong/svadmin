<script lang="ts">
  import { untrack } from 'svelte';
  import type {
    AuthProvider,
    DataProvider,
    ResourceDefinition,
    RouterProvider,
    TaskProvider,
    ThemeConfig,
    ThemeMode,
    I18nProvider,
  } from '@svadmin/core';
  import AdminApp from './AdminApp.svelte';
  import ContextProbe from './admin-app.context.test-probe.svelte';

  interface Props {
    instance: string;
    dataProvider: DataProvider;
    authProvider?: AuthProvider;
    taskProvider?: TaskProvider;
    routerProvider: RouterProvider;
    resources: ResourceDefinition[];
    locale?: string;
    i18nProvider?: I18nProvider;
    nextLocale?: string;
    defaultTheme?: ThemeMode;
    themeConfig?: ThemeConfig;
  }

  let {
    instance,
    dataProvider,
    authProvider,
    taskProvider,
    routerProvider,
    resources,
    locale: ownerLocale,
    i18nProvider,
    nextLocale = 'zh-CN',
    defaultTheme,
    themeConfig,
  }: Props = $props();

  let boundLocale = $state<string | undefined>(untrack(() => ownerLocale));

  $effect.pre(() => {
    const nextOwnerLocale = ownerLocale;
    if (untrack(() => boundLocale) !== nextOwnerLocale) boundLocale = nextOwnerLocale;
  });
</script>

{#snippet dashboard()}
  <ContextProbe {instance} {nextLocale} />
{/snippet}

<AdminApp
  {dataProvider}
  {authProvider}
  {taskProvider}
  {routerProvider}
  {resources}
  bind:locale={boundLocale}
  {i18nProvider}
  {defaultTheme}
  {themeConfig}
  dashboard={dashboard as never}
/>

<output data-testid={`bound-locale-${instance}`}>{boundLocale ?? ''}</output>
