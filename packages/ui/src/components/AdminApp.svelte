<script lang="ts">
  // Auto-inject design tokens so consumers don't need to manually import
  import '../app.css';
  import type { Snippet } from 'svelte';
  import type { DataProvider, AuthProvider, ResourceDefinition, ThemeMode, RouterProvider, ThemeConfig, MenuItem } from '@svadmin/core';
  import { setDataProvider, setAuthProvider, setResources, setLocale, setTheme, setRouterProvider, getAuthProvider, createHashRouterProvider, configureTheme } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';
  import { navigate } from '@svadmin/core/router';
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
  import { setComponentRegistry, type ComponentRegistry } from '../component-registry.svelte.js';
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
  import Sidebar from './Sidebar.svelte';
  import Header from './Header.svelte';
  import { Button } from './ui/button/index.js';
  import { Input } from './ui/input/index.js';
  import { Badge } from './ui/badge/index.js';
  import { Skeleton } from './ui/skeleton/index.js';
  import { initRouter, getRoute, getParams } from '../router-state.svelte.js';

  interface Props {
    dataProvider: DataProvider;
    authProvider?: AuthProvider;
    routerProvider?: RouterProvider;
    resources: ResourceDefinition[];
    locale?: string;
    title?: string;
    defaultTheme?: ThemeMode;
    /** Theme configuration for dark-first mode, CSS overrides, etc. */
    themeConfig?: ThemeConfig;
    dashboard?: Snippet;
    loginPage?: Snippet;
    /** Override default components via DI */
    components?: Partial<ComponentRegistry>;
    /** Custom multi-level menu configuration */
    menu?: MenuItem[];
  }

  let {
    dataProvider,
    authProvider,
    routerProvider,
    resources,
    locale,
    title = 'Admin',
    defaultTheme,
    themeConfig: userThemeConfig,
    dashboard,
    loginPage,
    components: userComponents,
    menu,
  }: Props = $props();

  // Default component registry
  const defaultComponents: ComponentRegistry = {
    Layout, Sidebar, Header,
    LoginPage, AutoTable, AutoForm, ShowPage,
    Button: Button as unknown as ComponentRegistry['Button'],
    Input: Input as unknown as ComponentRegistry['Input'],
    Badge: Badge as unknown as ComponentRegistry['Badge'],
    Skeleton: Skeleton as unknown as ComponentRegistry['Skeleton'],
  };

  // Merge user overrides and set context
  setComponentRegistry({ ...defaultComponents, ...userComponents });

  // Resolve router provider (default to hash)
  const resolvedRouter = $derived(routerProvider ?? createHashRouterProvider());

  // Set up context — use $effect so prop changes are tracked
  $effect.pre(() => {
    setDataProvider(dataProvider);
    if (authProvider) setAuthProvider(authProvider);
    setResources(resources);
    setRouterProvider(resolvedRouter);
    if (locale) setLocale(locale);
    if (userThemeConfig) configureTheme(userThemeConfig);
    if (defaultTheme) setTheme(defaultTheme);
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1 },
    },
  });

  // Initialize router with provider
  $effect.pre(() => {
    initRouter(resolvedRouter);
  });

  // Reactive getters for route state
  const route = $derived(getRoute());
  const params = $derived(getParams());

  // Auth check
  let isAuthenticated = $state(false);
  let authChecked = $state(false);

  $effect(() => {
    // Explicitly track route so auth is re-checked on navigation
    const _route = route;

    if (!authProvider) {
      isAuthenticated = true;
      authChecked = true;
      return;
    }
    authProvider.check().then(result => {
      isAuthenticated = result.authenticated;
      authChecked = true;
      if (!result.authenticated && _route !== '/login' && _route !== '/register' && _route !== '/forgot-password' && _route !== '/update-password') {
        navigate(result.redirectTo ?? '/login');
      }
    });
  });
</script>

<QueryClientProvider client={queryClient}>
  {#if !authChecked}
    <div class="flex h-screen items-center justify-center">
      <div class="space-y-4 text-center">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary mx-auto"></div>
        <p class="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  {:else if route === '/login' && loginPage}
    {@render loginPage()}
  {:else if route === '/login' && authProvider}
    <LoginPage {title} onSuccess={() => { isAuthenticated = true; navigate('/'); }} />
  {:else if route === '/register' && authProvider?.register}
    <RegisterPage {title} />
  {:else if route === '/forgot-password' && authProvider?.forgotPassword}
    <ForgotPasswordPage {title} />
  {:else if route === '/update-password' && authProvider?.updatePassword}
    <UpdatePasswordPage {title} />
  {:else if route === '/login' || route === '/register' || route === '/forgot-password' || route === '/update-password'}
    <ConfigErrorScreen title="{title} — {t('common.configRequired')}" />
  {:else if isAuthenticated || !authProvider}
    <Layout {title} {menu}>
      {#key route + (params.resource ?? '') + (params.id ?? '')}
      <div class="svadmin-page-enter">
      {#if route === '/'}
        {#if dashboard}
          {@render dashboard()}
        {:else}
          <div class="space-y-4">
            <h1 class="text-xl font-semibold text-foreground">{t('common.welcome', { title })}</h1>
            <p class="text-muted-foreground">{t('common.dashboardHint')}</p>
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
      </div>
      {/key}
    </Layout>
  {:else}
    <div class="flex h-screen items-center justify-center">
      <p class="text-muted-foreground">{t('common.redirecting')}</p>
    </div>
  {/if}
  <Toast />
  <DevTools />
</QueryClientProvider>
