<script lang="ts">
  import type { Component, Snippet } from "svelte";
  import { t } from "@svadmin/core/i18n";
  import { navigate } from "@svadmin/core/router";
  import { User, Palette, Info, Shield, FileSearch, Lock, Puzzle, Bell, Key } from "@lucide/svelte";
  import ProfilePage from "./ProfilePage.svelte";
  import AppearanceSettings from "./AppearanceSettings.svelte";
  import AboutSettings from "./AboutSettings.svelte";
  import RolesSettings from "./RolesSettings.svelte";
  import AuditLogViewer from "./AuditLogViewer.svelte";
  import SecuritySettings from "./SecuritySettings.svelte";
  import IntegrationsSettings from "./IntegrationsSettings.svelte";
  import NotificationsSettings from "./NotificationsSettings.svelte";
  import ApiSettings from "./ApiSettings.svelte";
  import { getAuthProvider } from "@svadmin/core";

  const authProvider = getAuthProvider({ optional: true });

  interface SettingsItem {
    key: string;
    path: string;
    icon: Component;
    label: string;
  }

  interface SettingsSection {
    group: string;
    items: SettingsItem[];
  }

  interface Props {
    customSections?: SettingsSection[];
    profile?: Snippet;
    appearance?: Snippet;
    roles?: Snippet;
    security?: Snippet;
    integrations?: Snippet;
    notifications?: Snippet;
    api?: Snippet;
    audit?: Snippet;
    about?: Snippet;
    content?: Snippet<[string]>;
  }

  let {
    customSections,
    profile,
    appearance,
    roles,
    security,
    integrations,
    notifications,
    api,
    audit,
    about,
    content,
  }: Props = $props();

  const defaultSections = [
    {
      group: "settings.general",
      items: [
        { key: "profile", path: "/settings/profile", icon: User, label: "settings.profile" },
        { key: "appearance", path: "/settings/appearance", icon: Palette, label: "settings.appearance" },
        { key: "notifications", path: "/settings/notifications", icon: Bell, label: "settings.notifications" },
      ],
    },
    {
      group: "settings.workspace",
      items: [
        { key: "security", path: "/settings/security", icon: Lock, label: "settings.security" },
        ...(authProvider ? [
          { key: "roles", path: "/settings/roles", icon: Shield, label: "settings.rolesAndPermissions" },
        ] : []),
        { key: "integrations", path: "/settings/integrations", icon: Puzzle, label: "settings.integrations" },
      ],
    },
    {
      group: "settings.developer",
      items: [
        { key: "api", path: "/settings/api", icon: Key, label: "settings.api" },
        ...(authProvider ? [
          { key: "audit", path: "/settings/audit", icon: FileSearch, label: "settings.auditLogs" },
        ] : []),
        { key: "about", path: "/settings/about", icon: Info, label: "settings.about" },
      ],
    },
  ];

  const resolvedSections = $derived(customSections ?? defaultSections);
  const sectionKeys = $derived(new Set(resolvedSections.flatMap((section) => section.items.map((item) => item.key))));

  import { getParams, getRoute } from "../router-state.svelte.js";

  let activeKey = $derived.by(() => {
    const tab = getParams().tab;
    if (!tab) return "profile";
    if (sectionKeys.has(tab)) return tab;
    return content ? tab : "profile";
  });

  // Default redirect to profile
  $effect(() => {
    if (getRoute() === "/settings") {
      navigate("/settings/profile");
    }
  });
</script>

<div class="flex min-h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card/95 shadow-sm shadow-slate-900/[0.03] backdrop-blur lg:flex-row">
  <!-- Left sidebar navigation -->
  <nav class="w-full shrink-0 border-b border-border/70 bg-muted/20 lg:w-64 lg:border-b-0 lg:border-r">
    <!-- Mobile: horizontal scroll tabs -->
    <div class="flex gap-2 overflow-x-auto px-4 py-3 lg:hidden">
      {#each resolvedSections as section, _i (_i)}
        {#each section.items as item, _j (_j)}
          {@const active = activeKey === item.key}
          <button
            class="flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors
              {active ? 'bg-primary/10 text-primary ring-1 ring-primary/15' : 'text-muted-foreground hover:bg-background/70 hover:text-foreground'}"
            onclick={() => navigate(item.path)}
          >
            <item.icon class="h-4 w-4" />
            {t(item.label)}
          </button>
        {/each}
      {/each}
    </div>

    <!-- Desktop: vertical nav with groups -->
    <div class="hidden space-y-6 px-4 py-6 lg:block">
      <div class="rounded-2xl border border-border/60 bg-background/70 p-4">
        <h2 class="text-lg font-semibold tracking-tight text-foreground">{t("settings.title")}</h2>
        <p class="text-xs text-muted-foreground mt-1">{t("settings.settingsDescription")}</p>
      </div>
      {#each resolvedSections as section, _i (_i)}
        <div>
          <h3 class="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">
            {t(section.group)}
          </h3>
          <div class="space-y-1">
            {#each section.items as item, _j (_j)}
              {@const active = activeKey === item.key}
              <button
                class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all
                  {active
                    ? 'bg-primary/10 text-primary font-medium ring-1 ring-primary/15 shadow-sm shadow-primary/10'
                    : 'text-muted-foreground hover:bg-background/75 hover:text-foreground'}"
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
  <div class="flex-1 bg-background/60 p-5 sm:p-6 lg:p-8 {activeKey === 'roles' || activeKey === 'audit' || activeKey === 'integrations' || activeKey === 'api' ? 'max-w-6xl' : 'max-w-3xl'}">
    {#if activeKey === "profile"}
      {#if profile}{@render profile()}{:else}<ProfilePage />{/if}
    {:else if activeKey === "appearance"}
      {#if appearance}{@render appearance()}{:else}<AppearanceSettings />{/if}
    {:else if activeKey === "roles"}
      {#if roles}{@render roles()}{:else}<RolesSettings />{/if}
    {:else if activeKey === "security"}
      {#if security}{@render security()}{:else}<SecuritySettings />{/if}
    {:else if activeKey === "integrations"}
      {#if integrations}{@render integrations()}{:else}<IntegrationsSettings />{/if}
    {:else if activeKey === "notifications"}
      {#if notifications}{@render notifications()}{:else}<NotificationsSettings />{/if}
    {:else if activeKey === "api"}
      {#if api}{@render api()}{:else}<ApiSettings />{/if}
    {:else if activeKey === "audit"}
      {#if audit}{@render audit()}{:else}<AuditLogViewer />{/if}
    {:else if activeKey === "about"}
      {#if about}{@render about()}{:else}<AboutSettings />{/if}
    {:else if content}
      {@render content(activeKey)}
    {/if}
  </div>
</div>
