<script lang="ts">
  import type { Component, Snippet } from "svelte";
  import { t } from "@svadmin/core/i18n";
  import { navigate } from "@svadmin/core/router";
  import { User, Info, FileSearch, Lock, Puzzle } from "@lucide/svelte";
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
        { key: "account", path: "/settings/account", icon: User, label: "settings.accountPreferences" },
      ],
    },
    {
      group: "settings.workspace",
      items: [
        { key: "access", path: "/settings/access", icon: Lock, label: "settings.accessSecurity" },
        { key: "developer", path: "/settings/developer", icon: Puzzle, label: "settings.integrationApi" },
      ],
    },
    {
      group: "settings.developer",
      items: [
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

  function normalizeKey(tab: string | undefined): string {
    if (!tab) return "account";
    if (["profile", "appearance", "notifications"].includes(tab)) return "account";
    if (["security", "roles"].includes(tab)) return "access";
    if (["integrations", "api"].includes(tab)) return "developer";
    return tab;
  }

  function pathForKey(key: string): string {
    return `/settings/${key}`;
  }

  let activeKey = $derived.by(() => {
    const tab = getParams().tab;
    const normalized = normalizeKey(tab);
    if (sectionKeys.has(normalized)) return normalized;
    return content ? normalized : "account";
  });

  $effect(() => {
    if (getRoute() === "/settings") {
      navigate("/settings/account");
      return;
    }

    const tab = getParams().tab;
    const normalized = normalizeKey(tab);
    if (tab && tab !== normalized && sectionKeys.has(normalized)) {
      navigate(pathForKey(normalized));
    }
  });
</script>

<div class="min-h-full max-w-6xl">
  <div class="mb-6 border-b border-border/70 pb-4">
    <div class="min-w-0">
      <h2 class="text-2xl font-semibold tracking-tight text-foreground">{t("settings.title")}</h2>
      <p class="mt-1 text-sm text-muted-foreground">{t("settings.settingsDescription")}</p>
    </div>
  </div>

  <div class="{activeKey === 'access' || activeKey === 'audit' || activeKey === 'developer' ? 'max-w-6xl' : 'max-w-3xl'} space-y-6">
    {#if activeKey === "account"}
      {#if profile}{@render profile()}{:else}<ProfilePage />{/if}
      {#if appearance}{@render appearance()}{:else}<AppearanceSettings />{/if}
      {#if notifications}{@render notifications()}{:else}<NotificationsSettings />{/if}
    {:else if activeKey === "access"}
      {#if security}{@render security()}{:else}<SecuritySettings />{/if}
      {#if authProvider}
        {#if roles}{@render roles()}{:else}<RolesSettings />{/if}
      {/if}
    {:else if activeKey === "developer"}
      {#if integrations}{@render integrations()}{:else}<IntegrationsSettings />{/if}
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
