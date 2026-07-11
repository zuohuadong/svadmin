<script lang="ts">
  import { useTranslation } from '@svadmin/core/i18n';

  import { AlertCircle, Cloud, FolderGit, MessageCircle, Plug } from '@lucide/svelte';
  import type { Component } from 'svelte';
  import * as Card from './ui/card/index.js';
  import { Switch } from './ui/switch/index.js';

  const i18n = useTranslation();

  interface Integration {
    id: string;
    name: string;
    description: string;
    connected: boolean;
    Icon: Component;
    tone: string;
  }

  let integrations = $state<Integration[]>([
    { id: 'source-control', name: 'Source Control', description: 'Sync repository metadata, deployments, and commit activity.', connected: true, Icon: FolderGit, tone: 'bg-zinc-900 text-white' },
    { id: 'chatops', name: 'ChatOps', description: 'Send operational alerts and audit summaries to workspace channels.', connected: false, Icon: MessageCircle, tone: 'bg-violet-700 text-white' },
    { id: 'identity-cloud', name: 'Identity Cloud', description: 'Configure SSO and workspace identity handoff.', connected: true, Icon: Cloud, tone: 'bg-blue-600 text-white' },
    { id: 'webhooks', name: 'Webhooks', description: 'Register outbound webhooks for internal tools and monitors.', connected: false, Icon: Plug, tone: 'bg-emerald-700 text-white' },
  ]);

  function toggleConnection(id: string, connected: boolean) {
    integrations = integrations.map((item) => (item.id === id ? { ...item, connected } : item));
  }
</script>

<div class="space-y-6">
  <div>
    <h2 class="text-xl font-semibold text-foreground">{i18n.t('settings.integrations')}</h2>
    <p class="mt-1 text-sm text-muted-foreground">{i18n.t('settings.integrationsDescription')}</p>
  </div>

  <div class="grid gap-4">
    {#each integrations as integration (integration.id)}
      <Card.Card>
        <Card.CardContent class="p-5">
          <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div class="flex items-start gap-4">
              <div class="shrink-0 rounded-lg p-3 {integration.tone}">
                <integration.Icon class="h-5 w-5" />
              </div>
              <div class="space-y-1">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="font-semibold text-foreground">{integration.name}</span>
                  <span class="rounded-full px-2 py-0.5 text-[10px] font-semibold {integration.connected ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}">
                    {integration.connected ? i18n.t('integrations.statusConnected') : i18n.t('integrations.statusDisconnected')}
                  </span>
                </div>
                <p class="text-sm text-muted-foreground">{integration.description}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs text-muted-foreground">{integration.connected ? i18n.t('integrations.enabled') : i18n.t('integrations.disabled')}</span>
              <Switch checked={integration.connected} onCheckedChange={(checked) => toggleConnection(integration.id, checked)} />
            </div>
          </div>
        </Card.CardContent>
      </Card.Card>
    {/each}
  </div>

  <Card.Card class="border-dashed bg-muted/20">
    <Card.CardContent class="flex items-center gap-3 p-5 text-sm text-muted-foreground">
      <AlertCircle class="h-4 w-4 shrink-0" />
      <span>{i18n.t('integrations.addMoreHint')}</span>
    </Card.CardContent>
  </Card.Card>
</div>
