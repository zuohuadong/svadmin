<script lang="ts">
  import { useForgotPassword } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';
  import { navigate } from '@svadmin/core/router';
  import { Button } from './ui/button/index.js';
  import { Input } from './ui/input/index.js';
  import * as Card from './ui/card/index.js';
  import { KeyRound, Mail, ArrowLeft, CheckCircle } from 'lucide-svelte';

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

<div class="forgot-page">
  <div class="forgot-container">
    <Card.Card class="login-card">
      <Card.CardHeader class="login-header">
        <div class="forgot-icon">
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
          <div class="success-state">
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
              <div class="error-alert">
                <p>{error}</p>
              </div>
            {/if}

            <div class="space-y-2">
              <label for="forgot-email" class="text-sm font-medium text-foreground">{t('auth.email')}</label>
              <div class="input-with-icon">
                <Mail class="input-icon h-4 w-4" />
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
                <span class="loading-spinner"></span>
              {/if}
              {t('auth.sendResetLink')}
            </Button>
          </form>

          <div class="auth-link">
            <button
              type="button"
              class="text-sm text-primary hover:underline font-medium inline-flex items-center gap-1"
              onclick={() => navigate('/login')}
            >
              <ArrowLeft class="h-3 w-3" />
              {t('auth.backToLogin')}
            </button>
          </div>
        {/if}
      </Card.CardContent>
    </Card.Card>

    <p class="text-xs text-muted-foreground mt-4 text-center opacity-60">
      Powered by {title}
    </p>
  </div>
</div>

<style>
  .forgot-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--background)) 50%, hsl(var(--primary) / 0.04) 100%);
    padding: 1rem;
  }

  .forgot-container {
    width: 100%;
    max-width: 420px;
  }

  .forgot-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: hsl(var(--primary) / 0.1);
    color: hsl(var(--primary));
    margin: 0 auto 0.75rem;
  }

  :global(.login-card) {
    backdrop-filter: blur(20px);
    border: 1px solid hsl(var(--border) / 0.5);
    box-shadow: 0 8px 32px hsl(var(--primary) / 0.08), 0 2px 8px hsl(0 0% 0% / 0.06);
  }

  :global(.login-header) {
    text-align: center;
    padding-bottom: 0.5rem;
  }

  .input-with-icon {
    position: relative;
  }

  :global(.input-icon) {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: hsl(var(--muted-foreground));
    pointer-events: none;
    z-index: 1;
  }

  .error-alert {
    padding: 0.75rem;
    border-radius: 0.5rem;
    background: hsl(var(--destructive) / 0.1);
    border: 1px solid hsl(var(--destructive) / 0.3);
    color: hsl(var(--destructive));
    font-size: 0.875rem;
  }

  .success-state {
    padding: 0.5rem 0;
  }

  .loading-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    margin-right: 0.5rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .auth-link {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1.25rem;
    padding-top: 1.25rem;
    border-top: 1px solid hsl(var(--border));
  }
</style>
