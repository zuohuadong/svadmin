<script lang="ts">
  import { untrack } from 'svelte';
  import {
    createI18nScope,
    provideI18nScope,
    type I18nProvider,
  } from './i18n.svelte';
  import I18nScopeTestProbe from './i18n-scope.test-probe.svelte';

  interface Props {
    instance: string;
    locale?: string;
    provider?: I18nProvider;
    nextLocale?: string;
    onLocaleChange?: (locale: string) => void;
  }

  let {
    instance,
    locale,
    provider,
    nextLocale = 'zh-CN',
    onLocaleChange,
  }: Props = $props();

  const scope = createI18nScope();
  untrack(() => scope.updateOwner({ locale, provider, onLocaleChange }));
  provideI18nScope(scope);

  $effect.pre(() => {
    scope.updateOwner({ locale, provider, onLocaleChange });
  });
</script>

<I18nScopeTestProbe {instance} {nextLocale} />
