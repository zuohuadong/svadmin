<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import { AlertTriangle, Copy, CheckCircle } from 'lucide-svelte';
  import { Button } from './ui/button/index.js';
  import * as Card from './ui/card/index.js';

  let { title = 'Configuration Required', missingVars = [], envTemplate = '' } = $props<{
    title?: string;
    missingVars?: { key: string; description?: string }[];
    envTemplate?: string;
  }>();

  let copied = $state<Record<string, boolean>>({});

  async function copyToClipboard(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      copied = { ...copied, [key]: true };
      setTimeout(() => {
        copied = { ...copied, [key]: false };
      }, 2000);
    } catch {
      console.warn('[svadmin] clipboard API unavailable');
    }
  }

  async function copyAll() {
    const text = envTemplate || missingVars.map((v: { key: string }) => `${v.key}=`).join('\n');
    await copyToClipboard(text, '__all__');
  }
</script>

<div class="config-error-page">
  <div class="config-error-container">
    <Card.Card class="config-error-card">
      <Card.CardHeader class="config-error-header">
        <div class="config-error-icon">
          <AlertTriangle class="h-7 w-7" />
        </div>
        <Card.CardTitle class="text-xl font-bold">{title}</Card.CardTitle>
        <p class="text-sm text-muted-foreground">
          {t('config.missingEnvDescription')}
        </p>
      </Card.CardHeader>
      <Card.CardContent class="space-y-4">
        {#if missingVars.length > 0}
          <div class="env-var-list">
            {#each missingVars as v (v.key)}
              <div class="env-var-row">
                <div class="env-var-info">
                  <code class="env-var-key">{v.key}</code>
                  {#if v.description}
                    <span class="env-var-desc">{v.description}</span>
                  {/if}
                </div>
                <button
                  class="copy-btn"
                  onclick={() => copyToClipboard(`${v.key}=`, v.key)}
                  title="Copy"
                >
                  {#if copied[v.key]}
                    <CheckCircle class="h-3.5 w-3.5 text-green-500" />
                  {:else}
                    <Copy class="h-3.5 w-3.5" />
                  {/if}
                </button>
              </div>
            {/each}
          </div>
        {/if}

        {#if envTemplate}
          <div class="env-template">
            <div class="env-template-header">
              <span class="text-xs font-medium text-muted-foreground">{t('config.envFilePath')}</span>
              <button
                class="copy-btn"
                onclick={copyAll}
              >
                {#if copied['__all__']}
                  <CheckCircle class="h-3.5 w-3.5 text-green-500" />
                  <span class="text-xs">Copied!</span>
                {:else}
                  <Copy class="h-3.5 w-3.5" />
                  <span class="text-xs">Copy All</span>
                {/if}
              </button>
            </div>
            <pre class="env-template-code">{envTemplate}</pre>
          </div>
        {/if}

        <p class="text-xs text-muted-foreground text-center mt-4">
          {t('config.reload')}
        </p>

        <Button variant="outline" class="w-full" onclick={() => window.location.reload()}>
          Reload Page
        </Button>
      </Card.CardContent>
    </Card.Card>
  </div>
</div>

<style>
  .config-error-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, hsl(var(--destructive) / 0.05) 0%, hsl(var(--background)) 50%, hsl(var(--destructive) / 0.03) 100%);
    padding: 1rem;
  }

  .config-error-container {
    width: 100%;
    max-width: 480px;
  }

  :global(.config-error-card) {
    backdrop-filter: blur(20px);
    border: 1px solid hsl(var(--border) / 0.5);
    box-shadow: 0 8px 32px hsl(var(--destructive) / 0.08), 0 2px 8px hsl(0 0% 0% / 0.06);
  }

  :global(.config-error-header) {
    text-align: center;
    padding-bottom: 0.5rem;
  }

  .config-error-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: hsl(var(--destructive) / 0.1);
    color: hsl(var(--destructive));
    margin: 0 auto 0.75rem;
  }

  .env-var-list {
    border: 1px solid hsl(var(--border));
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .env-var-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.625rem 0.75rem;
    border-bottom: 1px solid hsl(var(--border) / 0.5);
    gap: 0.5rem;
  }
  .env-var-row:last-child {
    border-bottom: none;
  }

  .env-var-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  .env-var-key {
    font-size: 0.8125rem;
    font-weight: 600;
    color: hsl(var(--foreground));
    font-family: monospace;
  }

  .env-var-desc {
    font-size: 0.6875rem;
    color: hsl(var(--muted-foreground));
  }

  .copy-btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    color: hsl(var(--muted-foreground));
    border-radius: 0.25rem;
    transition: all 0.15s;
    flex-shrink: 0;
  }
  .copy-btn:hover {
    color: hsl(var(--foreground));
    background: hsl(var(--muted) / 0.5);
  }

  .env-template {
    border: 1px solid hsl(var(--border));
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .env-template-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    background: hsl(var(--muted) / 0.5);
    border-bottom: 1px solid hsl(var(--border) / 0.5);
  }

  .env-template-code {
    padding: 0.75rem;
    font-size: 0.75rem;
    font-family: monospace;
    line-height: 1.6;
    color: hsl(var(--foreground));
    background: hsl(var(--muted) / 0.2);
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
  }
</style>
