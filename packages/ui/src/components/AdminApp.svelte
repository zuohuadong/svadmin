<script lang="ts">
  // Auto-inject design tokens so consumers don't need to manually import
  import '../app.css';
  import type { Component, Snippet } from 'svelte';
  import type { DataProvider, AuthProvider, ResourceDefinition, ThemeMode, RouterProvider, ThemeConfig, MenuItem, TaskProvider } from '@svadmin/core';
  import { setDataProvider, setAuthProvider, setResources, setLocale, setTheme, setRouterProvider, setTaskProvider, createHashRouterProvider, configureTheme } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';
  import { navigate } from '@svadmin/core/router';
  import { QueryClient, QueryClientProvider, type DefaultOptions } from '@tanstack/svelte-query';
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
  import TaskQueueDrawer from './TaskQueueDrawer.svelte';
  import SettingsPage from './SettingsPage.svelte';
  import ErrorPage from './ErrorPage.svelte';
  import PublicProfilePage from './profile/PublicProfilePage.svelte';
  import GetStartedPage from './account/GetStartedPage.svelte';
  import CompanyProfilePage from './account/CompanyProfilePage.svelte';
  import SettingsPlainPage from './account/SettingsPlainPage.svelte';
  import SettingsSidebarPage from './account/SettingsSidebarPage.svelte';
  import SettingsEnterprisePage from './account/SettingsEnterprisePage.svelte';
  import ImportMembersPage from './account/ImportMembersPage.svelte';
  import MembersStarterPage from './account/MembersStarterPage.svelte';
  import TeamMembersPage from './account/TeamMembersPage.svelte';
  import SecurityLogPage from './account/SecurityLogPage.svelte';
  import UserCardsNFTPage from './network/UserCardsNFTPage.svelte';
  import TeamCrewTablePage from './network/TeamCrewTablePage.svelte';
  import TwoFactorAuthPage from './TwoFactorAuthPage.svelte';
  import { Button } from './ui/button/index.js';
  import { Input } from './ui/input/index.js';
  import { Badge } from './ui/badge/index.js';
  import { Skeleton } from './ui/skeleton/index.js';
  import { initRouter, getRoute, getParams } from '../router-state.svelte.js';

  interface Props {
    dataProvider: DataProvider;
    authProvider?: AuthProvider;
    taskProvider?: TaskProvider;
    routerProvider?: RouterProvider;
    resources: ResourceDefinition[];
    locale?: string;
    title?: string;
    defaultTheme?: ThemeMode;
    /** Theme configuration for dark-first mode, CSS overrides, etc. */
    themeConfig?: ThemeConfig;
    dashboard?: Snippet;
    loginPage?: Snippet;
    /** Prefill and display credentials on the default login page, useful for demos/examples. */
    loginDefaults?: {
      identifier?: string;
      password?: string;
      hint?: string;
    };
    /** Override default components via DI */
    components?: Partial<ComponentRegistry>;
    /** Resource-specific page overrides while keeping svadmin defaults as fallback. */
    resourcePages?: Record<string, {
      list?: Component<{ resourceName: string }>;
      create?: Component<{ resourceName: string; mode?: 'create' }>;
      edit?: Component<{ resourceName: string; mode?: 'edit'; id?: string | number }>;
      show?: Component<{ resourceName: string; id?: string | number }>;
      clone?: Component<{ resourceName: string; mode?: 'clone'; id?: string | number }>;
    }>;
    /** Custom multi-level menu configuration */
    menu?: MenuItem[];
    /** External URL to the main application or workspace (renders a shortcut in the header) */
    siteUrl?: string;
    /** Routing strategy for Sidebar links ('hash' | 'path' | 'auto') */
    routeMode?: 'hash' | 'path' | 'auto';
    /** Optional TanStack Query client override. */
    queryClient?: QueryClient;
    /** Optional TanStack Query default options override when QueryClient is not supplied. */
    queryClientDefaultOptions?: DefaultOptions;
  }

  let {
    dataProvider,
    authProvider,
    taskProvider,
    routerProvider,
    resources,
    locale,
    title = 'Admin',
    defaultTheme,
    themeConfig: userThemeConfig,
    dashboard,
    loginPage,
    loginDefaults,
    components: userComponents,
    resourcePages,
    menu,
    siteUrl,
    routeMode,
    queryClient: providedQueryClient,
    queryClientDefaultOptions,
  }: Props = $props();

  // Default component registry
  const defaultComponents: ComponentRegistry = {
    Layout, Sidebar, Header,
    LoginPage, AutoTable, AutoForm, ShowPage,
    TaskQueueDrawer, ErrorPage,
    Button: Button as unknown as ComponentRegistry['Button'],
    Input: Input as unknown as ComponentRegistry['Input'],
    Badge: Badge as unknown as ComponentRegistry['Badge'],
    Skeleton: Skeleton as unknown as ComponentRegistry['Skeleton'],
  };

  // Resolve router provider (default to hash)
  const mergedComponents = $derived.by((): ComponentRegistry => ({ ...defaultComponents, ...userComponents }));
  const resolvedRouter = $derived(routerProvider ?? createHashRouterProvider());
  const resolvedRouteMode = $derived(routeMode ?? (routerProvider ? 'auto' : 'hash'));

  function syncComponentRegistry() {
    setComponentRegistry(mergedComponents);
  }

  function syncAppContext() {
    setDataProvider(dataProvider);
    if (authProvider) setAuthProvider(authProvider);
    if (taskProvider) setTaskProvider(taskProvider);
    setResources(resources);
    setRouterProvider(resolvedRouter);
    if (locale) setLocale(locale);
    if (userThemeConfig) configureTheme(userThemeConfig);
    if (defaultTheme) setTheme(defaultTheme);
  }

  // Set up initial context synchronously so children can access resources immediately during first render.
  syncComponentRegistry();
  syncAppContext();

  // Set up context — use $effect so prop changes are tracked
  $effect.pre(syncComponentRegistry);
  $effect.pre(syncAppContext);

  const queryClient = $derived(providedQueryClient ?? new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1 },
      ...queryClientDefaultOptions,
    },
  }));

  function syncRouter() {
    initRouter(resolvedRouter);
  }

  // Initialize router with provider synchronously
  syncRouter();
  $effect.pre(syncRouter);

  // Reactive getters for route state
  const route = $derived(getRoute());
  const params = $derived(getParams());
  const resourceNames = $derived(new Set(resources.map((resource) => resource.name)));
  const hasRouteResource = $derived(!params.resource || resourceNames.has(params.resource));
  const currentResourcePages = $derived(params.resource ? resourcePages?.[params.resource] : undefined);

  // Auth check
  let isAuthenticated = $state(false);
  let authChecked = $state(false);

  $effect(() => {
    let cancelled = false;
    // Explicitly track route so auth is re-checked on navigation
    const _route = route;

    if (!authProvider) {
      if (!cancelled) {
        isAuthenticated = true;
        authChecked = true;
      }
      return;
    }
    authProvider.check().then(result => {
      if (cancelled) return;
      isAuthenticated = result.authenticated;
      authChecked = true;
      if (!result.authenticated && _route !== '/login' && _route !== '/register' && _route !== '/forgot-password' && _route !== '/update-password') {
        navigate(result.redirectTo ?? '/login');
      }
    }).catch(err => {
      if (cancelled) return;
      console.warn('Auth check failed:', err);
      isAuthenticated = false;
      authChecked = true;
      if (_route !== '/login' && _route !== '/register' && _route !== '/forgot-password' && _route !== '/update-password') {
        navigate('/login');
      }
    });

    return () => { cancelled = true; };
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
    <LoginPage
      {title}
      defaultIdentifier={loginDefaults?.identifier}
      defaultPassword={loginDefaults?.password}
      loginHint={loginDefaults?.hint}
      onSuccess={() => { isAuthenticated = true; navigate('/'); }}
    />
  {:else if route === '/register' && authProvider?.register}
    <RegisterPage {title} />
  {:else if route === '/forgot-password' && authProvider?.forgotPassword}
    <ForgotPasswordPage {title} />
  {:else if route === '/update-password' && authProvider?.updatePassword}
    <UpdatePasswordPage {title} />
  {:else if route === '/login' || route === '/register' || route === '/forgot-password' || route === '/update-password'}
    <ConfigErrorScreen title="{title} — {t('common.configRequired')}" />
  {:else if isAuthenticated || !authProvider}
    <Layout {title} {menu} {siteUrl} routeMode={resolvedRouteMode}>
      {#key route + (params.resource ?? '') + (params.id ?? '') + (params.variant ?? '') + (params.columns ?? '')}
      <div class="svadmin-page-enter">
      {#if route === '/2fa' || route === '/authentication/branded/2fa'}
        <TwoFactorAuthPage />
      {:else if route === '/public-profile'}
        <PublicProfilePage variant="default" initialTab="projects" />
      {:else if route === '/public-profile/projects/:columns'}
        <PublicProfilePage variant="default" initialTab="projects" columns={params.columns?.includes('3') ? 3 : 2} />
      {:else if route === '/public-profile/activity'}
        <PublicProfilePage variant="default" initialTab="activity" />
      {:else if route === '/public-profile/teams'}
        <PublicProfilePage variant="default" initialTab="teams" />
      {:else if route === '/public-profile/profiles/:variant'}
        <PublicProfilePage variant={(params.variant === 'company' || params.variant === 'gamer' || params.variant === 'default' ? params.variant : 'default') as 'company' | 'gamer' | 'default'} />
      {:else if route === '/account/get-started' || route === '/account/home/get-started'}
        <GetStartedPage />
      {:else if route === '/account/home/user-profile'}
        <SettingsPage />
      {:else if route === '/account/company-profile' || route === '/account/home/company-profile'}
        <CompanyProfilePage />
      {:else if route === '/account/settings-plain' || route === '/account/home/settings-plain'}
        <SettingsPlainPage />
      {:else if route === '/account/settings-sidebar' || route === '/account/home/settings-sidebar'}
        <SettingsSidebarPage />
      {:else if route === '/account/settings-enterprise' || route === '/account/home/settings-enterprise'}
        <SettingsEnterprisePage />
      {:else if route === '/account/:tab'}
        <SettingsPage />
      {:else if route === '/account/import-members' || route === '/account/members/import-members'}
        <ImportMembersPage />
      {:else if route === '/account/members-starter' || route === '/account/members/members-starter'}
        <MembersStarterPage />
      {:else if route === '/account/team-members' || route === '/account/members/team-members'}
        <TeamMembersPage />
      {:else if route === '/account/security-log' || route === '/account/security/security-log'}
        <SecurityLogPage />
      {:else if route === '/network/user-cards' || route === '/network/user-cards/nft'}
        <UserCardsNFTPage />
      {:else if route === '/network/team-crew' || route === '/network/user-table/team-crew'}
        <TeamCrewTablePage />
      {:else if route.startsWith('/settings')}
        <SettingsPage />
      {:else if route === '/500' || (route === '/:resource' && params.resource === '500')}
        {@const ErrorComp = mergedComponents.ErrorPage || ErrorPage}
        <ErrorComp status="500" />
      {:else if route === '/' || route === '' || route === '/inventory-dashboard'}
        {#if dashboard}
          {@render dashboard()}
        {:else}
          <div class="space-y-4">
            <h1 class="text-xl font-semibold text-foreground">{t('common.welcome', { title })}</h1>
            <p class="text-muted-foreground">{t('common.dashboardHint')}</p>
          </div>
        {/if}
      {:else if (route === '/:resource' || route === '/:parent/:parentId/:resource') && hasRouteResource}
        {#key params.resource}
          {@const Comp = currentResourcePages?.list ?? mergedComponents.AutoTable}
          <Comp resourceName={params.resource} />
        {/key}
      {:else if (route === '/:resource/create' || route === '/:parent/:parentId/:resource/create') && hasRouteResource}
        {#key params.resource}
          {@const Comp = currentResourcePages?.create ?? mergedComponents.AutoForm}
          <Comp resourceName={params.resource} mode="create" />
        {/key}
      {:else if (route === '/:resource/edit/:id' || route === '/:parent/:parentId/:resource/edit/:id') && hasRouteResource}
        {#key `${params.resource}-${params.id}`}
          {@const Comp = currentResourcePages?.edit ?? mergedComponents.AutoForm}
          <Comp resourceName={params.resource} mode="edit" id={params.id} />
        {/key}
      {:else if (route === '/:resource/show/:id' || route === '/:parent/:parentId/:resource/show/:id') && hasRouteResource}
        {#key `${params.resource}-${params.id}`}
          {@const Comp = currentResourcePages?.show ?? mergedComponents.ShowPage}
          <Comp resourceName={params.resource} id={params.id} />
        {/key}
      {:else if (route === '/:resource/clone/:id' || route === '/:parent/:parentId/:resource/clone/:id') && hasRouteResource}
        {#key `${params.resource}-clone-${params.id}`}
          {@const Comp = currentResourcePages?.clone ?? mergedComponents.AutoForm}
          <Comp resourceName={params.resource} mode="clone" id={params.id} />
        {/key}
      {:else}
        {@const ErrorComp = mergedComponents.ErrorPage || ErrorPage}
        <ErrorComp status="404" />
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
