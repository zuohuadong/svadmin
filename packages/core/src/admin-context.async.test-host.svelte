<script lang="ts">
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
  import { provideAdminContext } from './context.svelte';
  import type { AuthProvider, DataProvider, ResourceDefinition, TaskProvider } from './types';
  import type { RouterProvider } from './router-provider';
  import AdminContextAsyncTestProbe from './admin-context.async.test-probe.svelte';

  interface Props {
    instance: string;
    dataProvider: DataProvider;
    authProvider: AuthProvider;
    taskProvider: TaskProvider;
    routerProvider: RouterProvider;
    resources?: ResourceDefinition[];
  }

  let {
    instance,
    dataProvider,
    authProvider,
    taskProvider,
    routerProvider,
    resources = [{ name: 'posts', label: 'posts', fields: [], primaryKey: 'id' }],
  }: Props = $props();

  provideAdminContext({
    get dataProvider() { return dataProvider; },
    get authProvider() { return authProvider; },
    get taskProvider() { return taskProvider; },
    get routerProvider() { return routerProvider; },
    get resources() { return resources; },
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
</script>

<QueryClientProvider client={queryClient}>
  <AdminContextAsyncTestProbe {instance} />
</QueryClientProvider>
