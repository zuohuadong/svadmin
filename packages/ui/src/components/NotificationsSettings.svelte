<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import { Bell, Clock3, Mail, Smartphone } from '@lucide/svelte';
  import * as Card from './ui/card/index.js';
  import { Button } from './ui/button/index.js';
  import { Label } from './ui/label/index.js';
  import { Switch } from './ui/switch/index.js';
  import { Input } from './ui/input/index.js';

  let emailAlerts = $state({ security: true, activity: false, reports: true });
  let pushAlerts = $state({ security: true, activity: true, reports: false });
  let smsAlerts = $state({ security: true });
  let quietHours = $state(true);
  let quietStart = $state('22:00');
  let quietEnd = $state('08:00');
  let isSaved = $state(false);

  function saveSettings() {
    isSaved = true;
    setTimeout(() => {
      isSaved = false;
    }, 3000);
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
    <div>
      <h2 class="text-xl font-semibold text-foreground">{t('settings.notifications')}</h2>
      <p class="mt-1 text-sm text-muted-foreground">{t('settings.notificationsDescription')}</p>
    </div>
    <Button onclick={saveSettings}>{isSaved ? t('common.autoSaved') : t('common.save')}</Button>
  </div>

  <Card.Card>
    <Card.CardHeader>
      <Card.CardTitle class="flex items-center gap-2 text-base">
        <Mail class="h-4 w-4 text-muted-foreground" />
        {t('notifications.emailTitle')}
      </Card.CardTitle>
      <Card.CardDescription>{t('notifications.emailDescription')}</Card.CardDescription>
    </Card.CardHeader>
    <Card.CardContent class="space-y-4">
      <div class="flex items-center justify-between gap-4 border-b py-2">
        <div class="space-y-1">
          <Label for="email-security">{t('notifications.securityAlerts')}</Label>
          <p class="text-xs text-muted-foreground">{t('notifications.securityAlertsDesc')}</p>
        </div>
        <Switch id="email-security" bind:checked={emailAlerts.security} />
      </div>
      <div class="flex items-center justify-between gap-4 border-b py-2">
        <div class="space-y-1">
          <Label for="email-activity">{t('notifications.activityLogs')}</Label>
          <p class="text-xs text-muted-foreground">{t('notifications.activityLogsDesc')}</p>
        </div>
        <Switch id="email-activity" bind:checked={emailAlerts.activity} />
      </div>
      <div class="flex items-center justify-between gap-4 py-2">
        <div class="space-y-1">
          <Label for="email-reports">{t('notifications.systemAlerts')}</Label>
          <p class="text-xs text-muted-foreground">{t('notifications.systemAlertsDesc')}</p>
        </div>
        <Switch id="email-reports" bind:checked={emailAlerts.reports} />
      </div>
    </Card.CardContent>
  </Card.Card>

  <Card.Card>
    <Card.CardHeader>
      <Card.CardTitle class="flex items-center gap-2 text-base">
        <Bell class="h-4 w-4 text-muted-foreground" />
        {t('notifications.pushTitle')}
      </Card.CardTitle>
      <Card.CardDescription>{t('notifications.pushDescription')}</Card.CardDescription>
    </Card.CardHeader>
    <Card.CardContent class="space-y-4">
      <div class="flex items-center justify-between gap-4 border-b py-2">
        <div class="space-y-1">
          <Label for="push-security">{t('notifications.securityAlerts')}</Label>
          <p class="text-xs text-muted-foreground">{t('notifications.securityPushDesc')}</p>
        </div>
        <Switch id="push-security" bind:checked={pushAlerts.security} />
      </div>
      <div class="flex items-center justify-between gap-4 border-b py-2">
        <div class="space-y-1">
          <Label for="push-activity">{t('notifications.activityLogs')}</Label>
          <p class="text-xs text-muted-foreground">{t('notifications.activityPushDesc')}</p>
        </div>
        <Switch id="push-activity" bind:checked={pushAlerts.activity} />
      </div>
      <div class="flex items-center justify-between gap-4 py-2">
        <div class="space-y-1">
          <Label for="push-reports">{t('notifications.systemAlerts')}</Label>
          <p class="text-xs text-muted-foreground">{t('notifications.systemPushDesc')}</p>
        </div>
        <Switch id="push-reports" bind:checked={pushAlerts.reports} />
      </div>
    </Card.CardContent>
  </Card.Card>

  <Card.Card>
    <Card.CardHeader>
      <Card.CardTitle class="flex items-center gap-2 text-base">
        <Smartphone class="h-4 w-4 text-muted-foreground" />
        {t('notifications.smsTitle')}
      </Card.CardTitle>
      <Card.CardDescription>{t('notifications.smsDescription')}</Card.CardDescription>
    </Card.CardHeader>
    <Card.CardContent>
      <div class="flex items-center justify-between gap-4 py-2">
        <div class="space-y-1">
          <Label for="sms-security">{t('notifications.criticalSecurity')}</Label>
          <p class="text-xs text-muted-foreground">{t('notifications.criticalSecurityDesc')}</p>
        </div>
        <Switch id="sms-security" bind:checked={smsAlerts.security} />
      </div>
    </Card.CardContent>
  </Card.Card>

  <Card.Card>
    <Card.CardHeader>
      <Card.CardTitle class="flex items-center gap-2 text-base">
        <Clock3 class="h-4 w-4 text-muted-foreground" />
        免打扰时段
      </Card.CardTitle>
      <Card.CardDescription>非紧急通知将在时段结束后汇总发送。</Card.CardDescription>
    </Card.CardHeader>
    <Card.CardContent class="space-y-4">
      <div class="flex items-center justify-between gap-4">
        <div class="space-y-1">
          <Label for="quiet-hours">启用免打扰</Label>
          <p class="text-xs text-muted-foreground">严重安全告警仍会立即通知。</p>
        </div>
        <Switch id="quiet-hours" bind:checked={quietHours} />
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <Label for="quiet-start">开始时间</Label>
          <Input id="quiet-start" bind:value={quietStart} type="time" disabled={!quietHours} />
        </div>
        <div class="space-y-2">
          <Label for="quiet-end">结束时间</Label>
          <Input id="quiet-end" bind:value={quietEnd} type="time" disabled={!quietHours} />
        </div>
      </div>
    </Card.CardContent>
  </Card.Card>
</div>
