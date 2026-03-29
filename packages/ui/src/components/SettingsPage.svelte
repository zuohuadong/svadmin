<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import { navigate } from '@svadmin/core/router';
  import { currentPath } from '@svadmin/core/router';
  import { User, Palette, Info } from 'lucide-svelte';
  import ProfilePage from './ProfilePage.svelte';
  import AppearanceSettings from './AppearanceSettings.svelte';
  import AboutSettings from './AboutSettings.svelte';

  const sections = [
    {
      group: 'settings.general',
      items: [
        { key: 'profile', path: '/settings/profile', icon: User, label: 'settings.profile' },
        { key: 'appearance', path: '/settings/appearance', icon: Palette, label: 'settings.appearance' },
      ],
    },
    {
      group: 'settings.system',
      items: [
        { key: 'about', path: '/settings/about', icon: Info, label: 'settings.about' },
      ],
    },
  ];

  let activeKey = $derived.by(() => {
    const path = currentPath();
    if (path.includes('/settings/appearance')) return 'appearance';
    if (path.includes('/settings/about')) return 'about';
    return 'profile';
  });

  // Default redirect to profile
  $effect(() => {
    const path = currentPath();
    if (path === '/settings') {
      navigate('/settings/profile');
    }
  });
</script>

<div class="flex flex-col lg:flex-row gap-0 min-h-full">
  <!-- Left sidebar navigation -->
  <nav class="w-full lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-muted/30">
    <!-- Mobile: horizontal scroll tabs -->
    <div class="flex lg:hidden overflow-x-auto px-4 py-2 gap-1">
      {#each sections as section}
        {#each section.items as item}
          {@const active = activeKey === item.key}
          <button
            class="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors
              {active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}"
            onclick={() => navigate(item.path)}
          >
            <item.icon class="h-4 w-4" />
            {t(item.label)}
          </button>
        {/each}
      {/each}
    </div>

    <!-- Desktop: vertical nav with groups -->
    <div class="hidden lg:block py-6 px-3 space-y-6">
      <div class="px-3">
        <h2 class="text-lg font-semibold text-foreground">{t('settings.title')}</h2>
        <p class="text-xs text-muted-foreground mt-1">{t('settings.settingsDescription')}</p>
      </div>
      {#each sections as section}
        <div>
          <h3 class="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            {t(section.group)}
          </h3>
          <div class="space-y-0.5">
            {#each section.items as item}
              {@const active = activeKey === item.key}
              <button
                class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all
                  {active
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}"
                onclick={() => navigate(item.path)}
              >
                <item.icon class="h-4 w-4 shrink-0" />
                {t(item.label)}
              </button>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </nav>

  <!-- Right content area -->
  <div class="flex-1 p-6 lg:p-8 max-w-3xl">
    {#if activeKey === 'profile'}
      <ProfilePage />
    {:else if activeKey === 'appearance'}
      <AppearanceSettings />
    {:else if activeKey === 'about'}
      <AboutSettings />
    {/if}
  </div>
</div>
