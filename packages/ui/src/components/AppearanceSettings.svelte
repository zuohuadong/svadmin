<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import { getTheme, setTheme, getResolvedTheme, colorThemes, getColorTheme, setColorTheme, getColorPresets } from '@svadmin/core';
  import { getLocale, setLocale, getAvailableLocales } from '@svadmin/core/i18n';
  import * as Card from './ui/card/index.js';
  import { Button } from './ui/button/index.js';
  import { Sun, Moon, Monitor, Check } from 'lucide-svelte';

  // Theme mode
  const themeOptions = [
    { value: 'light' as const, icon: Sun, label: 'settings.light' },
    { value: 'dark' as const, icon: Moon, label: 'settings.dark' },
    { value: 'system' as const, icon: Monitor, label: 'settings.systemTheme' },
  ];

  let currentTheme = $derived(getTheme());
  let currentColor = $derived(getColorTheme());
  let currentLocale = $derived(getLocale());
  const availableLocales = getAvailableLocales();
  const presets = getColorPresets();

  // Sidebar density
  const DENSITY_KEY = 'svadmin-sidebar-density';
  let density = $state<'compact' | 'standard'>(
    (typeof localStorage !== 'undefined' ? localStorage.getItem(DENSITY_KEY) : null) as 'compact' | 'standard' ?? 'standard'
  );

  function setDensity(d: 'compact' | 'standard') {
    density = d;
    if (typeof localStorage !== 'undefined') localStorage.setItem(DENSITY_KEY, d);
  }

  // Page size
  const PAGE_SIZE_KEY = 'svadmin-default-page-size';
  const pageSizeOptions = [10, 20, 50];
  let pageSize = $state<number>(
    typeof localStorage !== 'undefined' ? parseInt(localStorage.getItem(PAGE_SIZE_KEY) ?? '10', 10) : 10
  );

  function setPageSize(size: number) {
    pageSize = size;
    if (typeof localStorage !== 'undefined') localStorage.setItem(PAGE_SIZE_KEY, String(size));
  }

  // Locale display names
  const localeNames: Record<string, string> = {
    'zh-CN': '中文（简体）',
    'en': 'English',
    'ja': '日本語',
    'ko': '한국어',
  };
</script>

<div class="space-y-6">
  <div>
    <h2 class="text-xl font-semibold text-foreground">{t('settings.appearance')}</h2>
    <p class="text-sm text-muted-foreground mt-1">{t('settings.settingsDescription')}</p>
  </div>

  <!-- Theme Mode -->
  <Card.Card>
    <Card.CardHeader class="pb-3">
      <Card.CardTitle class="text-base">{t('settings.themeMode')}</Card.CardTitle>
    </Card.CardHeader>
    <Card.CardContent>
      <div class="grid grid-cols-3 gap-3">
        {#each themeOptions as opt}
          {@const active = currentTheme === opt.value}
          <button
            class="relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200
              {active
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border hover:border-muted-foreground/30 hover:bg-accent/50'}"
            onclick={() => setTheme(opt.value)}
          >
            {#if active}
              <div class="absolute top-2 right-2">
                <Check class="h-3.5 w-3.5 text-primary" />
              </div>
            {/if}
            <div class="h-10 w-10 rounded-lg flex items-center justify-center
              {active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}">
              <opt.icon class="h-5 w-5" />
            </div>
            <span class="text-xs font-medium {active ? 'text-primary' : 'text-muted-foreground'}">
              {t(opt.label)}
            </span>
          </button>
        {/each}
      </div>
    </Card.CardContent>
  </Card.Card>

  <!-- Color Accent -->
  <Card.Card>
    <Card.CardHeader class="pb-3">
      <Card.CardTitle class="text-base">{t('settings.colorAccent')}</Card.CardTitle>
    </Card.CardHeader>
    <Card.CardContent>
      <div class="flex flex-wrap gap-3">
        {#each presets as preset}
          {@const active = currentColor === preset.name}
          <button
            class="group relative h-9 w-9 rounded-full transition-all duration-200 hover:scale-110
              {active ? 'ring-2 ring-offset-2 ring-offset-background scale-110' : 'opacity-70 hover:opacity-100'}"
            style="background-color: {preset.color}; {active ? `--tw-ring-color: ${preset.color}` : ''}"
            onclick={() => setColorTheme(preset.name as Parameters<typeof setColorTheme>[0])}
            title={preset.label}
          >
            {#if active}
              <Check class="h-4 w-4 text-white absolute inset-0 m-auto drop-shadow-sm" />
            {/if}
          </button>
        {/each}
      </div>
    </Card.CardContent>
  </Card.Card>

  <!-- Interface -->
  <Card.Card>
    <Card.CardHeader class="pb-3">
      <Card.CardTitle class="text-base">{t('settings.interface')}</Card.CardTitle>
    </Card.CardHeader>
    <Card.CardContent class="space-y-5">
      <!-- Language -->
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-foreground">{t('settings.language')}</p>
          <p class="text-xs text-muted-foreground">{localeNames[currentLocale] ?? currentLocale}</p>
        </div>
        <select
          class="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background
            focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          value={currentLocale}
          onchange={(e) => setLocale((e.target as HTMLSelectElement).value)}
        >
          {#each availableLocales as loc}
            <option value={loc}>{localeNames[loc] ?? loc}</option>
          {/each}
        </select>
      </div>

      <div class="h-px bg-border"></div>

      <!-- Sidebar Density -->
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-foreground">{t('settings.sidebarDensity')}</p>
        </div>
        <div class="flex rounded-lg border border-input overflow-hidden">
          <button
            class="px-3 py-1.5 text-xs font-medium transition-colors
              {density === 'compact' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-accent'}"
            onclick={() => setDensity('compact')}
          >{t('settings.compact')}</button>
          <button
            class="px-3 py-1.5 text-xs font-medium transition-colors
              {density === 'standard' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-accent'}"
            onclick={() => setDensity('standard')}
          >{t('settings.standard')}</button>
        </div>
      </div>

      <div class="h-px bg-border"></div>

      <!-- Default Page Size -->
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-foreground">{t('settings.defaultPageSize')}</p>
        </div>
        <div class="flex rounded-lg border border-input overflow-hidden">
          {#each pageSizeOptions as size}
            <button
              class="px-3 py-1.5 text-xs font-mono font-medium transition-colors
                {pageSize === size ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-accent'}"
              onclick={() => setPageSize(size)}
            >{size}</button>
          {/each}
        </div>
      </div>
    </Card.CardContent>
  </Card.Card>
</div>
