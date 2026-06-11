<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import * as Card from '../ui/card/index.js';
  import { Button } from '../ui/button/index.js';
  import { Input } from '../ui/input/index.js';
  import { Search, Download } from '@lucide/svelte';

  interface LogEntry {
    id: string;
    event: string;
    eventLabel: string;
    ip: string;
    device: string;
    location: string;
    time: string;
    severity: 'info' | 'warning' | 'critical';
  }

  let searchQuery = $state('');
  let filterSeverity = $state<'all' | 'info' | 'warning' | 'critical'>('all');

  const logs: LogEntry[] = [
    { id: '1', event: 'loginSuccess', eventLabel: t('securityLog.loginSuccess'), ip: '192.168.1.102', device: 'Chrome / macOS', location: 'Shanghai, CN', time: '2 minutes ago', severity: 'info' },
    { id: '2', event: 'apiKeyCreated', eventLabel: t('securityLog.apiKeyCreated'), ip: '192.168.1.102', device: 'Chrome / macOS', location: 'Shanghai, CN', time: '1 hour ago', severity: 'info' },
    { id: '3', event: 'loginFailed', eventLabel: t('securityLog.loginFailed'), ip: '203.0.113.42', device: 'Firefox / Windows', location: 'Unknown', time: '3 hours ago', severity: 'warning' },
    { id: '4', event: 'twoFactorEnabled', eventLabel: t('securityLog.twoFactorEnabled'), ip: '192.168.1.102', device: 'Chrome / macOS', location: 'Shanghai, CN', time: '1 day ago', severity: 'info' },
    { id: '5', event: 'passwordChanged', eventLabel: t('securityLog.passwordChanged'), ip: '192.168.1.102', device: 'Chrome / macOS', location: 'Shanghai, CN', time: '2 days ago', severity: 'info' },
    { id: '6', event: 'loginFailed', eventLabel: t('securityLog.loginFailed'), ip: '198.51.100.77', device: 'Safari / iOS', location: 'Beijing, CN', time: '3 days ago', severity: 'critical' },
    { id: '7', event: 'sessionRevoked', eventLabel: t('securityLog.sessionRevoked'), ip: '192.168.1.105', device: 'Safari / iOS', location: 'Shanghai, CN', time: '5 days ago', severity: 'info' },
    { id: '8', event: 'apiKeyRevoked', eventLabel: t('securityLog.apiKeyRevoked'), ip: '192.168.1.102', device: 'Chrome / macOS', location: 'Shanghai, CN', time: '1 week ago', severity: 'warning' },
  ];

  const filteredLogs = $derived(
    logs.filter(l => {
      if (filterSeverity !== 'all' && l.severity !== filterSeverity) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return l.eventLabel.toLowerCase().includes(q) || l.ip.includes(q) || l.device.toLowerCase().includes(q);
      }
      return true;
    })
  );

</script>

<div class="space-y-6">
  <div class="flex items-start justify-between gap-4">
    <div>
      <h2 class="text-xl font-semibold text-foreground">{t('account.securityLog')}</h2>
      <p class="mt-1 text-sm text-muted-foreground">{t('account.securityLogDescription')}</p>
    </div>
    <Button variant="outline" size="sm">
      <Download class="h-3.5 w-3.5 mr-1" />{t('common.export')}
    </Button>
  </div>

  <!-- Filters -->
  <div class="flex flex-wrap gap-3">
    <div class="relative flex-1 min-w-[200px]">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input placeholder={t('common.search')} bind:value={searchQuery} class="pl-9" />
    </div>
    <div class="flex rounded-lg border border-input overflow-hidden">
      {#each ['all', 'info', 'warning', 'critical'] as sev (sev)}
        <button
          class="px-3 py-1.5 text-xs font-medium transition-colors capitalize
            {filterSeverity === sev ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-accent'}"
          onclick={() => filterSeverity = sev as typeof filterSeverity}
        >{sev === 'all' ? t('common.filter') : sev}</button>
      {/each}
    </div>
  </div>

  <!-- Log table -->
  <Card.Card class="border-border/60">
    <Card.CardContent class="p-0">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{t('securityLog.event')}</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{t('securityLog.ip')}</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{t('securityLog.device')}</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{t('securityLog.location')}</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{t('securityLog.time')}</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            {#each filteredLogs as log (log.id)}
              <tr class="hover:bg-accent/30 transition-colors">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex h-2 w-2 rounded-full {log.severity === 'critical' ? 'bg-red-500' : log.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}"></span>
                    <span class="text-sm text-foreground">{log.eventLabel}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-muted-foreground font-mono">{log.ip}</td>
                <td class="px-4 py-3 text-sm text-muted-foreground">{log.device}</td>
                <td class="px-4 py-3 text-sm text-muted-foreground">{log.location}</td>
                <td class="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{log.time}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </Card.CardContent>
  </Card.Card>
</div>
