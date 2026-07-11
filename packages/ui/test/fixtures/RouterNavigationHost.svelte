<script lang="ts">
  import {
    provideAdminContext,
    type DataProvider,
    type RouterProvider,
  } from '@svadmin/core';
  import ErrorPage from '../../src/components/ErrorPage.svelte';

  interface Props {
    instance: string;
    dataProvider: DataProvider;
    routerProvider: RouterProvider;
  }

  let { instance, dataProvider, routerProvider }: Props = $props();

  provideAdminContext({
    get dataProvider() { return dataProvider; },
    resources: [],
    get routerProvider() { return routerProvider; },
  });
</script>

<section data-testid={`router-scope-${instance}`}>
  <ErrorPage title={`${instance} missing`} description={`${instance} description`} />
</section>
