<script lang="ts">
  import { useForgotPassword } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';
  import { navigate } from '@svadmin/core/router';
  import { Button } from './ui/button/index.js';
  import { Input } from './ui/input/index.js';
  import { Label } from './ui/label/index.js';
  import * as Card from './ui/card/index.js';
  import * as Alert from './ui/alert/index.js';
  import { KeyRound, User, ArrowLeft, CheckCircle, Loader2, AlertCircle } from 'lucide-svelte';

  let { title = 'Admin' } = $props<{
    title?: string;
  }>();

  const forgot = useForgotPassword();

  let identifier = $state('');
  let error = $state('');
  let sent = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = '';

    if (!identifier) { error = t('auth.usernameOrEmailRequired'); return; }

    const result = await forgot.mutate({ email: identifier, username: identifier });
    if (result.success) {
      sent = true;
    } else {
      error = result.error?.message ?? t('common.operationFailed');
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-background p-4">
  <div class="w-full max-w-[380px]">
    <Card.Card>
      <Card.CardHeader class="text-center pb-2">
        <div class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mx-auto mb-3">
          {#if sent}
            <CheckCircle class="h-5 w-5" />
          {:else}
            <KeyRound class="h-5 w-5" />
          {/if}
        </div>
        <Card.CardTitle class="text-xl">
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
              <Label for="forgot-identifier">{t('auth.usernameOrEmail')}</Label>
              <div class="relative">
                <User class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-[1]" />
                <Input
                  id="forgot-identifier"
                  type="text"
                  placeholder={t('auth.identifierPlaceholder')}
                  bind:value={identifier}
                  class="pl-9"
                  autocomplete="username"
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

          <div class="flex items-center justify-center mt-5 pt-5">
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
