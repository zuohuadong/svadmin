<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { DataProvider, AuthProvider, ResourceDefinition, ThemeMode } from '@svadmin/core';
  import { setDataProvider, setAuthProvider, setResources, setLocale, setTheme } from '@svadmin/core';
  import { matchRoute, currentPath, navigate } from '@svadmin/core/router';
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
  import Layout from './Layout.svelte';
  import AutoTable from './AutoTable.svelte';
  import AutoForm from './AutoForm.svelte';
  import ShowPage from './ShowPage.svelte';
  import Toast from './Toast.svelte';

  interface Props {
    dataProvider: DataProvider;
    authProvider?: AuthProvider;
    resources: ResourceDefinition[];
    locale?: string;
    title?: string;
    defaultTheme?: ThemeMode;
    dashboard?: Snippet;
    loginPage?: Snippet;
  }

  let {
    dataProvider,
    authProvider,
    resources,
    locale,
    title = 'Admin',
    defaultTheme,
    dashboard,
    loginPage,
  }: Props = $props();

  // Set up context
  setDataProvider(dataProvider);
  if (authProvider) setAuthProvider(authProvider);
  setResources(resources);
  if (locale) setLocale(locale);
  if (defaultTheme) setTheme(defaultTheme);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1 },
    },
  });

  // Router state
  const routes = [
    '/login',
    '/',
    '/:resource',
    '/:resource/create',
    '/:resource/edit/:id',
    '/:resource/show/:id',
  ];

  let hash = $state(window.location.hash);

  $effect(() => {
    const handler = () => { hash = window.location.hash; };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  });

  const match = $derived(matchRoute(hash, routes));
  const route = $derived(match?.route ?? '/');
  const params = $derived(match?.params ?? {});

  // Auth check
  let isAuthenticated = $state(!authProvider);
  let authChecked = $state(!authProvider);

  $effect(() => {
    if (!authProvider) return;
    authProvider.check().then(result => {
      isAuthenticated = result.authenticated;
      authChecked = true;
      if (!result.authenticated && route !== '/login') {
        navigate(result.redirectTo ?? '/login');
      }
    });
  });
</script>

<QueryClientProvider client={queryClient}>
  {#if !authChecked}
    <div class="flex h-screen items-center justify-center">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div>
    </div>
  {:else if route === '/login' && loginPage}
    {@render loginPage()}
  {:else if route === '/login'}
    <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div class="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl text-center">
        <h1 class="text-xl font-bold text-gray-900">{title}</h1>
        <p class="mt-2 text-sm text-gray-500">Please configure a loginPage snippet or authProvider.</p>
      </div>
    </div>
  {:else if isAuthenticated || !authProvider}
    <Layout {title}>
      {#if route === '/'}
        {#if dashboard}
          {@render dashboard()}
        {:else}
          <div class="space-y-4">
            <h1 class="text-2xl font-bold text-gray-900">Welcome to {title}</h1>
            <p class="text-gray-500">Select a resource from the sidebar to get started.</p>
          </div>
        {/if}
      {:else if route === '/:resource'}
        <AutoTable resourceName={params.resource} />
      {:else if route === '/:resource/create'}
        <AutoForm resourceName={params.resource} mode="create" />
      {:else if route === '/:resource/edit/:id'}
        <AutoForm resourceName={params.resource} mode="edit" id={params.id} />
      {:else if route === '/:resource/show/:id'}
        <ShowPage resourceName={params.resource} id={params.id} />
      {/if}
    </Layout>
  {:else}
    <div class="flex h-screen items-center justify-center">
      <p class="text-gray-500">Redirecting to login...</p>
    </div>
  {/if}
  <Toast />
</QueryClientProvider>
