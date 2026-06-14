<script lang="ts">
  import { navigate } from '@svadmin/core/router';
  import type { Component } from 'svelte';
  import AutoTable from './AutoTable.svelte';
  import { Badge } from './ui/badge/index.js';
  import { Button } from './ui/button/index.js';
  import * as Card from './ui/card/index.js';

  interface SummaryMetric {
    label: string;
    value: string | number;
    hint?: string;
  }

  interface StatusLane {
    label: string;
    value: string | number;
    hint?: string;
  }

  interface HighlightItem {
    title: string;
    description?: string;
    meta?: string;
    badge?: string;
  }

  type WorkspaceStyle =
    | 'inventory'
    | 'operations'
    | 'people'
    | 'calendar'
    | 'communications'
    | 'crm'
    | 'property'
    | 'ai'
    | 'store';

  interface Props {
    resourceName: string;
    eyebrow: string;
    title: string;
    description: string;
    actionLabel: string;
    icon?: Component<{ class?: string }>;
    metrics?: SummaryMetric[];
    lanes?: StatusLane[];
    highlights?: HighlightItem[];
    tableLabel?: string;
    tableDescription?: string;
    emptyLanesText?: string;
    highlightsLabel?: string;
    workspaceStyle?: WorkspaceStyle;
  }

  let {
    resourceName,
    eyebrow,
    title,
    description,
    actionLabel,
    icon: Icon,
    metrics = [],
    lanes = [],
    highlights = [],
    tableLabel = 'Records',
    tableDescription,
    emptyLanesText = 'No grouped records yet.',
    highlightsLabel = 'Focus queue',
    workspaceStyle = 'operations',
  }: Props = $props();
</script>

