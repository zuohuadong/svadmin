<script lang="ts">
  import { useTranslation } from '@svadmin/core/i18n';
  import * as Card from '../ui/card/index.js';
  import { Button } from '../ui/button/index.js';
  import { Label } from '../ui/label/index.js';
  import { Switch } from '../ui/switch/index.js';
  import { Separator } from '../ui/separator/index.js';
  import { Loader2, PanelLeft } from '@lucide/svelte';

  const i18n = useTranslation();

  let defaultCollapsed = $state(false);
  let pinSidebar = $state(true);
  let showLabels = $state(true);
  let showIcons = $state(true);
  let density = $state<'compact' | 'standard'>('standard');
  let saving = $state(false);

  async function handleSave() {
    saving = true;
    await new Promise(r => setTimeout(r, 800));
    saving = false;
  }
</script>

<div class="space-y-6" data-svadmin-content-page="account">
  <div>
    <h2 class="text-xl font-semibold text-foreground">{i18n.t('account.settingsSidebar')}</h2>
    <p class="mt-1 text-sm text-muted-foreground">{i18n.t('account.settingsSidebarDescription')}</p>
  </div>

  <Card.Card class="border-border/60">
    <Card.CardHeader>
      <Card.CardTitle class="flex items-center gap-2 text-base">
        <PanelLeft class="h-4 w-4 text-muted-foreground" />
        {i18n.t('account.settingsSidebar')}
      </Card.CardTitle>
    </Card.CardHeader>
    <Card.CardContent class="space-y-4">
      <div class="flex items-center justify-between gap-4">
        <div class="space-y-1">
          <Label for="default-collapsed">默认折叠</Label>
          <p class="text-xs text-muted-foreground">启动时自动折叠侧边栏</p>
        </div>
        <Switch id="default-collapsed" bind:checked={defaultCollapsed} />
      </div>

      <Separator />

      <div class="flex items-center justify-between gap-4">
        <div class="space-y-1">
          <Label for="pin-sidebar">{i18n.t('settings.general')}</Label>
          <p class="text-xs text-muted-foreground">固定侧边栏，防止自动收起</p>
        </div>
        <Switch id="pin-sidebar" bind:checked={pinSidebar} />
      </div>

      <div class="flex items-center justify-between gap-4">
        <div class="space-y-1">
          <Label for="show-labels">显示标签文字</Label>
          <p class="text-xs text-muted-foreground">在图标旁显示菜单项名称</p>
        </div>
        <Switch id="show-labels" bind:checked={showLabels} />
      </div>

      <div class="flex items-center justify-between gap-4">
        <div class="space-y-1">
          <Label for="show-icons">显示图标</Label>
          <p class="text-xs text-muted-foreground">在标签旁显示菜单图标</p>
        </div>
        <Switch id="show-icons" bind:checked={showIcons} />
      </div>

      <Separator />

      <div class="space-y-2">
        <Label>{i18n.t('settings.sidebarDensity')}</Label>
        <div class="flex rounded-lg border border-input overflow-hidden">
          <button
            class="flex-1 px-4 py-2 text-sm font-medium transition-colors
              {density === 'compact' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-accent'}"
            onclick={() => density = 'compact'}
          >{i18n.t('settings.compact')}</button>
          <button
            class="flex-1 px-4 py-2 text-sm font-medium transition-colors
              {density === 'standard' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-accent'}"
            onclick={() => density = 'standard'}
          >{i18n.t('settings.standard')}</button>
        </div>
      </div>

      <div class="flex justify-end">
        <Button onclick={handleSave} disabled={saving}>
          {#if saving}<Loader2 class="h-4 w-4 animate-spin mr-2" />{/if}
          {i18n.t('common.save')}
        </Button>
      </div>
    </Card.CardContent>
  </Card.Card>
</div>
