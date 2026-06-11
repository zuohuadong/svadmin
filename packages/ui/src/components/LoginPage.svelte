<script lang="ts">
  import { useLogin, getAuthProvider } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';
  import { navigate } from '@svadmin/core/router';
  import { Button } from './ui/button/index.js';
  import { Input } from './ui/input/index.js';
  import { Label } from './ui/label/index.js';
  import * as Alert from './ui/alert/index.js';
  import PasswordInput from './PasswordInput.svelte';
  import { Separator } from './ui/separator/index.js';
  import { User, Loader2, AlertCircle, Shield } from '@lucide/svelte';

  interface SocialProvider {
    name: string;
    icon?: string;
    onClick: () => void | Promise<void>;
  }

  let { title = 'Admin', onSuccess, socialProviders = [] } = $props<{
    title?: string;
    onSuccess?: () => void;
    socialProviders?: SocialProvider[];
  }>();

  const login = useLogin({ errorMessage: false });
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

<!-- Stripe-inspired split layout: left brand panel + right form panel -->
<div class="min-h-screen flex flex-col lg:flex-row">
  <!-- Left panel: brand showcase -->
  <div class="hidden lg:flex lg:w-[480px] xl:w-[520px] relative overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-primary/80 shrink-0">
    <!-- Decorative floating shapes -->
    <div class="absolute inset-0">
      <div class="absolute top-[12%] left-[8%] w-28 h-28 rounded-3xl border border-white/10 bg-white/5 rotate-12 backdrop-blur-sm"></div>
      <div class="absolute top-[55%] left-[55%] w-40 h-40 rounded-full border border-white/10 bg-white/5 -rotate-6 backdrop-blur-sm"></div>
      <div class="absolute bottom-[15%] left-[15%] w-24 h-24 rounded-2xl border border-white/10 bg-white/5 -rotate-12 backdrop-blur-sm"></div>
      <div class="absolute top-[30%] right-[10%] w-16 h-16 rounded-xl border border-white/10 bg-white/5 rotate-45 backdrop-blur-sm"></div>
      <!-- Subtle grid pattern -->
      <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 24px 24px;"></div>
    </div>

    <!-- Brand content -->
    <div class="relative z-10 flex flex-col justify-between p-10 xl:p-12 w-full">
      <div class="flex items-center gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
          <Shield class="h-5 w-5 text-white" />
        </div>
        <span class="text-lg font-semibold text-white tracking-tight">{title}</span>
      </div>

      <div class="space-y-4">
        <h2 class="text-3xl xl:text-4xl font-bold text-white leading-tight">
          {t('auth.welcomeBack')}
        </h2>
        <p class="text-base text-white/70 leading-relaxed max-w-[320px]">
          {t('auth.welcomeMessage')}
        </p>
      </div>

      <!-- Decorative bottom bar -->
      <div class="flex items-center gap-3">
        <div class="h-1 w-8 rounded-full bg-white/30"></div>
        <div class="h-1 w-4 rounded-full bg-white/15"></div>
        <div class="h-1 w-2 rounded-full bg-white/10"></div>
      </div>
    </div>
  </div>

  <!-- Right panel: login form -->
  <div class="flex-1 flex items-center justify-center bg-background p-6 sm:p-8 lg:p-12">
    <div class="w-full max-w-[400px]">
      <!-- Mobile-only brand header -->
      <div class="flex items-center gap-3 mb-8 lg:hidden">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Shield class="h-5 w-5" />
        </div>
        <span class="text-lg font-semibold tracking-tight">{title}</span>
      </div>

      <div class="space-y-1 mb-8">
        <h1 class="text-2xl font-semibold tracking-tight">
          {t('auth.welcomeBack')}
        </h1>
        <p class="text-sm text-muted-foreground">
          {t('auth.welcomeMessage')}
        </p>
      </div>

      <form onsubmit={handleSubmit} class="space-y-5">
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

        <Button type="submit" class="w-full h-10" disabled={login.isLoading}>
          {#if login.isLoading}
            <Loader2 class="h-4 w-4 animate-spin mr-2" />
          {/if}
          {t('auth.loginButton')}
        </Button>
      </form>

      {#if socialProviders.length > 0}
        <div class="relative my-6">
          <Separator />
          <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
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
        <div class="flex items-center justify-center gap-1 mt-8 pt-6 border-t">
          <span class="text-sm text-muted-foreground">{t('auth.noAccount')}</span>
          <Button variant="link" class="text-sm h-auto p-0 font-medium" onclick={() => navigate('/register')}>
            {t('auth.register')}
          </Button>
        </div>
      {/if}

      <p class="text-xs text-muted-foreground/60 mt-8 text-center">
        Powered by {title}
      </p>
    </div>
  </div>
</div>
