<script lang="ts">
  import { useTranslation } from '@svadmin/core/i18n';
  import { Bell, Mail, Smartphone } from '@lucide/svelte';
  import * as Card from './ui/card/index.js';
  import { Button } from './ui/button/index.js';
  import { Label } from './ui/label/index.js';
  import { Switch } from './ui/switch/index.js';

  const i18n = useTranslation();

  let emailAlerts = $state({ security: true, activity: false, reports: true });
  let pushAlerts = $state({ security: true, activity: true, reports: false });
  let smsAlerts = $state({ security: true });
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
      <h2 class="text-xl font-semibold text-foreground">{i18n.t('settings.notifications')}</h2>
      <p class="mt-1 text-sm text-muted-foreground">{i18n.t('settings.notificationsDescription')}</p>
    </div>
    <Button onclick={saveSettings}>{isSaved ? i18n.t('common.autoSaved') : i18n.t('common.save')}</Button>
  </div>

  <Card.Card>
    <Card.CardHeader>
      <Card.CardTitle class="flex items-center gap-2 text-base">
        <Mail class="h-4 w-4 text-muted-foreground" />
        {i18n.t('notifications.emailTitle')}
      </Card.CardTitle>
      <Card.CardDescription>{i18n.t('notifications.emailDescription')}</Card.CardDescription>
    </Card.CardHeader>
    <Card.CardContent class="space-y-4">
      <div class="flex items-center justify-between gap-4 border-b py-2">
        <div class="space-y-1">
          <Label for="email-security">{i18n.t('notifications.securityAlerts')}</Label>
          <p class="text-xs text-muted-foreground">{i18n.t('notifications.securityAlertsDesc')}</p>
        </div>
        <Switch id="email-security" bind:checked={emailAlerts.security} />
      </div>
      <div class="flex items-center justify-between gap-4 border-b py-2">
        <div class="space-y-1">
          <Label for="email-activity">{i18n.t('notifications.activityLogs')}</Label>
          <p class="text-xs text-muted-foreground">{i18n.t('notifications.activityLogsDesc')}</p>
        </div>
        <Switch id="email-activity" bind:checked={emailAlerts.activity} />
      </div>
      <div class="flex items-center justify-between gap-4 py-2">
        <div class="space-y-1">
          <Label for="email-reports">{i18n.t('notifications.systemAlerts')}</Label>
          <p class="text-xs text-muted-foreground">{i18n.t('notifications.systemAlertsDesc')}</p>
        </div>
        <Switch id="email-reports" bind:checked={emailAlerts.reports} />
      </div>
    </Card.CardContent>
  </Card.Card>

  <Card.Card>
    <Card.CardHeader>
      <Card.CardTitle class="flex items-center gap-2 text-base">
        <Bell class="h-4 w-4 text-muted-foreground" />
        {i18n.t('notifications.pushTitle')}
      </Card.CardTitle>
      <Card.CardDescription>{i18n.t('notifications.pushDescription')}</Card.CardDescription>
    </Card.CardHeader>
    <Card.CardContent class="space-y-4">
      <div class="flex items-center justify-between gap-4 border-b py-2">
        <div class="space-y-1">
          <Label for="push-security">{i18n.t('notifications.securityAlerts')}</Label>
          <p class="text-xs text-muted-foreground">{i18n.t('notifications.securityPushDesc')}</p>
        </div>
        <Switch id="push-security" bind:checked={pushAlerts.security} />
      </div>
      <div class="flex items-center justify-between gap-4 border-b py-2">
        <div class="space-y-1">
          <Label for="push-activity">{i18n.t('notifications.activityLogs')}</Label>
          <p class="text-xs text-muted-foreground">{i18n.t('notifications.activityPushDesc')}</p>
        </div>
        <Switch id="push-activity" bind:checked={pushAlerts.activity} />
      </div>
      <div class="flex items-center justify-between gap-4 py-2">
        <div class="space-y-1">
          <Label for="push-reports">{i18n.t('notifications.systemAlerts')}</Label>
          <p class="text-xs text-muted-foreground">{i18n.t('notifications.systemPushDesc')}</p>
        </div>
        <Switch id="push-reports" bind:checked={pushAlerts.reports} />
      </div>
    </Card.CardContent>
  </Card.Card>

  <Card.Card>
    <Card.CardHeader>
      <Card.CardTitle class="flex items-center gap-2 text-base">
        <Smartphone class="h-4 w-4 text-muted-foreground" />
        {i18n.t('notifications.smsTitle')}
      </Card.CardTitle>
      <Card.CardDescription>{i18n.t('notifications.smsDescription')}</Card.CardDescription>
    </Card.CardHeader>
    <Card.CardContent>
      <div class="flex items-center justify-between gap-4 py-2">
        <div class="space-y-1">
          <Label for="sms-security">{i18n.t('notifications.criticalSecurity')}</Label>
          <p class="text-xs text-muted-foreground">{i18n.t('notifications.criticalSecurityDesc')}</p>
        </div>
        <Switch id="sms-security" bind:checked={smsAlerts.security} />
      </div>
    </Card.CardContent>
  </Card.Card>
</div>
