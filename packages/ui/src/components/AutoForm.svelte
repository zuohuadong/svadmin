<script lang="ts">
  import { useForm, getResource, deriveValidator } from '@svadmin/core';
  import type { FieldDefinition } from '@svadmin/core';
  import { t } from '@svadmin/core/i18n';
  import { navigate } from '@svadmin/core/router';
  import { Button } from './ui/button/index.js';
  import TooltipButton from './TooltipButton.svelte';
  import * as Card from './ui/card/index.js';
  import { Badge } from './ui/badge/index.js';
  import { Save, ArrowLeft, Loader2, AlertCircle } from '@lucide/svelte';
  import FieldRenderer from './FieldRenderer.svelte';
  import * as Alert from './ui/alert/index.js';
  import { Skeleton } from './ui/skeleton/index.js';
  import ConfirmDialog from './ConfirmDialog.svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    resourceName: string;
    id?: string | number;
    mode?: 'create' | 'edit';
    fieldRenderer?: Snippet<[{ field: FieldDefinition; value: unknown; onchange: (v: unknown) => void }]>;
    formActions?: Snippet<[{ isLoading: boolean; onSubmit: () => void }]>;
    headerContent?: Snippet;
  }

  let { resourceName, id, mode = 'create', fieldRenderer, formActions, headerContent }: Props = $props();

  // ─── Resource metadata ────────────────────────────────────────────
  const resource = $derived(getResource(resourceName));
  const primaryKey = $derived(resource.primaryKey ?? 'id');

  const formFields = $derived(resource.fields.filter(f => {
    if (f.key === primaryKey) return false;
    if (f.showInForm === false) return false;
    if (mode === 'create' && f.showInCreate === false) return false;
    if (mode === 'edit' && f.showInEdit === false) return false;
    return true;
  }));

  const hasGroups = $derived(formFields.some(f => f.group));
  const groups = $derived((() => {
    if (!hasGroups) return [];
    const order: string[] = [];
    const map = new Map<string, FieldDefinition[]>();
    for (const f of formFields) {
      const g = f.group ?? '';
      if (!map.has(g)) { order.push(g); map.set(g, []); }
      map.get(g)!.push(f);
    }
    return order.map(g => ({ name: g, fields: map.get(g)! }));
  })());

  // ─── Default values from field metadata ───────────────────────────
  function getDefaultForType(field: FieldDefinition): unknown {
    switch (field.type) {
      case 'text': case 'textarea': case 'richtext': case 'image': return '';
      case 'number': return 0;
      case 'boolean': return false;
      case 'tags': case 'images': case 'multiselect': return [];
      case 'select': return field.options?.[0]?.value ?? '';
      case 'json': return {};
      default: return '';
    }
  }

  const defaults = $derived((() => {
    const d: Record<string, unknown> = {};
    for (const f of formFields) d[f.key] = f.defaultValue ?? getDefaultForType(f);
    return d;
  })());

  const validator = $derived(deriveValidator(formFields));

  // ─── useForm: single source of truth for values, errors, tainted ──
  const form = useForm({
    get resource() { return resourceName; },
    get action() { return mode; },
    get id() { return id; },
    get defaultValues() { return defaults; },
    redirect: 'list',
    warnWhenUnsavedChanges: true,
    get validate() { return validator; },
  });

  // ─── Submission error (non-field, e.g. network error) ─────────────
  let submitError = $state<string | null>(null);

  async function handleSubmit() {
    submitError = null;
    try {
      await form.submit();
    } catch (e) {
      submitError = e instanceof Error ? e.message : t('common.operationFailed');
    }
  }

  const pageTitle = $derived(
    mode === 'create'
      ? `${t('common.create')}${resource.label}`
      : `${t('common.edit')}${resource.label}`
  );

  // ─── Unsaved changes guard ────────────────────────────────────────
  let confirmOpen = $state(false);
  let pendingNavigation: (() => void) | null = null;

  function guardNavigate(fn: () => void) {
    if (form.isTainted()) {
      pendingNavigation = fn;
      confirmOpen = true;
    } else {
      fn();
    }
  }

  function confirmNavigate() {
    confirmOpen = false;
    pendingNavigation?.();
    pendingNavigation = null;
  }

  function cancelNavigate() {
    confirmOpen = false;
    pendingNavigation = null;
  }
