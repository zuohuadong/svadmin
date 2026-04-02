<script lang="ts">
  import { useLogin, getAuthProvider } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';
  import { navigate } from '@svadmin/core/router';
  import { Button } from './ui/button/index.js';
  import { Input } from './ui/input/index.js';
  import { Label } from './ui/label/index.js';
  import * as Card from './ui/card/index.js';
  import * as Alert from './ui/alert/index.js';
  import PasswordInput from './PasswordInput.svelte';
  import { Separator } from './ui/separator/index.js';
  import { LogIn, User, Loader2, AlertCircle } from 'lucide-svelte';

  /**
   * Social provider config for the login page.
   * Each entry renders a button that calls `onClick()` when clicked.
   *
   * @example
   * ```ts
   * const socialProviders = [
   *   { name: 'Google', icon: '🔵', onClick: () => googleAuth.login({}) },
   *   { name: 'GitHub', icon: '🐙', onClick: () => githubAuth.login({}) },
   * ];
   * ```
   */
  interface SocialProvider {
    /** Display name (e.g., 'Google') */
    name: string;
    /** Icon character, emoji, or SVG string */
    icon?: string;
    /** Handler to initiate social login */
    onClick: () => void | Promise<void>;
  }

  let { title = 'Admin', onSuccess, socialProviders = [] } = $props<{
    title?: string;
    onSuccess?: () => void;
    socialProviders?: SocialProvider[];
  }>();

  const login = useLogin();
  const authProvider = getAuthProvider();

  let identifier = $state('');
  let password = $state('');
  let error = $state('');

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = '';

    if (!identifier) { error = t('auth.usernameOrEmailRequired'); return; }
    if (!password) { error = t('auth.passwordRequired'); return; }

    const result = await login.mutate({ email: identifier, username: identifier, password });
    if (result.success) {
      onSuccess?.();
    } else {
      error = result.error?.message ?? t('common.loginFailed');
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 p-4">
  <div class="w-full max-w-[380px]">
    <Card.Card>
      <Card.CardHeader class="text-center pb-2">
        <div class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mx-auto mb-3">
          <LogIn class="h-5 w-5" />
        </div>
        <Card.CardTitle class="text-xl">{t('auth.welcomeBack')}</Card.CardTitle>
        <p class="text-sm text-muted-foreground">{t('auth.welcomeMessage')}</p>
      </Card.CardHeader>
      <Card.CardContent>
        <form onsubmit={handleSubmit} class="space-y-4">
          {#if error}
            <Alert.Root variant="destructive">
              <AlertCircle class="h-4 w-4" />
              <Alert.Description>{error}</Alert.Description>
            </Alert.Root>
          {/if}

          <div class="space-y-2">
            <Label for="login-identifier">{t('auth.usernameOrEmail')}</Label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-[1]" />
              <Input
                id="login-identifier"
                type="text"
                placeholder={t('auth.identifierPlaceholder')}
                bind:value={identifier}
                class="pl-9"
                autocomplete="username"
              />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <Label for="login-password">{t('auth.password')}</Label>
              {#if authProvider.forgotPassword}
                <Button variant="link" class="text-xs h-auto p-0" onclick={() => navigate('/forgot-password')}>
                  {t('auth.forgotPasswordLink')}
                </Button>
              {/if}
            </div>
            <PasswordInput
              id="login-password"
              label=""
              bind:value={password}
              autocomplete="current-password"
            />
          </div>

          <Button type="submit" class="w-full" disabled={login.isLoading}>
            {#if login.isLoading}
              <Loader2 class="h-4 w-4 animate-spin mr-2" />
            {/if}
            {t('auth.loginButton')}
          </Button>
        </form>

        {#if socialProviders.length > 0}
          <div class="relative my-5">
            <Separator />
            <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
              {t('auth.orContinueWith')}
            </span>
          </div>

          <div class="grid gap-2" class:grid-cols-2={socialProviders.length >= 2}>
            {#each socialProviders as provider (provider.name)}
              <Button
                variant="outline"
                class="w-full"
                onclick={provider.onClick}
              >
                {#if provider.icon}
                  <span class="mr-2">{provider.icon}</span>
                {/if}
                {provider.name}
              </Button>
            {/each}
          </div>
        {/if}

        {#if authProvider.register}
          <div class="flex items-center justify-center gap-1 mt-5 pt-5">
            <span class="text-sm text-muted-foreground">{t('auth.noAccount')}</span>
            <Button variant="link" class="text-sm h-auto p-0 font-medium" onclick={() => navigate('/register')}>
              {t('auth.register')}
            </Button>
          </div>
        {/if}
      </Card.CardContent>
    </Card.Card>

    <p class="text-xs text-muted-foreground mt-4 text-center">
      Powered by {title}
    </p>
  </div>
</div>

