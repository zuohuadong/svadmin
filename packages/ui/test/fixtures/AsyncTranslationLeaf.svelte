<script lang="ts">
  import { useTranslation } from '@svadmin/core/i18n';

  let { instance }: { instance: string } = $props();
  const i18n = useTranslation();
  let translated = $state('');

  async function translateLater() {
    await Promise.resolve();
    translated = i18n.t('common.save');
  }
</script>

<button data-testid={`${instance}-translate`} onclick={translateLater}>translate</button>
<output data-testid={`${instance}-translation`}>{translated}</output>
