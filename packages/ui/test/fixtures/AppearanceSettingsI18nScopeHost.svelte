<script lang="ts">
  import { untrack } from 'svelte';
  import {
    createI18nScope,
    provideI18nScope,
    type I18nProvider,
  } from '@svadmin/core/i18n';
  import AppearanceSettings from '../../src/components/AppearanceSettings.svelte';

  let {
    instance,
    provider,
  }: {
    instance: string;
    provider: I18nProvider;
  } = $props();

  const scope = createI18nScope();
  untrack(() => scope.updateOwner({ provider }));
  provideI18nScope(scope);
</script>

<section data-testid={`${instance}-appearance-settings`}>
  <AppearanceSettings />
</section>
