<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import * as Card from '../ui/card/index.js';
  import { Badge } from '../ui/badge/index.js';
  import { Button } from '../ui/button/index.js';
  import { Input } from '../ui/input/index.js';
  import { AlertTriangle, ChevronDown, Copy, Download, Search, ShieldCheck } from '@lucide/svelte';

  interface LogEntry {
    id: string;
    event: string;
    eventLabel: string;
    ip: string;
    device: string;
    location: string;
    time: string;
    severity: 'info' | 'warning' | 'critical';
    actor: string;
    requestId: string;
    details: string;
  }

  let searchQuery = $state('');
  let filterSeverity = $state<'all' | LogEntry['severity']>('all');
  let expandedId = $state<string | null>(null);
  let copiedId = $state<string | null>(null);

  const logs: LogEntry[] = [
    { id: '1', event: 'loginSuccess', eventLabel: t('securityLog.loginSuccess'), ip: '192.168.1.102', device: 'Chrome / macOS', location: 'Shanghai, CN', time: '2 minutes ago', severity: 'info', actor: 'alex@example.com', requestId: 'req_9p7f3a', details: 'Password and session posture accepted.' },
    { id: '2', event: 'apiKeyCreated', eventLabel: t('securityLog.apiKeyCreated'), ip: '192.168.1.102', device: 'Chrome / macOS', location: 'Shanghai, CN', time: '1 hour ago', severity: 'info', actor: 'alex@example.com', requestId: 'req_8m2c1e', details: 'New reporting key scoped to read-only analytics resources.' },
    { id: '3', event: 'loginFailed', eventLabel: t('securityLog.loginFailed'), ip: '203.0.113.42', device: 'Firefox / Windows', location: 'Unknown', time: '3 hours ago', severity: 'warning', actor: 'unknown', requestId: 'req_4f7d2b', details: 'Failed password attempt from unknown ASN. Temporary lock threshold not reached.' },
    { id: '4', event: 'twoFactorEnabled', eventLabel: t('securityLog.twoFactorEnabled'), ip: '192.168.1.102', device: 'Chrome / macOS', location: 'Shanghai, CN', time: '1 day ago', severity: 'info', actor: 'alex@example.com', requestId: 'req_2v9a4q', details: 'TOTP authenticator registered and recovery codes generated.' },
    { id: '5', event: 'passwordChanged', eventLabel: t('securityLog.passwordChanged'), ip: '192.168.1.102', device: 'Chrome / macOS', location: 'Shanghai, CN', time: '2 days ago', severity: 'info', actor: 'alex@example.com', requestId: 'req_7k1s8x', details: 'Password was changed after current credential verification.' },
    { id: '6', event: 'loginFailed', eventLabel: t('securityLog.loginFailed'), ip: '198.51.100.77', device: 'Safari / iOS', location: 'Beijing, CN', time: '3 days ago', severity: 'critical', actor: 'unknown', requestId: 'req_5q8n6m', details: 'Repeated failed login attempts with mismatched device fingerprint. Session blocked.' },
    { id: '7', event: 'sessionRevoked', eventLabel: t('securityLog.sessionRevoked'), ip: '192.168.1.105', device: 'Safari / iOS', location: 'Shanghai, CN', time: '5 days ago', severity: 'info', actor: 'alex@example.com', requestId: 'req_1d8x0n', details: 'Mobile session revoked from the account security panel.' },
    { id: '8', event: 'apiKeyRevoked', eventLabel: t('securityLog.apiKeyRevoked'), ip: '192.168.1.102', device: 'Chrome / macOS', location: 'Shanghai, CN', time: '1 week ago', severity: 'warning', actor: 'alex@example.com', requestId: 'req_3h6c9t', details: 'Expired deployment key revoked after no activity for 90 days.' },
  ];

  const filteredLogs = $derived.by(() => {
    const query = searchQuery.trim().toLowerCase();
    return logs.filter((log) => {
      if (filterSeverity !== 'all' && log.severity !== filterSeverity) return false;
      if (!query) return true;
      return log.eventLabel.toLowerCase().includes(query)
        || log.ip.includes(query)
        || log.device.toLowerCase().includes(query)
        || log.actor.toLowerCase().includes(query)
        || log.requestId.toLowerCase().includes(query);
    });
  });

  const criticalCount = $derived(logs.filter((log) => log.severity === 'critical').length);
  const warningCount = $derived(logs.filter((log) => log.severity === 'warning').length);

  const severityConfig = {
    info: { dot: 'bg-blue-500', badge: 'bg-blue-500/10 text-blue-700 border-blue-500/20', icon: ShieldCheck },
    warning: { dot: 'bg-amber-500', badge: 'bg-amber-500/10 text-amber-700 border-amber-500/20', icon: AlertTriangle },
    critical: { dot: 'bg-red-500', badge: 'bg-red-500/10 text-red-700 border-red-500/20', icon: AlertTriangle },
  };

  function copyRequestId(id: string) {
    copiedId = id;
    setTimeout(() => {
      if (copiedId === id) copiedId = null;
    }, 1400);
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
    <div>
      <h2 class="text-xl font-semibold text-foreground">{t('account.securityLog')}</h2>
      <p class="mt-1 text-sm text-muted-foreground">{t('account.securityLogDescription')}</p>
    </div>
    <Button variant="outline" size="sm">
      <Download class="h-3.5 w-3.5" />
      {t('common.export')}
    </Button>
  </div>

  <div class="grid gap-3 sm:grid-cols-3">
    <div class="rounded-lg border border-border/70 bg-card p-4">
      <div class="text-2xl font-semibold text-foreground">{logs.length}</div>
      <div class="text-xs text-muted-foreground">审计事件</div>
    </div>
    <div class="rounded-lg border border-border/70 bg-card p-4">
      <div class="text-2xl font-semibold text-foreground">{warningCount}</div>
      <div class="text-xs text-muted-foreground">需要复核</div>
    </div>
    <div class="rounded-lg border border-border/70 bg-card p-4">
      <div class="text-2xl font-semibold text-foreground">{criticalCount}</div>
      <div class="text-xs text-muted-foreground">高风险拦截</div>
    </div>
  </div>

  <div class="flex flex-col gap-2 lg:flex-row lg:items-center">
    <div class="relative min-w-64 flex-1">
      <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input placeholder={t('common.search')} bind:value={searchQuery} class="pl-9" />
    </div>
    <div class="flex overflow-hidden rounded-lg border border-border bg-background">
      {#each ['all', 'info', 'warning', 'critical'] as severity (severity)}
        <button
          class="h-9 px-3 text-xs font-medium capitalize transition-colors {filterSeverity === severity ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}"
          onclick={() => filterSeverity = severity as typeof filterSeverity}
        >
          {severity === 'all' ? t('common.filter') : severity}
        </button>
      {/each}
    </div>
  </div>

  <Card.Card class="border-border/70 bg-card">
    <Card.CardContent class="p-0">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{t('securityLog.event')}</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Actor</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{t('securityLog.ip')}</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{t('securityLog.device')}</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{t('securityLog.time')}</th>
              <th class="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/70">
            {#each filteredLogs as log (log.id)}
              {@const severity = severityConfig[log.severity]}
              {@const Icon = severity.icon}
              <tr class="transition-colors hover:bg-accent/30">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex h-2 w-2 rounded-full {severity.dot}"></span>
                    <span class="text-sm text-foreground">{log.eventLabel}</span>
                    <Badge variant="outline" class="text-[10px] capitalize {severity.badge}">
                      <Icon class="h-3 w-3" />
                      {log.severity}
                    </Badge>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-muted-foreground">{log.actor}</td>
                <td class="px-4 py-3 font-mono text-sm text-muted-foreground">{log.ip}</td>
                <td class="px-4 py-3 text-sm text-muted-foreground">{log.device}</td>
                <td class="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">{log.time}</td>
                <td class="px-4 py-3">
                  <Button variant="ghost" size="icon-sm" onclick={() => expandedId = expandedId === log.id ? null : log.id} aria-label="Toggle details">
                    <ChevronDown class="h-4 w-4 transition-transform {expandedId === log.id ? 'rotate-180' : ''}" />
                  </Button>
                </td>
              </tr>
              {#if expandedId === log.id}
                <tr>
                  <td colspan="6" class="bg-muted/20 px-4 py-4">
                    <div class="grid gap-3 rounded-lg border border-border/60 bg-background p-4 lg:grid-cols-[1fr_auto]">
                      <div class="space-y-2">
                        <p class="text-sm text-foreground">{log.details}</p>
                        <div class="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span>{t('securityLog.location')}: {log.location}</span>
                          <span>Request: <code class="rounded bg-muted px-1 py-0.5">{log.requestId}</code></span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onclick={() => copyRequestId(log.id)}>
                        <Copy class="h-3.5 w-3.5" />
                        {copiedId === log.id ? t('common.copied') : t('common.copyId')}
                      </Button>
                    </div>
                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      </div>
    </Card.CardContent>
  </Card.Card>
</div>