<div class="space-y-6" data-svadmin-resource-operations={resourceName} data-svadmin-workspace-style={workspaceStyle}>
  <section class="space-y-5 border-b border-border/60 pb-5" data-svadmin-ops-hero>
    <div class="min-w-0 py-1">
        <Badge>{eyebrow}</Badge>
        <div class="flex items-start gap-4">
          {#if Icon}
            <span class="flex h-10 w-10 shrink-0 items-center justify-center text-primary">
              <Icon class="h-6 w-6" />
            </span>
          {/if}
          <div class="min-w-0">
            <h1 class="text-3xl font-semibold tracking-tight">{title}</h1>
            <p class="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button class="mt-6" onclick={() => navigate(`/${resourceName}/create`)}>
          {actionLabel}
        </Button>
    </div>

    <div class="grid min-w-0 gap-4 md:grid-cols-3">
      {#each metrics as metric (metric.label)}
        <Card.Root data-svadmin-metric-card>
          <Card.Content class="p-5">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{metric.label}</p>
            <p class="mt-2 text-3xl font-semibold">{metric.value}</p>
            {#if metric.hint}
              <p class="mt-1 text-xs text-muted-foreground">{metric.hint}</p>
            {/if}
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  </section>

  <div class="grid min-w-0 gap-4">
    <div class="grid min-w-0 gap-4 {workspaceStyle !== 'ai' && workspaceStyle !== 'communications' ? 'xl:grid-cols-2' : ''}">
      <Card.Root data-svadmin-panel-card>
        <Card.Header>
          <Card.Title>{tableLabel}</Card.Title>
          {#if tableDescription}
            <Card.Description>{tableDescription}</Card.Description>
          {/if}
        </Card.Header>
        <Card.Content class="space-y-3">
          {#each lanes as lane (lane.label)}
            <div class="py-3">
              <div class="flex items-center justify-between gap-3">
                <p class="font-medium capitalize">{lane.label}</p>
                <Badge variant="outline">{lane.value}</Badge>
              </div>
              {#if lane.hint}
                <p class="mt-1 text-xs text-muted-foreground">{lane.hint}</p>
              {/if}
            </div>
          {:else}
            <p class="py-3 text-sm text-muted-foreground">{emptyLanesText}</p>
          {/each}
        </Card.Content>
      </Card.Root>

      {#if highlights.length > 0}
        <Card.Root data-svadmin-panel-card data-svadmin-workbench={workspaceStyle}>
          <Card.Header>
            <Card.Title>{highlightsLabel}</Card.Title>
          </Card.Header>
          <Card.Content>
            {#if workspaceStyle === 'ai'}
              <div class="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
                <div class="space-y-2">
                  {#each lanes as lane (lane.label)}
                    <div class="rounded-lg border bg-muted/30 px-3 py-2">
                      <div class="flex items-center justify-between gap-3">
                        <span class="text-sm font-medium">{lane.label}</span>
                        <Badge variant="outline">{lane.value}</Badge>
                      </div>
                      {#if lane.hint}
                        <p class="mt-1 text-xs text-muted-foreground">{lane.hint}</p>
                      {/if}
                    </div>
                  {/each}
                </div>
                <div class="space-y-3">
                  {#each highlights as item (item.title)}
                    <div class="rounded-2xl rounded-tl-sm border bg-card px-4 py-3">
                      <div class="flex items-center justify-between gap-3">
                        <p class="font-medium">{item.title}</p>
                        {#if item.badge}
                          <Badge>{item.badge}</Badge>
                        {/if}
                      </div>
                      {#if item.description}
                        <p class="mt-2 text-sm text-muted-foreground">{item.description}</p>
                      {/if}
                      {#if item.meta}
                        <p class="mt-2 text-xs font-medium text-primary">{item.meta}</p>
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>
            {:else if workspaceStyle === 'communications'}
              <div class="grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
                <div class="space-y-2">
                  {#each lanes as lane (lane.label)}
                    <div class="flex items-center justify-between rounded-lg border bg-muted/25 px-3 py-2">
                      <div>
                        <p class="text-sm font-medium">{lane.label}</p>
                        {#if lane.hint}
                          <p class="text-xs text-muted-foreground">{lane.hint}</p>
                        {/if}
                      </div>
                      <Badge variant="outline">{lane.value}</Badge>
                    </div>
                  {/each}
                </div>
                <div class="divide-y rounded-lg border">
                  {#each highlights as item (item.title)}
                    <div class="px-4 py-3">
                      <div class="flex items-center justify-between gap-3">
                        <p class="font-medium">{item.title}</p>
                        {#if item.badge}
                          <Badge>{item.badge}</Badge>
                        {/if}
                      </div>
                      {#if item.description}
                        <p class="mt-1 text-xs text-muted-foreground">{item.description}</p>
                      {/if}
                      {#if item.meta}
                        <p class="mt-2 text-xs font-medium text-primary">{item.meta}</p>
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>
            {:else if workspaceStyle === 'crm'}
              <div class="grid gap-3 md:grid-cols-3">
                {#each lanes as lane (lane.label)}
                  <div class="rounded-lg border bg-muted/25 p-3">
                    <div class="flex items-center justify-between gap-3">
                      <p class="text-sm font-semibold">{lane.label}</p>
                      <Badge variant="outline">{lane.value}</Badge>
                    </div>
                    {#if lane.hint}
                      <p class="mt-2 text-xs text-muted-foreground">{lane.hint}</p>
                    {/if}
                  </div>
                {/each}
              </div>
              <div class="mt-4 grid gap-3">
                {#each highlights as item (item.title)}
                  <div class="rounded-lg border-l-4 border-l-primary bg-muted/20 px-4 py-3">
                    <div class="flex items-center justify-between gap-3">
                      <p class="font-medium">{item.title}</p>
                      {#if item.badge}
                        <Badge>{item.badge}</Badge>
                      {/if}
                    </div>
                    {#if item.description}
                      <p class="mt-1 text-xs text-muted-foreground">{item.description}</p>
                    {/if}
                    {#if item.meta}
                      <p class="mt-2 text-xs font-medium text-primary">{item.meta}</p>
                    {/if}
                  </div>
                {/each}
              </div>
            {:else if workspaceStyle === 'property' || workspaceStyle === 'store'}
              <div class="grid gap-3 md:grid-cols-2">
                {#each highlights as item (item.title)}
                  <div class="rounded-xl border bg-gradient-to-br from-muted/45 to-background p-4">
                    <div class="flex items-center justify-between gap-3">
                      <p class="font-medium">{item.title}</p>
                      {#if item.badge}
                        <Badge>{item.badge}</Badge>
                      {/if}
                    </div>
                    {#if item.description}
                      <p class="mt-2 text-sm text-muted-foreground">{item.description}</p>
                    {/if}
                    {#if item.meta}
                      <p class="mt-3 text-xs font-semibold text-primary">{item.meta}</p>
                    {/if}
                  </div>
                {/each}
                {#each lanes as lane (lane.label)}
                  <div class="rounded-xl border bg-card p-4">
                    <div class="flex items-center justify-between gap-3">
                      <p class="font-medium">{lane.label}</p>
                      <Badge variant="outline">{lane.value}</Badge>
                    </div>
                    {#if lane.hint}
                      <p class="mt-2 text-xs text-muted-foreground">{lane.hint}</p>
                    {/if}
                  </div>
                {/each}
              </div>
            {:else}
              <div class="space-y-3">
                {#each highlights as item (item.title)}
                  <div class="py-3">
                    <div class="flex items-center justify-between gap-3">
                      <p class="font-medium">{item.title}</p>
                      {#if item.badge}
                        <Badge>{item.badge}</Badge>
                      {/if}
                    </div>
                    {#if item.description}
                      <p class="mt-1 text-xs text-muted-foreground">{item.description}</p>
                    {/if}
                    {#if item.meta}
                      <p class="mt-2 text-xs font-medium text-primary">{item.meta}</p>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          </Card.Content>
        </Card.Root>
      {/if}
    </div>

    <AutoTable {resourceName} />
  </div>
</div>
