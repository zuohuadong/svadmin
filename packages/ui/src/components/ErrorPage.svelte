<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import { navigate } from '@svadmin/core/router';
  import { AlertTriangle, ArrowLeft, CheckCircle2, Copy, FileQuestion, Home, RefreshCw, Search } from '@lucide/svelte';
  import { Button } from './ui/button/index.js';
  import { Input } from './ui/input/index.js';
  import * as Card from './ui/card/index.js';

  interface Props {
    status?: '404' | '500';
    title?: string;
    description?: string;
  }

  let { status = '404', title, description }: Props = $props();
  let query = $state('');
  let copied = $state(false);

  function goBack() {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  }

  function copyDiagnostics() {
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 1400);
  }

  const isNotFound = $derived(status === '404');
  const traceId = $derived(isNotFound ? 'trace_route_404_demo' : 'trace_gateway_500_demo');
  const resolvedTitle = $derived(title ?? (isNotFound ? t('common.pageNotFound') : t('common.error')));
  const resolvedDescription = $derived(
    description ?? (isNotFound ? t('error.pageNotFoundDescription') : t('error.internalServerErrorDescription')),
  );
  const checks = $derived(isNotFound
    ? ['Route registry checked', 'Access policy checked', 'Fallback page ready']
    : ['Gateway reachable', 'Session valid', 'Incident trace captured']);
</script>

<div class="flex min-h-[70vh] items-center justify-center p-4">
  <div class="grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_22rem]">
    <Card.Card class="overflow-hidden border-border/70 bg-card">
      <Card.CardContent class="grid gap-6 p-6 sm:p-8 lg:grid-cols-[13rem_1fr]">
        <div class="flex items-center justify-center">
          <div class="relative flex h-44 w-44 items-center justify-center rounded-2xl border border-border/70 bg-muted/25">
            <div class="absolute inset-5 rounded-xl border border-dashed border-border/80"></div>
            {#if isNotFound}
              <FileQuestion class="h-16 w-16 text-muted-foreground" />
            {:else}
              <AlertTriangle class="h-16 w-16 text-destructive" />
            {/if}
            <span class="absolute bottom-5 rounded-full bg-background px-3 py-1 font-mono text-xs font-semibold text-foreground shadow-sm">{status}</span>
          </div>
        </div>

        <div class="flex flex-col justify-center space-y-5">
          <div class="space-y-2">
            <p class="font-mono text-xs font-semibold uppercase text-muted-foreground">{status}</p>
            <h1 class="text-3xl font-semibold text-foreground">{resolvedTitle}</h1>
            <p class="max-w-xl text-sm leading-relaxed text-muted-foreground">{resolvedDescription}</p>
          </div>

          {#if isNotFound}
            <div class="relative max-w-md">
              <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input class="pl-9" bind:value={query} placeholder="Search pages, resources, or settings" />
            </div>
          {:else}
            <div class="rounded-lg border border-border/70 bg-muted/20 p-3">
              <p class="text-sm font-medium text-foreground">Incident trace</p>
              <p class="mt-1 font-mono text-xs text-muted-foreground">{traceId}</p>
            </div>
          {/if}

          <div class="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onclick={goBack}>
              <ArrowLeft class="h-4 w-4" />
              {t('common.back')}
            </Button>
            <Button onclick={() => navigate('/')}>
              <Home class="h-4 w-4" />
              {t('common.returnHome')}
            </Button>
          </div>
        </div>
      </Card.CardContent>
    </Card.Card>

    <Card.Card class="border-border/70 bg-card">
      <Card.CardHeader>
        <Card.CardTitle class="text-base">{isNotFound ? 'Suggested recovery' : 'System diagnostics'}</Card.CardTitle>
        <Card.CardDescription>{isNotFound ? 'Jump back into known workspace areas.' : 'Share this trace with an administrator.'}</Card.CardDescription>
      </Card.CardHeader>
      <Card.CardContent class="space-y-3">
        {#each checks as check (check)}
          <div class="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm text-foreground">
            <CheckCircle2 class="h-4 w-4 text-emerald-600" />
            {check}
          </div>
        {/each}
        <Button variant="outline" class="w-full" onclick={isNotFound ? () => navigate('/settings') : copyDiagnostics}>
          {#if isNotFound}
            <RefreshCw class="h-4 w-4" />
            {t('common.retry')}
          {:else}
            <Copy class="h-4 w-4" />
            {copied ? t('common.copied') : t('common.copy')}
          {/if}
        </Button>
      </Card.CardContent>
    </Card.Card>
  </div>
</div>
