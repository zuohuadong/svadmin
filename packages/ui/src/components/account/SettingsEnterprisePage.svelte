<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import * as Card from '../ui/card/index.js';
  import { Button } from '../ui/button/index.js';
  import { Input } from '../ui/input/index.js';
  import { Label } from '../ui/label/index.js';
  import { Switch } from '../ui/switch/index.js';
  import { Badge } from '../ui/badge/index.js';
  import { Loader2, Shield, Building2, Lock, Globe } from '@lucide/svelte';

  let ssoEnabled = $state(false);
  let ssoProvider = $state('');
  let domainRestriction = $state('');
  let passwordPolicy = $state('strong');
  let sessionTimeout = $state('30');
  let ipWhitelist = $state('');
  let auditLogging = $state(true);
  let dataRetention = $state('365');
  let saving = $state(false);

  async function handleSave() {
    saving = true;
    await new Promise(r => setTimeout(r, 800));
    saving = false;
  }
</script>

<div class="space-y-6" data-svadmin-content-page="account">
  <div class="flex items-start justify-between gap-4">
    <div>
      <h2 class="text-xl font-semibold text-foreground">{t('account.settingsEnterprise')}</h2>
      <p class="mt-1 text-sm text-muted-foreground">{t('account.settingsEnterpriseDescription')}</p>
    </div>
    <Badge variant="secondary"><Building2 class="h-3 w-3 mr-1" />Enterprise</Badge>
  </div>

  <!-- SSO -->
  <Card.Card class="border-border/60">
    <Card.CardHeader>
      <Card.CardTitle class="flex items-center gap-2 text-base">
        <Shield class="h-4 w-4 text-muted-foreground" />
        单点登录 (SSO)
      </Card.CardTitle>
      <Card.CardDescription>配置企业身份提供商以实现统一登录体验。</Card.CardDescription>
    </Card.CardHeader>
    <Card.CardContent class="space-y-4">
      <div class="flex items-center justify-between gap-4">
        <div class="space-y-1">
          <Label for="sso-enabled">启用 SSO</Label>
          <p class="text-xs text-muted-foreground">允许员工通过企业 IdP 登录</p>
        </div>
        <Switch id="sso-enabled" bind:checked={ssoEnabled} />
      </div>
      {#if ssoEnabled}
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="sso-provider">SSO 提供商</Label>
            <Input id="sso-provider" bind:value={ssoProvider} placeholder="Okta, Azure AD, etc." />
          </div>
          <div class="space-y-2">
            <Label for="domain-restriction">域名限制</Label>
            <Input id="domain-restriction" bind:value={domainRestriction} placeholder="@company.com" />
          </div>
        </div>
      {/if}
    </Card.CardContent>
  </Card.Card>

  <!-- Security Policy -->
  <Card.Card class="border-border/60">
    <Card.CardHeader>
      <Card.CardTitle class="flex items-center gap-2 text-base">
        <Lock class="h-4 w-4 text-muted-foreground" />
        安全策略
      </Card.CardTitle>
    </Card.CardHeader>
    <Card.CardContent class="space-y-4">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <Label for="password-policy">密码策略</Label>
          <select id="password-policy" bind:value={passwordPolicy} class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="basic">基本</option>
            <option value="strong">强密码</option>
            <option value="very-strong">非常强</option>
          </select>
        </div>
        <div class="space-y-2">
          <Label for="session-timeout">会话超时（分钟）</Label>
          <Input id="session-timeout" bind:value={sessionTimeout} type="number" />
        </div>
      </div>

      <div class="space-y-2">
        <Label for="ip-whitelist">IP 白名单</Label>
        <Input id="ip-whitelist" bind:value={ipWhitelist} placeholder="10.0.0.0/8, 192.168.1.0/24" />
        <p class="text-xs text-muted-foreground">留空表示不限制 IP</p>
      </div>
    </Card.CardContent>
  </Card.Card>

  <!-- Data & Compliance -->
  <Card.Card class="border-border/60">
    <Card.CardHeader>
      <Card.CardTitle class="flex items-center gap-2 text-base">
        <Globe class="h-4 w-4 text-muted-foreground" />
        数据与合规
      </Card.CardTitle>
    </Card.CardHeader>
    <Card.CardContent class="space-y-4">
      <div class="flex items-center justify-between gap-4">
        <div class="space-y-1">
          <Label for="audit-logging">审计日志</Label>
          <p class="text-xs text-muted-foreground">记录所有管理操作以备合规审查</p>
        </div>
        <Switch id="audit-logging" bind:checked={auditLogging} />
      </div>

      <div class="space-y-2">
        <Label for="data-retention">数据保留天数</Label>
        <Input id="data-retention" bind:value={dataRetention} type="number" />
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
