<script lang="ts">
  import { AdminApp } from '@svadmin/ui';
  import { createSimpleRestDataProvider } from '@svadmin/simple-rest';
  import { resources } from './resources';
  import { mockAuthProvider } from './providers/mockAuth';

  const dataProvider = createSimpleRestDataProvider({
    apiUrl: 'https://jsonplaceholder.typicode.com',
  });
</script>

<AdminApp {dataProvider} {resources} authProvider={mockAuthProvider} title="svadmin Demo" locale="en" />
