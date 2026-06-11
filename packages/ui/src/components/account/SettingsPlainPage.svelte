<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import * as Card from '../ui/card/index.js';
  import { Button } from '../ui/button/index.js';
  import { Input } from '../ui/input/index.js';
  import { Label } from '../ui/label/index.js';
  import { Switch } from '../ui/switch/index.js';
  import { Separator } from '../ui/separator/index.js';
  import { Badge } from '../ui/badge/index.js';
  import { Bell, Clock3, KeyRound, Languages, Loader2, Save, ShieldCheck, UserRound } from '@lucide/svelte';

  let displayName = $state('Alex Chen');
  let email = $state('alex@example.com');
  let timezone = $state('Asia/Shanghai');
  let sessionLimit = $state('5');
  let idleTimeout = $state('30');
  let emailNotifications = $state(true);
  let pushNotifications = $state(true);
  let weeklyDigest = $state(true);
  let twoFactor = $state(false);
  let deviceApproval = $state(true);
  let savingSection = $state<string | null>(null);

  const sections = [
    { id: 'identity', label: '身份资料', icon: UserRound },
    { id: 'preferences', label: '偏好设置', icon: Languages },
    { id: 'notifications', label: '通知策略', icon: Bell },
    { id: 'security', label: '安全控制', icon: ShieldCheck },
  ];

  async function handleSave(section: string) {
    savingSection = section;
    await new Promise((resolve) => setTimeout(resolve, 600));
    savingSection = null;
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
    <div>
      <h2 class="text-xl font-semibold text-foreground">{t('account.settingsPlain')}</h2>
      <p class="mt-1 text-sm text-muted-foreground">{t('account.settingsPlainDescription')}</p>
    </div>
    <div class="flex flex-wrap gap-2">
      {#each sections as section (section.id)}
        <Badge variant="outline" class="gap-1.5">
          <section.icon class="h-3.5 w-3.5" />
          {section.label}
        </Badge>
      {/each}
    </div>
  </div>

  <div class="grid gap-4 xl:grid-cols-2">
    <Card.Card class="border-border/70 bg-card">
      <Card.CardHeader>
        <Card.CardTitle class="flex items-center gap-2 text-base">
          <UserRound class="h-4 w-4 text-muted-foreground" />
          身份资料
        </Card.CardTitle>
        <Card.CardDescription>用于个人资料、审计日志和协作提及。</Card.CardDescription>
      </Card.CardHeader>
      <Card.CardContent class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="display-name">{t('profile.name')}</Label>
            <Input id="display-name" bind:value={displayName} />
          </div>
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input id="email" bind:value={email} type="email" />
          </div>
        </div>
        <Separator />
        <div class="flex justify-end">
          <Button size="sm" onclick={() => handleSave('identity')} disabled={savingSection === 'identity'}>
            {#if savingSection === 'identity'}
              <Loader2 class="h-4 w-4 animate-spin" />
            {:else}
              <Save class="h-4 w-4" />
            {/if}
            {t('common.save')}
          </Button>
        </div>
      </Card.CardContent>
    </Card.Card>

    <Card.Card class="border-border/70 bg-card">
      <Card.CardHeader>
        <Card.CardTitle class="flex items-center gap-2 text-base">
          <Clock3 class="h-4 w-4 text-muted-foreground" />
          偏好设置
        </Card.CardTitle>
        <Card.CardDescription>控制时间、语言和默认工作会话。</Card.CardDescription>
      </Card.CardHeader>
      <Card.CardContent class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="timezone">时区</Label>
            <Input id="timezone" bind:value={timezone} />
          </div>
          <div class="space-y-2">
            <Label for="session-limit">同时在线设备</Label>
            <Input id="session-limit" bind:value={sessionLimit} type="number" />
          </div>
          <div class="space-y-2">
            <Label for="idle-timeout">空闲超时（分钟）</Label>
            <Input id="idle-timeout" bind:value={idleTimeout} type="number" />
          </div>
        </div>
        <Separator />
        <div class="flex justify-end">
          <Button size="sm" onclick={() => handleSave('preferences')} disabled={savingSection === 'preferences'}>
            {#if savingSection === 'preferences'}<Loader2 class="h-4 w-4 animate-spin" />{:else}<Save class="h-4 w-4" />{/if}
            {t('common.save')}
          </Button>
        </div>
      </Card.CardContent>
    </Card.Card>

    <Card.Card class="border-border/70 bg-card">
      <Card.CardHeader>
        <Card.CardTitle class="flex items-center gap-2 text-base">
          <Bell class="h-4 w-4 text-muted-foreground" />
          通知策略
        </Card.CardTitle>
        <Card.CardDescription>设置不同渠道的消息触达。</Card.CardDescription>
      </Card.CardHeader>
      <Card.CardContent class="space-y-4">
        <div class="flex items-center justify-between gap-4">
          <div class="space-y-1">
            <Label for="email-notif">{t('notifications.emailTitle')}</Label>
            <p class="text-xs text-muted-foreground">{t('notifications.emailDescription')}</p>
          </div>
          <Switch id="email-notif" bind:checked={emailNotifications} />
        </div>
        <div class="flex items-center justify-between gap-4">
          <div class="space-y-1">
            <Label for="push-notif">{t('notifications.pushTitle')}</Label>
            <p class="text-xs text-muted-foreground">{t('notifications.pushDescription')}</p>
          </div>
          <Switch id="push-notif" bind:checked={pushNotifications} />
        </div>
        <div class="flex items-center justify-between gap-4">
          <div class="space-y-1">
            <Label for="weekly-digest">周报摘要</Label>
            <p class="text-xs text-muted-foreground">每周发送项目、成员和安全变化摘要。</p>
          </div>
          <Switch id="weekly-digest" bind:checked={weeklyDigest} />
        </div>
      </Card.CardContent>
    </Card.Card>

    <Card.Card class="border-border/70 bg-card">
      <Card.CardHeader>
        <Card.CardTitle class="flex items-center gap-2 text-base">
          <KeyRound class="h-4 w-4 text-muted-foreground" />
          安全控制
        </Card.CardTitle>
        <Card.CardDescription>敏感操作和新设备访问前的保护策略。</Card.CardDescription>
      </Card.CardHeader>
      <Card.CardContent class="space-y-4">
        <div class="flex items-center justify-between gap-4">
          <div class="space-y-1">
            <Label for="two-factor">{t('security.twoFactorAuth')}</Label>
            <p class="text-xs text-muted-foreground">{t('security.twoFactorDescription')}</p>
          </div>
          <Switch id="two-factor" bind:checked={twoFactor} />
        </div>
        <div class="flex items-center justify-between gap-4">
          <div class="space-y-1">
            <Label for="device-approval">新设备审批</Label>
            <p class="text-xs text-muted-foreground">首次登录需要管理员或邮箱确认。</p>
          </div>
          <Switch id="device-approval" bind:checked={deviceApproval} />
        </div>
        <Separator />
        <div class="flex justify-end">
          <Button size="sm" onclick={() => handleSave('security')} disabled={savingSection === 'security'}>
            {#if savingSection === 'security'}<Loader2 class="h-4 w-4 animate-spin" />{:else}<Save class="h-4 w-4" />{/if}
            {t('common.save')}
          </Button>
        </div>
      </Card.CardContent>
    </Card.Card>
  </div>
</div>
