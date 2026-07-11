<script lang="ts">
  import { captureAdminContext } from '@svadmin/core';
  import { useTranslation } from '@svadmin/core/i18n';

  import { AlertTriangle, ArrowLeft, FileQuestion, Home } from '@lucide/svelte';
  import { Button } from './ui/button/index.js';
  import * as Card from './ui/card/index.js';

  const i18n = useTranslation();

  interface Props {
    status?: '404' | '500';
    title?: string;
    description?: string;
  }

  let { status = '404', title, description }: Props = $props();
  const adminContext = captureAdminContext();

  function goBack() {
    adminContext.back();
  }

  const isNotFound = $derived(status === '404');
  const resolvedTitle = $derived(title ?? (isNotFound ? i18n.t('common.pageNotFound') : i18n.t('common.error')));
  const resolvedDescription = $derived(
    description ?? (isNotFound ? i18n.t('error.pageNotFoundDescription') : i18n.t('error.internalServerErrorDescription')),
  );
</script>

<div class="flex min-h-[70vh] items-center justify-center p-4" data-svadmin-content-page="error">
  <Card.Card class="w-full max-w-md border-border/60">
    <Card.CardContent class="space-y-6 px-6 py-10 text-center">
      <div class="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
        {#if isNotFound}
          <FileQuestion class="h-8 w-8" />
        {:else}
          <AlertTriangle class="h-8 w-8 text-destructive" />
        {/if}
      </div>

      <div class="space-y-2">
        <p class="text-xs font-semibold uppercase text-muted-foreground">{status}</p>
        <h1 class="text-2xl font-semibold text-foreground">{resolvedTitle}</h1>
        <p class="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">{resolvedDescription}</p>
      </div>

      <div class="flex flex-col justify-center gap-2 sm:flex-row">
        <Button variant="outline" onclick={goBack}>
          <ArrowLeft class="h-4 w-4" />
          {i18n.t('common.back')}
        </Button>
        <Button onclick={() => adminContext.navigate('/')}>
          <Home class="h-4 w-4" />
          {i18n.t('common.returnHome')}
        </Button>
      </div>
    </Card.CardContent>
  </Card.Card>
</div>
