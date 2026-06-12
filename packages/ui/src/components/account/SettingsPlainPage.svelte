<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import * as Card from '../ui/card/index.js';
  import { Button } from '../ui/button/index.js';
  import { Input } from '../ui/input/index.js';
  import { Label } from '../ui/label/index.js';
  import { Switch } from '../ui/switch/index.js';
  import { Separator } from '../ui/separator/index.js';
  import { Loader2 } from '@lucide/svelte';

  let displayName = $state('Alex Chen');
  let email = $state('alex@example.com');
  let emailNotifications = $state(true);
  let pushNotifications = $state(true);
  let twoFactor = $state(false);
  let saving = $state(false);

  async function handleSave() {
    saving = true;
    await new Promise(r => setTimeout(r, 800));
    saving = false;
  }
</script>

<div class="space-y-6" data-svadmin-content-page="account">
  <div>
    <h2 class="text-xl font-semibold text-foreground">{t('account.settingsPlain')}</h2>
    <p class="mt-1 text-sm text-muted-foreground">{t('account.settingsPlainDescription')}</p>
  </div>

  <Card.Card class="border-border/60">
    <Card.CardHeader>
      <Card.CardTitle class="text-base">{t('settings.general')}</Card.CardTitle>
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
          <Label for="two-factor">{t('security.twoFactorAuth')}</Label>
          <p class="text-xs text-muted-foreground">{t('security.twoFactorDescription')}</p>
        </div>
        <Switch id="two-factor" bind:checked={twoFactor} />
      </div>

      <div class="flex justify-end">
        <Button onclick={handleSave} disabled={saving}>
          {#if saving}<Loader2 class="h-4 w-4 animate-spin mr-2" />{/if}
          {t('common.save')}
        </Button>
      </div>
    </Card.CardContent>
  </Card.Card>
</div>
