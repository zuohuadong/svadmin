<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import * as Card from '../ui/card/index.js';
  import { Button } from '../ui/button/index.js';
  import { Input } from '../ui/input/index.js';
  import { Label } from '../ui/label/index.js';
  import { Building2, MapPin, ShieldCheck, Upload, Loader2 } from '@lucide/svelte';

  let companyName = $state('Acme Corporation');
  let industry = $state('Technology');
  let website = $state('https://acme.com');
  let employeeCount = $state('1,250');
  let foundedYear = $state('2015');
  let registrationNo = $state('91310000MA1K0000X1');
  let taxNo = $state('CN-310115-2026');
  let address = $state('上海市浦东新区示例路 88 号');
  let description = $state('Building the future of enterprise software with cutting-edge AI and cloud solutions.');
  let saving = $state(false);

  async function handleSave() {
    saving = true;
    await new Promise(r => setTimeout(r, 800));
    saving = false;
  }
</script>

<div class="space-y-6">
  <div>
    <h2 class="text-xl font-semibold text-foreground">{t('account.companyProfile')}</h2>
    <p class="mt-1 text-sm text-muted-foreground">{t('account.companyProfileDescription')}</p>
  </div>

  <!-- Company Avatar & Banner -->
  <Card.Card class="border-border/60">
    <Card.CardContent class="p-0">
      <div class="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20 relative rounded-t-xl">
        <button class="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 text-white hover:bg-black/60 transition-colors">
          <Upload class="h-4 w-4" />
        </button>
      </div>
      <div class="relative px-6 pb-5">
        <div class="-mt-8 flex items-end gap-4">
          <div class="ring-4 ring-card rounded-xl overflow-hidden shrink-0">
            <div class="flex h-16 w-16 items-center justify-center bg-primary/10 text-primary text-xl font-bold">
              {companyName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          </div>
          <div class="pb-1">
            <h3 class="text-lg font-semibold text-foreground">{companyName}</h3>
            <p class="text-sm text-muted-foreground">{industry}</p>
          </div>
        </div>
      </div>
    </Card.CardContent>
  </Card.Card>

  <div class="grid gap-4 lg:grid-cols-[1fr_18rem]">
  <Card.Card class="border-border/60">
    <Card.CardHeader>
      <Card.CardTitle class="flex items-center gap-2 text-base">
        <Building2 class="h-4 w-4 text-muted-foreground" />
        {t('profile.companyName')}
      </Card.CardTitle>
    </Card.CardHeader>
    <Card.CardContent class="space-y-4">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <Label for="company-name">{t('profile.companyName')}</Label>
          <Input id="company-name" bind:value={companyName} />
        </div>
        <div class="space-y-2">
          <Label for="company-industry">{t('profile.industry')}</Label>
          <Input id="company-industry" bind:value={industry} />
        </div>
        <div class="space-y-2">
          <Label for="company-website">{t('profile.website')}</Label>
          <Input id="company-website" bind:value={website} type="url" />
        </div>
        <div class="space-y-2">
          <Label for="company-employees">{t('profile.employees')}</Label>
          <Input id="company-employees" bind:value={employeeCount} />
        </div>
        <div class="space-y-2">
          <Label for="company-founded">{t('profile.founded')}</Label>
          <Input id="company-founded" bind:value={foundedYear} />
        </div>
        <div class="space-y-2">
          <Label for="company-registration">注册号</Label>
          <Input id="company-registration" bind:value={registrationNo} />
        </div>
        <div class="space-y-2">
          <Label for="company-tax">税务编号</Label>
          <Input id="company-tax" bind:value={taxNo} />
        </div>
      </div>
      <div class="space-y-2">
        <Label for="company-address">注册地址</Label>
        <Input id="company-address" bind:value={address} />
      </div>
      <div class="space-y-2">
        <Label for="company-description">{t('profile.companyDescription')}</Label>
        <textarea
          id="company-description"
          bind:value={description}
          rows={3}
          class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        ></textarea>
      </div>
      <div class="flex justify-end">
        <Button onclick={handleSave} disabled={saving}>
          {#if saving}<Loader2 class="h-4 w-4 animate-spin mr-2" />{/if}
          {t('common.save')}
        </Button>
      </div>
    </Card.CardContent>
  </Card.Card>

  <div class="space-y-4">
    <Card.Card class="border-border/60">
      <Card.CardContent class="space-y-3 p-4">
        <div class="flex items-center gap-2 text-sm font-semibold text-foreground">
          <ShieldCheck class="h-4 w-4 text-emerald-600" />
          合规状态
        </div>
        {#each [
          { label: '企业认证', value: '已通过' },
          { label: '审计周期', value: 'Q2 / FY26' },
          { label: '数据区域', value: 'CN + APAC' },
        ] as item (item.label)}
          <div class="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
            <span class="text-xs text-muted-foreground">{item.label}</span>
            <span class="text-sm font-medium text-foreground">{item.value}</span>
          </div>
        {/each}
      </Card.CardContent>
    </Card.Card>
    <Card.Card class="border-border/60">
      <Card.CardContent class="flex items-start gap-3 p-4">
        <MapPin class="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <p class="text-sm font-medium text-foreground">总部地址</p>
          <p class="mt-1 text-sm text-muted-foreground">{address}</p>
        </div>
      </Card.CardContent>
    </Card.Card>
  </div>
  </div>
</div>
