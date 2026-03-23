<script lang="ts">
  import { useRegister } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';
  import { navigate } from '@svadmin/core/router';
  import { Button } from './ui/button/index.js';
  import { Input } from './ui/input/index.js';
  import { Label } from './ui/label/index.js';
  import * as Card from './ui/card/index.js';
  import * as Alert from './ui/alert/index.js';
  import PasswordInput from './PasswordInput.svelte';
  import { UserPlus, Mail, Loader2, AlertCircle } from 'lucide-svelte';

  let { title = 'Admin', onSuccess } = $props<{
    title?: string;
    onSuccess?: () => void;
  }>();

  const register = useRegister();

  let email = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let error = $state('');

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    error = '';

    if (!email) { error = t('auth.emailRequired'); return; }
    if (!password) { error = t('auth.passwordRequired'); return; }
    if (password !== confirmPassword) { error = t('auth.passwordMismatch'); return; }

    const result = await register.mutate({ email, password });
    if (result.success) {
      onSuccess?.();
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
          <UserPlus class="h-6 w-6" />
        </div>
        <Card.CardTitle class="text-2xl font-bold">{t('auth.createAccount')}</Card.CardTitle>
        <p class="text-sm text-muted-foreground">{t('auth.createAccountMessage')}</p>
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
            <Label for="register-email">{t('auth.email')}</Label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-[1]" />
              <Input
                id="register-email"
                type="email"
                placeholder="name@example.com"
                bind:value={email}
                class="pl-9"
                autocomplete="email"
              />
            </div>
          </div>

          <PasswordInput
            id="register-password"
            label={t('auth.password')}
            bind:value={password}
            autocomplete="new-password"
            showStrength
          />

          <PasswordInput
            id="register-confirm"
            label={t('auth.confirmPassword')}
            bind:value={confirmPassword}
            autocomplete="new-password"
          />

          <Button type="submit" class="w-full" disabled={register.isLoading}>
            {#if register.isLoading}
              <Loader2 class="h-4 w-4 animate-spin mr-2" />
            {/if}
            {t('auth.registerButton')}
          </Button>
        </form>

        <div class="flex items-center justify-center gap-1 mt-5 pt-5 border-t">
          <span class="text-sm text-muted-foreground">{t('auth.hasAccount')}</span>
          <Button variant="link" class="text-sm h-auto p-0 font-medium" onclick={() => navigate('/login')}>
            {t('auth.login')}
          </Button>
        </div>
      </Card.CardContent>
    </Card.Card>

    <p class="text-xs text-muted-foreground mt-4 text-center opacity-60">
      Powered by {title}
    </p>
  </div>
</div>
