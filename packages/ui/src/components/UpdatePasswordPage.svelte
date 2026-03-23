<script lang="ts">
  import { useUpdatePassword } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';
  import { navigate } from '@svadmin/core/router';
  import { Button } from './ui/button/index.js';
  import { Input } from './ui/input/index.js';
  import * as Card from './ui/card/index.js';
  import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-svelte';

  let { title = 'Admin' } = $props<{
    title?: string;
  }>();

  const updatePw = useUpdatePassword();

  let password = $state('');
  let confirmPassword = $state('');
  let showPassword = $state(false);
  let error = $state('');

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    error = '';

    if (!password) { error = t('auth.passwordRequired'); return; }
    if (password !== confirmPassword) { error = t('auth.passwordMismatch'); return; }

    const result = await updatePw.mutate({ password, confirmPassword });
    if (!result.success) {
      error = result.error?.message ?? t('common.operationFailed');
    }
  }
</script>

<div class="auth-page">
  <div class="auth-container">
    <Card.Card class="auth-card">
      <Card.CardHeader class="auth-header">
        <div class="auth-icon">
          <ShieldCheck class="h-6 w-6" />
        </div>
        <Card.CardTitle class="text-2xl font-bold">{t('auth.resetPassword')}</Card.CardTitle>
        <p class="text-sm text-muted-foreground">Enter your new password below.</p>
      </Card.CardHeader>
      <Card.CardContent>
        <form onsubmit={handleSubmit} class="space-y-4">
          {#if error}
            <div class="error-alert">
              <p>{error}</p>
            </div>
          {/if}

          <div class="space-y-2">
            <label for="new-password" class="text-sm font-medium text-foreground">{t('auth.password')}</label>
            <div class="input-with-icon">
              <Lock class="input-icon h-4 w-4" />
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                bind:value={password}
                class="pl-9 pr-9"
                autocomplete="new-password"
              />
              <button
                type="button"
                class="password-toggle"
                onclick={() => showPassword = !showPassword}
                tabindex={-1}
              >
                {#if showPassword}
                  <EyeOff class="h-4 w-4" />
                {:else}
                  <Eye class="h-4 w-4" />
                {/if}
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <label for="confirm-password" class="text-sm font-medium text-foreground">{t('auth.confirmPassword')}</label>
            <div class="input-with-icon">
              <Lock class="input-icon h-4 w-4" />
              <Input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                bind:value={confirmPassword}
                class="pl-9"
                autocomplete="new-password"
              />
            </div>
          </div>

          <Button type="submit" class="w-full" disabled={updatePw.isLoading}>
            {#if updatePw.isLoading}
              <span class="loading-spinner"></span>
            {/if}
            {t('auth.resetPassword')}
          </Button>

          <div class="auth-link">
            <button
              type="button"
              class="text-sm text-primary hover:underline font-medium"
              onclick={() => navigate('/login')}
            >{t('auth.backToLogin')}</button>
          </div>
        </form>
      </Card.CardContent>
    </Card.Card>

    <p class="text-xs text-muted-foreground mt-4 text-center opacity-60">
      Powered by {title}
    </p>
  </div>
</div>

<style>
  .auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--background)) 50%, hsl(var(--primary) / 0.04) 100%);
    padding: 1rem;
  }

  .auth-container {
    width: 100%;
    max-width: 420px;
  }

  :global(.auth-card) {
    backdrop-filter: blur(20px);
    border: 1px solid hsl(var(--border) / 0.5);
    box-shadow: 0 8px 32px hsl(var(--primary) / 0.08), 0 2px 8px hsl(0 0% 0% / 0.06);
  }

  :global(.auth-header) {
    text-align: center;
    padding-bottom: 0.5rem;
  }

  .auth-icon {
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

  .password-toggle {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: hsl(var(--muted-foreground));
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    z-index: 1;
  }
  .password-toggle:hover {
    color: hsl(var(--foreground));
  }

  .error-alert {
    padding: 0.75rem;
    border-radius: 0.5rem;
    background: hsl(var(--destructive) / 0.1);
    border: 1px solid hsl(var(--destructive) / 0.3);
    color: hsl(var(--destructive));
    font-size: 0.875rem;
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
    margin-top: 0.5rem;
  }
</style>
