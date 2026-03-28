<script lang="ts">
  import { useOne, useCreate, useUpdate, getResource } from '@svadmin/core';
  import type { FieldDefinition } from '@svadmin/core';
  import { navigate } from '@svadmin/core/router';
  import { canAccess } from '@svadmin/core/permissions';
  import { t } from '@svadmin/core/i18n';
  import { Button } from './ui/button/index.js';
  import TooltipButton from './TooltipButton.svelte';
  import * as Card from './ui/card/index.js';
  import { Badge } from './ui/badge/index.js';
  import { Save, ArrowLeft, Loader2, AlertCircle } from 'lucide-svelte';
  import FieldRenderer from './FieldRenderer.svelte';
  import * as Alert from './ui/alert/index.js';
  import { Skeleton } from './ui/skeleton/index.js';
  import ConfirmDialog from './ConfirmDialog.svelte';

  import type { Snippet } from 'svelte';

  interface Props {
    resourceName: string;
    id?: string | number;
    mode?: 'create' | 'edit';
    /** Custom field renderer — overrides default FieldRenderer */
    fieldRenderer?: Snippet<[{ field: FieldDefinition; value: unknown; onchange: (v: unknown) => void }]>;
    /** Custom form action buttons */
    formActions?: Snippet<[{ isLoading: boolean; onSubmit: () => void }]>;
    /** Custom header content (after title) */
    headerContent?: Snippet;
  }

  let {
    resourceName,
    id = undefined,
    mode = 'create',
    fieldRenderer,
    formActions,
    headerContent,
  }: Props = $props();

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

  // Load existing data for edit mode
  const existingQuery = $derived.by(() => mode === 'edit' && id != null
    ? useOne({ get resource() { return resourceName; }, get id() { return id; } })
    : null);

  // Form state
  let formData = $state<Record<string, unknown>>({});
  let fieldErrors = $state<Record<string, string>>({});
  let submitting = $state(false);
  let error = $state<string | null>(null);
  let initialized = $state(false);
  let isDirty = $state(false);

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

  // Initialize form data (pre-DOM to avoid flash of empty values)
  $effect.pre(() => {
    if (initialized) return;
    if (mode === 'create') {
      const defaults: Record<string, unknown> = {};
      for (const field of formFields) {
        defaults[field.key] = field.defaultValue ?? getDefaultForType(field);
      }
      formData = defaults;
      initialized = true;
    } else if (existingQuery && existingQuery.query.data?.data) {
      formData = { ...existingQuery.query.data.data as Record<string, unknown> };
      initialized = true;
    }
  });

  // Unsaved changes warning
  $effect(() => {
    if (!isDirty) return;

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  });

  const createMut = useCreate({ get resource() { return resourceName; } });
  const updateMut = useUpdate({ get resource() { return resourceName; } });

  function validateFields(): boolean {
    const errors: Record<string, string> = {};
    for (const field of formFields) {
      const value = formData[field.key];
      // Required check
      if (field.required) {
        if (value === undefined || value === null || value === '') {
          errors[field.key] = t('validation.required');
          continue;
        }
      }
      // Custom per-field validator
      if (field.validate) {
        const msg = field.validate(value);
        if (msg) { errors[field.key] = msg; }
      }
    }
    fieldErrors = errors;
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    submitting = true;
    error = null;

    if (!validateFields()) {
      submitting = false;
      return;
    }

    try {
      const cleanData: Record<string, unknown> = {};
      for (const field of formFields) {
        const value = formData[field.key];
        if (value !== undefined) {
          cleanData[field.key] = value;
        }
      }

      if (mode === 'create') {
        await createMut.mutation.mutateAsync({ variables: cleanData });
      } else if (id != null) {
        await updateMut.mutation.mutateAsync({ id, variables: cleanData });
      }

      isDirty = false;
      navigate(`/${resourceName}`);
    } catch (e) {
      error = e instanceof Error ? e.message : t('common.operationFailed');
    } finally {
      submitting = false;
    }
  }

  function handleFieldChange(key: string, val: unknown) {
    formData[key] = val;
    isDirty = true;
    // Clear field error when user starts typing
    if (fieldErrors[key]) {
      delete fieldErrors[key];
    }
  }

  const isLoading = $derived(mode === 'edit' && existingQuery ? existingQuery.query.isLoading : false);

  const pageTitle = $derived(
    mode === 'create'
      ? `${t('common.create')}${resource.label}`
      : `${t('common.edit')}${resource.label}`
  );
  // Unsaved changes dialog state
  let confirmOpen = $state(false);
  let pendingNavigation: (() => void) | null = null;

  function guardNavigate(fn: () => void) {
    if (isDirty) {
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
    {#if isDirty}
      <Badge variant="outline" class="border-warning/30 bg-warning/10 text-warning-foreground">{t('common.unsaved')}</Badge>
    {/if}
  </div>

  {#if isLoading}
    <div class="max-w-3xl space-y-6">
      <div class="rounded-lg border p-6 space-y-5">
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
      {#if error}
        <Alert.Root variant="destructive">
          <AlertCircle class="h-4 w-4" />
          <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
      {/if}

      {#if hasGroups}
        {#each groups as group}
          <Card.Root>
            {#if group.name}
              <Card.Header>
                <Card.Title class="text-lg">{group.name}</Card.Title>
              </Card.Header>
            {/if}
            <Card.Content class="space-y-5 px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
              {#each group.fields as field (field.key)}
                <div class:border-destructive={!!fieldErrors[field.key]}>
                  {#if fieldRenderer}
                    {@render fieldRenderer({ field, value: formData[field.key], onchange: (val: unknown) => handleFieldChange(field.key, val) })}
                  {:else}
                    <FieldRenderer
                      {field}
                      value={formData[field.key]}
                      onchange={(val: unknown) => handleFieldChange(field.key, val)}
                    />
                  {/if}
                  {#if fieldErrors[field.key]}
                    <p class="text-destructive text-[0.8125rem] mt-1">{fieldErrors[field.key]}</p>
                  {/if}
                </div>
              {/each}
            </Card.Content>
          </Card.Root>
        {/each}
      {:else}
        <Card.Root>
          <Card.Content class="space-y-5 px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
            {#each formFields as field (field.key)}
              <div class:border-destructive={!!fieldErrors[field.key]}>
                {#if fieldRenderer}
                  {@render fieldRenderer({ field, value: formData[field.key], onchange: (val: unknown) => handleFieldChange(field.key, val) })}
                {:else}
                  <FieldRenderer
                    {field}
                    value={formData[field.key]}
                    onchange={(val: unknown) => handleFieldChange(field.key, val)}
                  />
                {/if}
                {#if fieldErrors[field.key]}
                  <p class="text-destructive text-[0.8125rem] mt-1">{fieldErrors[field.key]}</p>
                {/if}
              </div>
            {/each}
          </Card.Content>
        </Card.Root>
      {/if}

      <div class="flex items-center gap-3">
        {#if formActions}
          {@render formActions({ isLoading: submitting, onSubmit: handleSubmit })}
        {:else}
          <Button type="submit" disabled={submitting}>
            {#if submitting}
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
