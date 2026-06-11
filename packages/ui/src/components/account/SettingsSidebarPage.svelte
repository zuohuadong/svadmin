<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import * as Card from '../ui/card/index.js';
  import { Button } from '../ui/button/index.js';
  import { Label } from '../ui/label/index.js';
  import { Switch } from '../ui/switch/index.js';
  import { Separator } from '../ui/separator/index.js';
  import { Badge } from '../ui/badge/index.js';
  import { Loader2, PanelLeft, Rows3, Save, SquareStack, TextCursorInput } from '@lucide/svelte';
  import type { Component } from 'svelte';

  type SectionId = 'behavior' | 'visibility' | 'density';

  interface SidebarSection {
    id: SectionId;
    label: string;
    description: string;
    icon: Component;
  }

  let activeSection = $state<SectionId>('behavior');
  let defaultCollapsed = $state(false);
  let pinSidebar = $state(true);
  let rememberState = $state(true);
  let showLabels = $state(true);
  let showIcons = $state(true);
  let showBadges = $state(true);
  let density = $state<'compact' | 'standard'>('standard');
  let saving = $state(false);

  const sections: SidebarSection[] = [
    { id: 'behavior', label: '行为', description: '启动、固定和记忆状态。', icon: PanelLeft },
    { id: 'visibility', label: '可见性', description: '控制菜单标签、图标和徽标。', icon: TextCursorInput },
    { id: 'density', label: '密度', description: '调整导航行高和扫描效率。', icon: Rows3 },
  ];

  async function handleSave() {
    saving = true;
    await new Promise((resolve) => setTimeout(resolve, 700));
    saving = false;
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
    <div>
      <h2 class="text-xl font-semibold text-foreground">{t('account.settingsSidebar')}</h2>
      <p class="mt-1 text-sm text-muted-foreground">{t('account.settingsSidebarDescription')}</p>
    </div>
    <Badge variant="secondary" class="w-fit gap-1.5">
      <SquareStack class="h-3.5 w-3.5" />
      Clean flat layout
    </Badge>
  </div>

  <div class="grid gap-4 lg:grid-cols-[16rem_1fr]">
    <Card.Card class="border-border/70 bg-card">
      <Card.CardContent class="p-2">
        {#each sections as section (section.id)}
          <button
            class="flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors {activeSection === section.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}"
            onclick={() => activeSection = section.id}
          >
            <section.icon class="mt-0.5 h-4 w-4 shrink-0" />
            <span class="min-w-0">
              <span class="block text-sm font-medium">{section.label}</span>
              <span class="block text-xs opacity-80">{section.description}</span>
            </span>
          </button>
        {/each}
      </Card.CardContent>
    </Card.Card>

    <Card.Card class="border-border/70 bg-card">
      <Card.CardHeader>
        <Card.CardTitle class="flex items-center gap-2 text-base">
          <PanelLeft class="h-4 w-4 text-muted-foreground" />
          {sections.find((section) => section.id === activeSection)?.label}
        </Card.CardTitle>
        <Card.CardDescription>{sections.find((section) => section.id === activeSection)?.description}</Card.CardDescription>
      </Card.CardHeader>
      <Card.CardContent class="space-y-5">
        {#if activeSection === 'behavior'}
          <div class="flex items-center justify-between gap-4">
            <div class="space-y-1">
              <Label for="default-collapsed">默认折叠</Label>
              <p class="text-xs text-muted-foreground">启动时自动折叠侧边栏。</p>
            </div>
            <Switch id="default-collapsed" bind:checked={defaultCollapsed} />
          </div>
          <div class="flex items-center justify-between gap-4">
            <div class="space-y-1">
              <Label for="pin-sidebar">固定侧边栏</Label>
              <p class="text-xs text-muted-foreground">保持桌面端菜单稳定可见。</p>
            </div>
            <Switch id="pin-sidebar" bind:checked={pinSidebar} />
          </div>
          <div class="flex items-center justify-between gap-4">
            <div class="space-y-1">
              <Label for="remember-state">记忆展开状态</Label>
              <p class="text-xs text-muted-foreground">保存每个分组的展开/收起偏好。</p>
            </div>
            <Switch id="remember-state" bind:checked={rememberState} />
          </div>
        {:else if activeSection === 'visibility'}
          <div class="flex items-center justify-between gap-4">
            <div class="space-y-1">
              <Label for="show-labels">显示标签文字</Label>
              <p class="text-xs text-muted-foreground">在图标旁显示菜单项名称。</p>
            </div>
            <Switch id="show-labels" bind:checked={showLabels} />
          </div>
          <div class="flex items-center justify-between gap-4">
            <div class="space-y-1">
              <Label for="show-icons">显示图标</Label>
              <p class="text-xs text-muted-foreground">保留左侧导航的快速识别符号。</p>
            </div>
            <Switch id="show-icons" bind:checked={showIcons} />
          </div>
          <div class="flex items-center justify-between gap-4">
            <div class="space-y-1">
              <Label for="show-badges">显示计数徽标</Label>
              <p class="text-xs text-muted-foreground">在任务、消息和异常菜单旁显示计数。</p>
            </div>
            <Switch id="show-badges" bind:checked={showBadges} />
          </div>
        {:else}
          <div class="space-y-2">
            <Label>{t('settings.sidebarDensity')}</Label>
            <div class="grid gap-3 sm:grid-cols-2">
              {#each ['compact', 'standard'] as option (option)}
                <button
                  class="rounded-lg border p-4 text-left transition-colors {density === option ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground'}"
                  onclick={() => density = option as typeof density}
                >
                  <span class="block text-sm font-semibold">{option === 'compact' ? t('settings.compact') : t('settings.standard')}</span>
                  <span class="mt-1 block text-xs">适合{option === 'compact' ? '高密度后台' : '常规业务系统'}。</span>
                </button>
              {/each}
            </div>
          </div>
        {/if}

        <Separator />
        <div class="flex justify-end">
          <Button onclick={handleSave} disabled={saving}>
            {#if saving}<Loader2 class="h-4 w-4 animate-spin" />{:else}<Save class="h-4 w-4" />{/if}
            {t('common.save')}
          </Button>
        </div>
      </Card.CardContent>
    </Card.Card>
  </div>
</div>
