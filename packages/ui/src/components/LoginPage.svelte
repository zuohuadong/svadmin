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
  import { LogIn, Mail, Loader2, AlertCircle } from 'lucide-svelte';

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

  let email = $state('');
  let password = $state('');
  let error = $state('');

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    error = '';

    if (!email) { error = t('auth.emailRequired'); return; }
    if (!password) { error = t('auth.passwordRequired'); return; }

    const result = await login.mutate({ email, password });
    if (result.success) {
      onSuccess?.();
    } else {
      error = result.error?.message ?? t('common.loginFailed');
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/[0.08] via-background to-primary/[0.04] p-4">
  <div class="w-full max-w-[420px]">
    <Card.Card class="backdrop-blur-xl border-border/50 shadow-[0_8px_32px_hsl(var(--primary)/0.08),0_2px_8px_hsl(0_0%_0%/0.06)]">
      <Card.CardHeader class="text-center pb-2">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto mb-3">
          <LogIn class="h-6 w-6" />
        </div>
        <Card.CardTitle class="text-2xl font-bold">{t('auth.welcomeBack')}</Card.CardTitle>
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
            <Label for="login-email">{t('auth.email')}</Label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-[1]" />
              <Input
                id="login-email"
                type="email"
                placeholder="name@example.com"
                bind:value={email}
                class="pl-9"
                autocomplete="email"
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
          <div class="flex items-center justify-center gap-1 mt-5 pt-5 border-t">
            <span class="text-sm text-muted-foreground">{t('auth.noAccount')}</span>
            <Button variant="link" class="text-sm h-auto p-0 font-medium" onclick={() => navigate('/register')}>
              {t('auth.register')}
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
