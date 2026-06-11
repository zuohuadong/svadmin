<script lang="ts">
  import { useGetIdentity, useUpdatePassword, getAuthProvider } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';
  import { Button } from './ui/button/index.js';
  import { Label } from './ui/label/index.js';
  import { Input } from './ui/input/index.js';
  import { Badge } from './ui/badge/index.js';
  import { Switch } from './ui/switch/index.js';
  import * as Card from './ui/card/index.js';
  import * as Alert from './ui/alert/index.js';
  import PasswordInput from './PasswordInput.svelte';
  import { User, Mail, Lock, Loader2, AlertCircle, CheckCircle, Camera, Globe2, Link2, ShieldCheck, Smartphone, Monitor } from '@lucide/svelte';

  const identity = useGetIdentity();
  const updatePw = useUpdatePassword();

  // Check if auth provider supports updateProfile
  let authProvider: ReturnType<typeof getAuthProvider> | null = null;
  try { authProvider = getAuthProvider(); } catch { /* no auth */ }
  const canUpdateProfile = !!authProvider?.updateProfile;

  // Profile edit state
  let editingProfile = $state(false);
  let editName = $state('');
  let profileSaving = $state(false);
  let profileSuccess = $state(false);
  let profileError = $state('');

  function startEditProfile() {
    editName = identity.data?.name ?? '';
    editingProfile = true;
    profileSuccess = false;
    profileError = '';
  }

  async function saveProfile() {
    if (!authProvider?.updateProfile) return;
    profileSaving = true;
    profileError = '';
    try {
      const result = await authProvider.updateProfile({ name: editName });
      if (result.success) {
        profileSuccess = true;
        editingProfile = false;
        identity.refetch();
      } else {
        profileError = result.error?.message ?? t('common.operationFailed');
      }
    } catch (e) {
      profileError = (e as Error).message;
    } finally {
      profileSaving = false;
    }
  }

  // Avatar upload
  let avatarUploading = $state(false);
  let fileInput = $state<HTMLInputElement | null>(null);

  async function handleAvatarChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file || !authProvider?.updateProfile) return;
    avatarUploading = true;
    try {
      const result = await authProvider.updateProfile({ avatar: file });
      if (result.success) identity.refetch();
    } finally {
      avatarUploading = false;
    }
  }

  // Password change form
  let currentPassword = $state('');
  let newPassword = $state('');
  let confirmPassword = $state('');
  let pwError = $state('');
  let pwSuccess = $state(false);
  let language = $state('zh-CN');
  let timezone = $state('Asia/Shanghai');
  let emailDigest = $state(true);
  let productUpdates = $state(false);

  const linkedAccounts = [
    { id: 'identity', label: '企业身份', description: '用于 SSO 与组织成员同步', status: '已连接', icon: ShieldCheck, tone: 'bg-emerald-500/10 text-emerald-700' },
    { id: 'mobile', label: '移动设备', description: '接收安全挑战和紧急提醒', status: '待验证', icon: Smartphone, tone: 'bg-amber-500/10 text-amber-700' },
    { id: 'workspace', label: '协作空间', description: '同步任务、评论和审批通知', status: '可连接', icon: Link2, tone: 'bg-muted text-muted-foreground' },
  ];

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

