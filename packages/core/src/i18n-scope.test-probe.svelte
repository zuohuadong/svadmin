<script lang="ts">
  import { getLocale, t, useTranslation } from './i18n.svelte';

  let {
    instance,
    nextLocale,
  }: {
    instance: string;
    nextLocale: string;
  } = $props();

  const translation = useTranslation();

  function changeLocale() {
    translation.setLocale(nextLocale);
  }

  async function changeLocaleLater() {
    await Promise.resolve();
    translation.setLocale(nextLocale);
  }
</script>

<button data-testid={`${instance}-change`} onclick={changeLocale}>change locale</button>
<button data-testid={`${instance}-change-later`} onclick={changeLocaleLater}>change locale later</button>
<output data-testid={`${instance}-direct`}>{getLocale()}|{t('common.save')}</output>
<output data-testid={`${instance}-captured`}>{translation.locale}|{translation.t('common.save')}</output>
