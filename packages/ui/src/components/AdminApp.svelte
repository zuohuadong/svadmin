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
  import ProfilePage from './ProfilePage.svelte';
  import NotificationsSettings from './NotificationsSettings.svelte';
  import IntegrationsSettings from './IntegrationsSettings.svelte';
  import AppearanceSettings from './AppearanceSettings.svelte';
  import ApiSettings from './ApiSettings.svelte';
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

  // Merge and keep a local reference — setContext is only visible to *children*,
  // so we must use the local variable for lookups within this component.
  const mergedComponents: ComponentRegistry = { ...defaultComponents, ...userComponents };
  setComponentRegistry(mergedComponents);

  // Resolve router provider (default to hash)
  const resolvedRouter = $derived(routerProvider ?? createHashRouterProvider());
  const resolvedRouteMode = $derived(routeMode ?? (routerProvider ? 'auto' : 'hash'));

  // Set up initial context synchronously so children can access resources immediately during first render
  setDataProvider(dataProvider);
  if (authProvider) setAuthProvider(authProvider);
  if (taskProvider) setTaskProvider(taskProvider);
  setResources(resources);
  setRouterProvider(resolvedRouter);
  if (locale) setLocale(locale);
  if (userThemeConfig) configureTheme(userThemeConfig);
  if (defaultTheme) setTheme(defaultTheme);

  // Set up context — use $effect so prop changes are tracked
  $effect.pre(() => {
    setDataProvider(dataProvider);
    if (authProvider) setAuthProvider(authProvider);
    if (taskProvider) setTaskProvider(taskProvider);
    setResources(resources);
    setRouterProvider(resolvedRouter);
    if (locale) setLocale(locale);
    if (userThemeConfig) configureTheme(userThemeConfig);
    if (defaultTheme) setTheme(defaultTheme);
  });

  const queryClient = $derived(providedQueryClient ?? new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1 },
      ...queryClientDefaultOptions,
    },
  }));

  // Initialize router with provider synchronously
  initRouter(resolvedRouter);
  $effect.pre(() => {
    initRouter(resolvedRouter);
  });

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
      {#if route === '/2fa'}
        <TwoFactorAuthPage />
      {:else if route === '/store-inventory/dashboard'}
        {#if dashboard}
          {@render dashboard()}
        {:else}
          <div class="space-y-4">
            <h1 class="text-xl font-semibold text-foreground">{t('common.welcome', { title })}</h1>
            <p class="text-muted-foreground">{t('common.dashboardHint')}</p>
          </div>
        {/if}
      {:else if route === '/mail/inbox'}
        {@const Comp = resourcePages?.notifications?.list ?? mergedComponents.AutoTable}
        <Comp resourceName="notifications" />
      {:else if route === '/calendar/page'}
        {@const Comp = resourcePages?.calendar_events?.list ?? mergedComponents.AutoTable}
        <Comp resourceName="calendar_events" />
      {:else if route === '/todo/all-tasks'}
        {@const Comp = resourcePages?.todos?.list ?? mergedComponents.AutoTable}
        <Comp resourceName="todos" />
      {:else if route === '/crm/dashboard'}
        {@const Comp = resourcePages?.crm_accounts?.list ?? mergedComponents.AutoTable}
        <Comp resourceName="crm_accounts" />
      {:else if route === '/real-estate/page'}
        {@const Comp = resourcePages?.properties?.list ?? mergedComponents.AutoTable}
        <Comp resourceName="properties" />
      {:else if route === '/ai/start'}
        {@const Comp = resourcePages?.ai_conversations?.list ?? mergedComponents.AutoTable}
        <Comp resourceName="ai_conversations" />
      {:else if route === '/user-management/users'}
        {@const Comp = resourcePages?.users?.list ?? mergedComponents.AutoTable}
        <Comp resourceName="users" />
      {:else if route === '/public-profile'}
        <PublicProfilePage variant="default" initialTab="projects" />
      {:else if route === '/public-profile/projects/:columns'}
        <PublicProfilePage variant="default" initialTab="projects" columns={params.columns?.startsWith('3') ? 3 : 2} />
      {:else if route === '/public-profile/activity'}
        <PublicProfilePage variant="default" initialTab="activity" />
      {:else if route === '/public-profile/teams'}
        <PublicProfilePage variant="default" initialTab="teams" />
      {:else if route === '/public-profile/profiles/:variant'}
        <PublicProfilePage variant={(params.variant === 'company' || params.variant === 'gamer' || params.variant === 'default' ? params.variant : 'default') as 'company' | 'gamer' | 'default'} />
      {:else if route === '/account/home/user-profile'}
        <ProfilePage />
      {:else if route === '/account/home/settings-plain'}
        <SettingsPlainPage />
      {:else if route === '/account/home/get-started'}
        <GetStartedPage />
      {:else if route === '/account/notifications'}
        <NotificationsSettings />
      {:else if route === '/account/integrations'}
        <IntegrationsSettings />
      {:else if route === '/network/user-cards/nft'}
        <UserCardsNFTPage />
      {:else if route === '/network/user-table/team-crew'}
        <TeamCrewTablePage />
      {:else if route === '/account/members/team-members'}
        <TeamMembersPage />
      {:else if route === '/authentication/branded/2fa'}
        <TwoFactorAuthPage />
      {:else if route === '/authentication/error-404'}
        {@const ErrorComp = mergedComponents.ErrorPage || ErrorPage}
        <ErrorComp status="404" />
      {:else if route === '/authentication/error-500'}
        {@const ErrorComp = mergedComponents.ErrorPage || ErrorPage}
        <ErrorComp status="500" />
      {:else if route === '/account/appearance'}
        <AppearanceSettings />
      {:else if route === '/account/home/company-profile'}
        <CompanyProfilePage />
      {:else if route === '/account/home/settings-sidebar'}
        <SettingsSidebarPage />
      {:else if route === '/account/api-keys'}
        <ApiSettings />
      {:else if route === '/account/members/import-members'}
        <ImportMembersPage />
      {:else if route === '/account/security/security-log'}
        <SecurityLogPage />
      {:else if route === '/account/home/settings-enterprise'}
        <SettingsEnterprisePage />
      {:else if route === '/account/members/members-starter'}
        <MembersStarterPage />
      {:else if route === '/account/get-started'}
        <GetStartedPage />
      {:else if route === '/account/company-profile'}
        <CompanyProfilePage />
      {:else if route === '/account/settings-plain'}
        <SettingsPlainPage />
      {:else if route === '/account/settings-sidebar'}
        <SettingsSidebarPage />
      {:else if route === '/account/settings-enterprise'}
        <SettingsEnterprisePage />
      {:else if route === '/account/import-members'}
        <ImportMembersPage />
      {:else if route === '/account/members-starter'}
        <MembersStarterPage />
      {:else if route === '/account/team-members'}
        <TeamMembersPage />
      {:else if route === '/account/security-log'}
        <SecurityLogPage />
      {:else if route === '/network/user-cards'}
        <UserCardsNFTPage />
      {:else if route === '/network/team-crew'}
        <TeamCrewTablePage />
      {:else if route.startsWith('/settings')}
        <SettingsPage />
      {:else if route === '/500' || (route === '/:resource' && params.resource === '500')}
        {@const ErrorComp = mergedComponents.ErrorPage || ErrorPage}
        <ErrorComp status="500" />
      {:else if route === '/' || route === ''}
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