<div class="space-y-6">
  <div>
    <h2 class="text-xl font-semibold text-foreground">{t('profile.title')}</h2>
  </div>

  <!-- Profile Info -->
  <Card.Card>
    <Card.CardHeader>
      <Card.CardTitle class="flex items-center gap-2 text-base">
        <User class="h-4 w-4 text-muted-foreground" />
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
        {#if profileSuccess}
          <Alert.Root class="border-success/30 bg-success/5 text-success mb-4">
            <CheckCircle class="h-4 w-4" />
            <Alert.Description>{t('common.updateSuccess')}</Alert.Description>
          </Alert.Root>
        {/if}

        <div class="flex items-start gap-6">
          <!-- Avatar -->
          <div class="shrink-0 relative group">
            {#if identity.data.avatar}
              <img
                src={identity.data.avatar}
                alt={identity.data.name ?? ''}
                class="h-20 w-20 rounded-lg object-cover ring-2 ring-primary/20"
              />
            {:else}
              <div class="h-20 w-20 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
                {initials}
              </div>
            {/if}
            {#if canUpdateProfile}
              <button
                class="absolute inset-0 rounded-lg bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onclick={() => fileInput?.click()}
                disabled={avatarUploading}
              >
                {#if avatarUploading}
                  <Loader2 class="h-5 w-5 text-white animate-spin" />
                {:else}
                  <Camera class="h-5 w-5 text-white" />
                {/if}
              </button>
              <input
                bind:this={fileInput}
                type="file"
                accept="image/*"
                class="hidden"
                onchange={handleAvatarChange}
              />
            {/if}
          </div>

          <!-- Info -->
          <div class="space-y-3 flex-1 min-w-0">
            {#if editingProfile}
              <div class="space-y-3 max-w-sm">
                <div>
                  <Label for="edit-name" class="text-xs text-muted-foreground">{t('profile.name')}</Label>
                  <Input id="edit-name" bind:value={editName} class="mt-1" />
                </div>
                {#if profileError}
                  <p class="text-xs text-destructive">{profileError}</p>
                {/if}
                <div class="flex gap-2">
                  <Button size="sm" onclick={saveProfile} disabled={profileSaving}>
                    {#if profileSaving}<Loader2 class="h-3 w-3 animate-spin mr-1" />{/if}
                    {t('common.save')}
                  </Button>
                  <Button size="sm" variant="outline" onclick={() => { editingProfile = false; }}>
                    {t('common.cancel')}
                  </Button>
                </div>
              </div>
            {:else}
              <div>
                <Label class="text-xs text-muted-foreground">{t('profile.name')}</Label>
                <p class="text-lg font-semibold truncate">{identity.data.name ?? '—'}</p>
              </div>

              {#if identity.data.email || identity.data.username}
                <div class="flex items-center gap-2 text-sm text-muted-foreground">
                  {#if identity.data.email}
                    <Mail class="h-4 w-4 shrink-0" />
                  {:else}
                    <User class="h-4 w-4 shrink-0" />
                  {/if}
                  <span class="truncate">{identity.data.email || identity.data.username}</span>
                </div>
              {/if}

              {#if identity.data.id}
                <div class="text-xs text-muted-foreground/60 font-mono">
                  ID: {identity.data.id}
                </div>
              {/if}

              {#if canUpdateProfile}
                <Button size="sm" variant="outline" onclick={startEditProfile}>
                  {t('common.edit')}
                </Button>
              {/if}
            {/if}
          </div>
        </div>
      {:else}
        <p class="text-sm text-muted-foreground">{t('profile.notAvailable')}</p>
      {/if}
    </Card.CardContent>
  </Card.Card>

  <div class="grid gap-4 lg:grid-cols-[1fr_20rem]">
    <Card.Card>
      <Card.CardHeader>
        <Card.CardTitle class="flex items-center gap-2 text-base">
          <Globe2 class="h-4 w-4 text-muted-foreground" />
          账户偏好
        </Card.CardTitle>
        <Card.CardDescription>用于控制语言、时区和通知摘要的默认体验。</Card.CardDescription>
      </Card.CardHeader>
      <Card.CardContent class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="profile-language">{t('settings.language')}</Label>
            <select
              id="profile-language"
              bind:value={language}
              class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
              <option value="ja-JP">日本語</option>
            </select>
          </div>
          <div class="space-y-2">
            <Label for="profile-timezone">时区</Label>
            <select
              id="profile-timezone"
              bind:value={timezone}
              class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Asia/Shanghai">Asia/Shanghai</option>
              <option value="Asia/Singapore">Asia/Singapore</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div class="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
            <div class="space-y-1">
              <Label for="email-digest">每日摘要</Label>
              <p class="text-xs text-muted-foreground">汇总任务、审批和安全事件。</p>
            </div>
            <Switch id="email-digest" bind:checked={emailDigest} />
          </div>
          <div class="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
            <div class="space-y-1">
              <Label for="product-updates">产品更新</Label>
              <p class="text-xs text-muted-foreground">接收新功能和版本提醒。</p>
            </div>
            <Switch id="product-updates" bind:checked={productUpdates} />
          </div>
        </div>
      </Card.CardContent>
    </Card.Card>

    <Card.Card>
      <Card.CardHeader>
        <Card.CardTitle class="flex items-center gap-2 text-base">
          <Monitor class="h-4 w-4 text-muted-foreground" />
          绑定状态
        </Card.CardTitle>
        <Card.CardDescription>管理和账户关联的身份、设备与协作入口。</Card.CardDescription>
      </Card.CardHeader>
      <Card.CardContent class="space-y-3">
        {#each linkedAccounts as account (account.id)}
          <div class="rounded-xl border border-border/60 bg-muted/20 p-3">
            <div class="flex items-start gap-3">
              <div class="rounded-lg p-2 {account.tone}">
                <account.icon class="h-4 w-4" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <p class="text-sm font-semibold text-foreground">{account.label}</p>
                  <Badge variant="outline" class="text-[10px]">{account.status}</Badge>
                </div>
                <p class="mt-1 text-xs text-muted-foreground">{account.description}</p>
              </div>
            </div>
          </div>
        {/each}
      </Card.CardContent>
    </Card.Card>
  </div>

  <!-- Change Password -->
  <Card.Card>
    <Card.CardHeader>
      <Card.CardTitle class="flex items-center gap-2 text-base">
        <Lock class="h-4 w-4 text-muted-foreground" />
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
          <Alert.Root class="border-success/30 bg-success/5 text-success">
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