</script>

<div class="space-y-6">
  <div class="flex items-center gap-4">
    <TooltipButton
      tooltip={t('common.back')}
      onclick={() => guardNavigate(() => navigate(`/${resourceName}`))}
    >
      <ArrowLeft class="h-5 w-5" />
    </TooltipButton>
    <h1 class="text-xl font-semibold text-foreground">{pageTitle}</h1>
    {#if form.isTainted()}
      <Badge variant="outline" class="border-warning/30 bg-warning/10 text-warning-foreground">{t('common.unsaved')}</Badge>
    {/if}
  </div>

  {#if form.loading}
    <div class="max-w-3xl space-y-6">
      <div class="rounded-lg shadow-sm ring-1 ring-border/10 p-6 space-y-5">
        {#each Array(4) as _}
          <div class="space-y-2">
            <Skeleton class="h-4 w-24" />
            <Skeleton class="h-10 w-full" />
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <form onsubmit={(e: Event) => { e.preventDefault(); handleSubmit(); }} class="max-w-3xl space-y-6">
      {#if submitError}
        <Alert.Root variant="destructive">
          <AlertCircle class="h-4 w-4" />
          <Alert.Description>{submitError}</Alert.Description>
        </Alert.Root>
      {/if}

      {#if hasGroups}
        {#each groups as group}
          <Card.Root class="border-border/40 shadow-sm">
            {#if group.name}
              <Card.Header>
                <Card.Title class="text-lg">{group.name}</Card.Title>
              </Card.Header>
            {/if}
            <Card.Content class="space-y-5 px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
              {#each group.fields as field (field.key)}
                <div class:border-destructive={!!form.errors[field.key]}>
                  {#if fieldRenderer}
                    {@render fieldRenderer({ field, value: form.values[field.key], onchange: (val: unknown) => form.setFieldValue(field.key, val) })}
                  {:else}
                    <FieldRenderer
                      {field}
                      value={form.values[field.key]}
                      onchange={(val: unknown) => form.setFieldValue(field.key, val)}
                    />
                  {/if}
                  {#if form.errors[field.key]}
                    <p class="text-destructive text-[0.8125rem] mt-1">{form.errors[field.key]}</p>
                  {/if}
                </div>
              {/each}
            </Card.Content>
          </Card.Root>
        {/each}
      {:else}
        <Card.Root class="border-border/40 shadow-sm">
          <Card.Content class="space-y-5 px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
            {#each formFields as field (field.key)}
              <div class:border-destructive={!!form.errors[field.key]}>
                {#if fieldRenderer}
                  {@render fieldRenderer({ field, value: form.values[field.key], onchange: (val: unknown) => form.setFieldValue(field.key, val) })}
                {:else}
                  <FieldRenderer
                    {field}
                    value={form.values[field.key]}
                    onchange={(val: unknown) => form.setFieldValue(field.key, val)}
                  />
                {/if}
                {#if form.errors[field.key]}
                  <p class="text-destructive text-[0.8125rem] mt-1">{form.errors[field.key]}</p>
                {/if}
              </div>
            {/each}
          </Card.Content>
        </Card.Root>
      {/if}

      <div class="flex items-center gap-3">
        {#if formActions}
          {@render formActions({ isLoading: form.submitting, onSubmit: handleSubmit })}
        {:else}
          <Button type="submit" disabled={form.submitting}>
            {#if form.submitting}
              <Loader2 class="h-4 w-4 animate-spin" data-icon="inline-start" />
            {:else}
              <Save class="h-4 w-4" data-icon="inline-start" />
            {/if}
            {t('common.save')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onclick={() => guardNavigate(() => navigate(`/${resourceName}`))}
          >
            {t('common.cancel')}
          </Button>
        {/if}
      </div>
    </form>
  {/if}
</div>

<ConfirmDialog
  open={confirmOpen}
  message={t('common.unsavedChanges')}
  confirmText={t('common.confirm')}
  onconfirm={confirmNavigate}
  oncancel={cancelNavigate}
/>
