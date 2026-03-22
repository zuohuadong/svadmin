<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { DataProvider, AuthProvider, ResourceDefinition, ThemeMode } from '@svadmin/core';
  import { setDataProvider, setAuthProvider, setResources, setLocale, setTheme } from '@svadmin/core';
  import { navigate } from '@svadmin/core/router';
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
  import Layout from './Layout.svelte';
  import AutoTable from './AutoTable.svelte';
  import AutoForm from './AutoForm.svelte';
  import ShowPage from './ShowPage.svelte';
  import Toast from './Toast.svelte';
  import LoginPage from './LoginPage.svelte';
  import RegisterPage from './RegisterPage.svelte';
  import ForgotPasswordPage from './ForgotPasswordPage.svelte';
  import UpdatePasswordPage from './UpdatePasswordPage.svelte';
  import ConfigErrorScreen from './ConfigErrorScreen.svelte';
  import DevTools from './DevTools.svelte';
  import { initRouter, getRoute, getParams } from '../router-state.svelte.js';

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

  // Initialize hash router
  initRouter();

  // Reactive getters for route state
  const route = $derived(getRoute());
  const params = $derived(getParams());

  // Auth check
  let isAuthenticated = $state(!authProvider);
  let authChecked = $state(!authProvider);

  $effect(() => {
    if (!authProvider) return;
    authProvider.check().then(result => {
      isAuthenticated = result.authenticated;
      authChecked = true;
      if (!result.authenticated && route !== '/login' && route !== '/register' && route !== '/forgot-password' && route !== '/update-password') {
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
  {:else if route === '/login' && authProvider}
    <LoginPage {authProvider} {title} onSuccess={() => { isAuthenticated = true; navigate('/'); }} />
  {:else if route === '/register' && authProvider?.register}
    <RegisterPage {authProvider} {title} />
  {:else if route === '/forgot-password' && authProvider?.forgotPassword}
    <ForgotPasswordPage {authProvider} {title} />
  {:else if route === '/update-password' && authProvider?.updatePassword}
    <UpdatePasswordPage {authProvider} {title} />
  {:else if route === '/login' || route === '/register' || route === '/forgot-password' || route === '/update-password'}
    <ConfigErrorScreen title="{title} — Configuration Required" />
  {:else if isAuthenticated || !authProvider}
    <Layout {title}>
      {#if route === '/'}
        {#if dashboard}
          {@render dashboard()}
        {:else}
          <div class="space-y-4">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome to {title}</h1>
            <p class="text-gray-500">Select a resource from the sidebar to get started.</p>
          </div>
        {/if}
      {:else if route === '/:resource'}
        {#key params.resource}
          <AutoTable resourceName={params.resource} />
        {/key}
      {:else if route === '/:resource/create'}
        {#key params.resource}
          <AutoForm resourceName={params.resource} mode="create" />
        {/key}
      {:else if route === '/:resource/edit/:id'}
        {#key `${params.resource}-${params.id}`}
          <AutoForm resourceName={params.resource} mode="edit" id={params.id} />
        {/key}
      {:else if route === '/:resource/show/:id'}
        {#key `${params.resource}-${params.id}`}
          <ShowPage resourceName={params.resource} id={params.id} />
        {/key}
      {/if}
    </Layout>
  {:else}
    <div class="flex h-screen items-center justify-center">
      <p class="text-gray-500">Redirecting to login...</p>
    </div>
  {/if}
  <Toast />
  <DevTools />
</QueryClientProvider>
