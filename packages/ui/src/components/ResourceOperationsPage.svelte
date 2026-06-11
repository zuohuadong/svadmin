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
  }: Props = $props();
</script>

<div class="space-y-6" data-svadmin-resource-operations={resourceName}>
  <section class="grid gap-4 xl:grid-cols-[0.82fr_1.18fr]">
    <Card.Root class="rounded-[2rem] border-border/70 bg-card">
      <Card.Content class="p-6 sm:p-8">
        <Badge class="mb-4 rounded-full bg-primary/10 text-primary hover:bg-primary/10">{eyebrow}</Badge>
        <div class="flex items-start gap-4">
          {#if Icon}
            <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-primary/25">
              <Icon class="h-6 w-6" />
            </span>
          {/if}
          <div class="min-w-0">
            <h1 class="text-3xl font-semibold tracking-tight">{title}</h1>
            <p class="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button class="mt-6 rounded-xl" onclick={() => navigate(`/${resourceName}/create`)}>
          {actionLabel}
        </Button>
      </Card.Content>
    </Card.Root>

    <div class="grid gap-4 md:grid-cols-3">
      {#each metrics as metric (metric.label)}
        <Card.Root class="rounded-[2rem] border-border/70 bg-card">
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

  <div class="grid gap-4 xl:grid-cols-[0.76fr_1.24fr]">
    <div class="space-y-4">
      <Card.Root class="rounded-[2rem] border-border/70 bg-card">
        <Card.Header>
          <Card.Title>{tableLabel}</Card.Title>
          {#if tableDescription}
            <Card.Description>{tableDescription}</Card.Description>
          {/if}
        </Card.Header>
        <Card.Content class="space-y-3">
          {#each lanes as lane (lane.label)}
            <div class="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <div class="flex items-center justify-between gap-3">
                <p class="font-medium capitalize">{lane.label}</p>
                <Badge variant="outline">{lane.value}</Badge>
              </div>
              {#if lane.hint}
                <p class="mt-1 text-xs text-muted-foreground">{lane.hint}</p>
              {/if}
            </div>
          {:else}
            <p class="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">{emptyLanesText}</p>
          {/each}
        </Card.Content>
      </Card.Root>

      {#if highlights.length > 0}
        <Card.Root class="rounded-[2rem] border-primary/20 bg-primary/5">
          <Card.Header>
            <Card.Title>{highlightsLabel}</Card.Title>
          </Card.Header>
          <Card.Content class="space-y-3">
            {#each highlights as item (item.title)}
              <div class="rounded-2xl border border-primary/15 bg-background/80 p-4">
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
          </Card.Content>
        </Card.Root>
      {/if}
    </div>

    <AutoTable {resourceName} />
  </div>
</div>
