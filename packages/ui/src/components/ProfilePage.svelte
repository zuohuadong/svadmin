<script lang="ts">
  import { useGetIdentity, useUpdatePassword } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';
  import { Button } from './ui/button/index.js';
  import { Label } from './ui/label/index.js';
  import * as Card from './ui/card/index.js';
  import * as Alert from './ui/alert/index.js';
  import PasswordInput from './PasswordInput.svelte';
  import { User, Mail, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-svelte';

  const identity = useGetIdentity();
  const updatePw = useUpdatePassword();

  // Password change form
  let currentPassword = $state('');
  let newPassword = $state('');
  let confirmPassword = $state('');
  let pwError = $state('');
  let pwSuccess = $state(false);

  async function handlePasswordChange(e: SubmitEvent) {
    e.preventDefault();
    pwError = '';
    pwSuccess = false;

    if (!newPassword) { pwError = t('auth.passwordRequired'); return; }
    if (newPassword !== confirmPassword) { pwError = t('auth.passwordMismatch'); return; }

    const result = await updatePw.mutate({
      password: newPassword,
      currentPassword,
      confirmPassword,
    });
    if (result.success) {
      pwSuccess = true;
      currentPassword = '';
      newPassword = '';
      confirmPassword = '';
    } else {
      pwError = result.error?.message ?? t('common.operationFailed');
    }
  }

  // Avatar initials
  const initials = $derived(
    identity.data?.name
      ? identity.data.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
      : '?'
  );
</script>

<div class="max-w-2xl mx-auto space-y-6 p-4 sm:p-6">
  <!-- Profile Info -->
  <Card.Card>
    <Card.CardHeader>
      <Card.CardTitle class="flex items-center gap-2">
        <User class="h-5 w-5" />
        {t('profile.title')}
      </Card.CardTitle>
    </Card.CardHeader>
    <Card.CardContent>
      {#if identity.isLoading}
        <div class="flex items-center gap-2 text-muted-foreground">
          <Loader2 class="h-4 w-4 animate-spin" />
          {t('common.loading')}
        </div>
      {:else if identity.data}
        <div class="flex items-start gap-6">
          <!-- Avatar -->
          <div class="shrink-0">
            {#if identity.data.avatar}
              <img
                src={identity.data.avatar}
                alt={identity.data.name ?? ''}
                class="h-20 w-20 rounded-xl object-cover ring-2 ring-primary/20"
              />
            {:else}
              <div class="h-20 w-20 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
                {initials}
              </div>
            {/if}
          </div>

          <!-- Info -->
          <div class="space-y-3 flex-1 min-w-0">
            <div>
              <Label class="text-xs text-muted-foreground">{t('profile.name')}</Label>
              <p class="text-lg font-semibold truncate">{identity.data.name ?? '—'}</p>
            </div>

            {#if identity.data.email}
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail class="h-4 w-4 shrink-0" />
                <span class="truncate">{identity.data.email}</span>
              </div>
            {/if}

            {#if identity.data.id}
              <div class="text-xs text-muted-foreground/60 font-mono">
                ID: {identity.data.id}
              </div>
            {/if}
          </div>
        </div>
      {:else}
        <p class="text-sm text-muted-foreground">{t('profile.notAvailable')}</p>
      {/if}
    </Card.CardContent>
  </Card.Card>

  <!-- Change Password -->
  <Card.Card>
    <Card.CardHeader>
      <Card.CardTitle class="flex items-center gap-2">
        <Lock class="h-5 w-5" />
        {t('profile.changePassword')}
      </Card.CardTitle>
    </Card.CardHeader>
    <Card.CardContent>
      <form onsubmit={handlePasswordChange} class="space-y-4 max-w-sm">
        {#if pwError}
          <Alert.Root variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <Alert.Description>{pwError}</Alert.Description>
          </Alert.Root>
        {/if}

        {#if pwSuccess}
          <Alert.Root class="border-green-500/30 bg-green-500/5 text-green-600 dark:text-green-400">
            <CheckCircle class="h-4 w-4" />
            <Alert.Description>{t('profile.passwordChanged')}</Alert.Description>
          </Alert.Root>
        {/if}

        <PasswordInput
          id="current-password"
          label={t('profile.currentPassword')}
          bind:value={currentPassword}
          autocomplete="current-password"
        />

        <PasswordInput
          id="new-password"
          label={t('auth.password')}
          bind:value={newPassword}
          autocomplete="new-password"
          showStrength
        />

        <PasswordInput
          id="confirm-new-password"
          label={t('auth.confirmPassword')}
          bind:value={confirmPassword}
          autocomplete="new-password"
        />

        <Button type="submit" disabled={updatePw.isLoading}>
          {#if updatePw.isLoading}
            <Loader2 class="h-4 w-4 animate-spin mr-2" />
          {/if}
          {t('profile.updatePassword')}
        </Button>
      </form>
    </Card.CardContent>
  </Card.Card>
</div>
