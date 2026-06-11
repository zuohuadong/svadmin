<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import { AlertCircle, Cloud, FolderGit, MessageCircle, Plug } from '@lucide/svelte';
  import type { Component } from 'svelte';
  import * as Card from './ui/card/index.js';
  import { Switch } from './ui/switch/index.js';

  interface Integration {
    id: string;
    name: string;
    description: string;
    connected: boolean;
    Icon: Component;
    tone: string;
    category: 'ops' | 'identity' | 'developer';
    lastSync: string;
  }

  let integrations = $state<Integration[]>([
    { id: 'source-control', name: 'Source Control', description: 'Sync repository metadata, deployments, and commit activity.', connected: true, Icon: FolderGit, tone: 'bg-zinc-900 text-white', category: 'developer', lastSync: '5 min ago' },
    { id: 'chatops', name: 'ChatOps', description: 'Send operational alerts and audit summaries to workspace channels.', connected: false, Icon: MessageCircle, tone: 'bg-sky-700 text-white', category: 'ops', lastSync: 'Not connected' },
    { id: 'identity-cloud', name: 'Identity Cloud', description: 'Configure SSO and workspace identity handoff.', connected: true, Icon: Cloud, tone: 'bg-blue-600 text-white', category: 'identity', lastSync: '1 hour ago' },
    { id: 'webhooks', name: 'Webhooks', description: 'Register outbound webhooks for internal tools and monitors.', connected: false, Icon: Plug, tone: 'bg-emerald-700 text-white', category: 'developer', lastSync: 'Not connected' },
  ]);
  let categoryFilter = $state<'all' | Integration['category']>('all');
  let selectedIntegrationId = $state('source-control');

  const filteredIntegrations = $derived(categoryFilter === 'all' ? integrations : integrations.filter((item) => item.category === categoryFilter));
  const selectedIntegration = $derived(integrations.find((item) => item.id === selectedIntegrationId) ?? integrations[0]);

  function toggleConnection(id: string, connected: boolean) {
    integrations = integrations.map((item) => (item.id === id ? { ...item, connected } : item));
  }
</script>

<div class="space-y-6">
  <div>
    <h2 class="text-xl font-semibold text-foreground">{t('settings.integrations')}</h2>
    <p class="mt-1 text-sm text-muted-foreground">{t('settings.integrationsDescription')}</p>
  </div>

  <div class="flex overflow-hidden rounded-lg border border-border bg-background">
    {#each [{ id: 'all', label: '全部' }, { id: 'ops', label: '运营' }, { id: 'identity', label: '身份' }, { id: 'developer', label: '开发' }] as option (option.id)}
      <button
        class="h-9 px-3 text-xs font-medium transition-colors {categoryFilter === option.id ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}"
        onclick={() => categoryFilter = option.id as typeof categoryFilter}
      >
        {option.label}
      </button>
    {/each}
  </div>

  <div class="grid gap-4 lg:grid-cols-[1fr_20rem]">
  <div class="grid gap-4">
    {#each filteredIntegrations as integration (integration.id)}
      <Card.Card>
        <Card.CardContent class="p-5">
          <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <button class="flex flex-1 items-start gap-4 text-left" onclick={() => selectedIntegrationId = integration.id}>
              <div class="shrink-0 rounded-lg p-3 {integration.tone}">
                <integration.Icon class="h-5 w-5" />
              </div>
              <div class="space-y-1">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="font-semibold text-foreground">{integration.name}</span>
                  <span class="rounded-full px-2 py-0.5 text-[10px] font-semibold {integration.connected ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}">
                    {integration.connected ? t('integrations.statusConnected') : t('integrations.statusDisconnected')}
                  </span>
                </div>
                <p class="text-sm text-muted-foreground">{integration.description}</p>
                <p class="text-xs text-muted-foreground">Last sync: {integration.lastSync}</p>
              </div>
            </button>
            <div class="flex items-center gap-3">
              <span class="text-xs text-muted-foreground">{integration.connected ? t('integrations.enabled') : t('integrations.disabled')}</span>
              <Switch checked={integration.connected} onCheckedChange={(checked) => toggleConnection(integration.id, checked)} />
            </div>
          </div>
        </Card.CardContent>
      </Card.Card>
    {/each}
  </div>

  <Card.Card class="border-border/70 bg-card">
    <Card.CardHeader>
      <Card.CardTitle class="text-base">{selectedIntegration.name}</Card.CardTitle>
      <Card.CardDescription>{selectedIntegration.description}</Card.CardDescription>
    </Card.CardHeader>
    <Card.CardContent class="space-y-3">
      <div class="rounded-lg border border-border/60 bg-muted/20 p-3">
        <p class="text-xs text-muted-foreground">Category</p>
        <p class="text-sm font-medium capitalize text-foreground">{selectedIntegration.category}</p>
      </div>
      <div class="rounded-lg border border-border/60 bg-muted/20 p-3">
        <p class="text-xs text-muted-foreground">Last sync</p>
        <p class="text-sm font-medium text-foreground">{selectedIntegration.lastSync}</p>
      </div>
    </Card.CardContent>
  </Card.Card>
  </div>

  <Card.Card class="border-dashed bg-muted/20">
    <Card.CardContent class="flex items-center gap-3 p-5 text-sm text-muted-foreground">
      <AlertCircle class="h-4 w-4 shrink-0" />
      <span>{t('integrations.addMoreHint')}</span>
    </Card.CardContent>
  </Card.Card>
</div>
