<script lang="ts">
  import { useForgotPassword } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';
  import { navigate } from '@svadmin/core/router';
  import { Button } from './ui/button/index.js';
  import { Input } from './ui/input/index.js';
  import { Label } from './ui/label/index.js';
  import * as Card from './ui/card/index.js';
  import * as Alert from './ui/alert/index.js';
  import { KeyRound, Mail, ArrowLeft, CheckCircle, Loader2, AlertCircle } from 'lucide-svelte';

  let { title = 'Admin' } = $props<{
    title?: string;
  }>();

  const forgot = useForgotPassword();

  let email = $state('');
  let error = $state('');
  let sent = $state(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    error = '';

    if (!email) { error = t('auth.emailRequired'); return; }

    const result = await forgot.mutate({ email });
    if (result.success) {
      sent = true;
    } else {
      error = result.error?.message ?? t('common.operationFailed');
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/[0.08] via-background to-primary/[0.04] p-4">
  <div class="w-full max-w-[420px]">
    <Card.Card class="backdrop-blur-xl border-border/50 shadow-[0_8px_32px_hsl(var(--primary)/0.08),0_2px_8px_hsl(0_0%_0%/0.06)]">
      <Card.CardHeader class="text-center pb-2">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto mb-3">
          {#if sent}
            <CheckCircle class="h-6 w-6" />
          {:else}
            <KeyRound class="h-6 w-6" />
          {/if}
        </div>
        <Card.CardTitle class="text-2xl font-bold">
          {sent ? t('auth.resetLinkSent') : t('auth.forgotPassword')}
        </Card.CardTitle>
        {#if !sent}
          <p class="text-sm text-muted-foreground">{t('auth.forgotPasswordDescription')}</p>
        {/if}
      </Card.CardHeader>
      <Card.CardContent>
        {#if sent}
          <div class="py-2">
            <p class="text-sm text-muted-foreground text-center mb-4">
              {t('auth.resetLinkSent')}
            </p>
            <Button variant="outline" class="w-full" onclick={() => navigate('/login')}>
              <ArrowLeft class="h-4 w-4 mr-2" />
              {t('auth.backToLogin')}
            </Button>
          </div>
        {:else}
          <form onsubmit={handleSubmit} class="space-y-4">
            {#if error}
              <Alert.Root variant="destructive">
                <AlertCircle class="h-4 w-4" />
                <Alert.Description>{error}</Alert.Description>
              </Alert.Root>
            {/if}

            <div class="space-y-2">
              <Label for="forgot-email">{t('auth.email')}</Label>
              <div class="relative">
                <Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-[1]" />
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="name@example.com"
                  bind:value={email}
                  class="pl-9"
                  autocomplete="email"
                />
              </div>
            </div>

            <Button type="submit" class="w-full" disabled={forgot.isLoading}>
              {#if forgot.isLoading}
                <Loader2 class="h-4 w-4 animate-spin mr-2" />
              {/if}
              {t('auth.sendResetLink')}
            </Button>
          </form>

          <div class="flex items-center justify-center mt-5 pt-5 border-t">
            <Button variant="link" class="text-sm h-auto p-0 font-medium inline-flex items-center gap-1" onclick={() => navigate('/login')}>
              <ArrowLeft class="h-3 w-3" />
              {t('auth.backToLogin')}
            </Button>
          </div>
        {/if}
      </Card.CardContent>
    </Card.Card>

    <p class="text-xs text-muted-foreground mt-4 text-center opacity-60">
      Powered by {title}
    </p>
  </div>
</div>
