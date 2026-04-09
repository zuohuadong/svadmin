<script lang="ts">
  import { fly } from 'svelte/transition';
  import { useStepsForm, deriveValidator } from '@svadmin/core';
  import type { FieldDefinition } from '@svadmin/core';
  import { getResource } from '@svadmin/core';
  import { navigate } from '@svadmin/core/router';
  import { t } from '@svadmin/core/i18n';
  import { Button } from './ui/button/index.js';
  import * as Card from './ui/card/index.js';
  import { Badge } from './ui/badge/index.js';
  import { Progress } from './ui/progress/index.js';
  import { Save, ArrowLeft, ArrowRight, Check, Loader2 } from '@lucide/svelte';
  import FieldRenderer from './FieldRenderer.svelte';

  interface StepDef {
    title: string;
    fields: string[];
  }

  interface Props {
    resourceName: string;
    id?: string | number;
    mode?: 'create' | 'edit';
    steps: StepDef[];
  }

  let { resourceName, id, mode = 'create', steps }: Props = $props();

  const resource = $derived(getResource(resourceName));
  const primaryKey = $derived(resource.primaryKey ?? 'id');

  // All fields used across all steps
  const flatStepsFields = $derived(steps.flatMap(s => s.fields)
    .map(key => resource.fields.find(f => f.key === key))
    .filter((f): f is FieldDefinition => f != null));

  // Default values from field metadata
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
    for (const f of flatStepsFields) d[f.key] = f.defaultValue ?? getDefaultForType(f);
    return d;
  })());

  const validator = $derived(deriveValidator(flatStepsFields));

  // ─── useStepsForm: form state + step navigation ──────────────────
  const form = useStepsForm({
    get resource() { return resourceName; },
    get action() { return mode; },
    get id() { return id; },
    get defaultValues() { return defaults; },
    redirect: 'list',
    warnWhenUnsavedChanges: true,
    get validate() { return validator; },
  });

  const totalSteps = $derived(steps.length);
  const progressValue = $derived(((form.currentStep + 1) / totalSteps) * 100);
  const isLastStep = $derived(form.currentStep >= totalSteps - 1);

  // Fields for the current step
  const currentFields = $derived(
    steps[form.currentStep]?.fields
      .map(key => resource.fields.find(f => f.key === key))
      .filter((f): f is FieldDefinition => f != null && f.key !== primaryKey) ?? []
  );

  // Validate only fields in the current step
  function validateCurrentStep(): boolean {
    let valid = true;
    form.clearErrors();
    for (const field of currentFields) {
      const value = form.values[field.key];
      if (field.required && (value === undefined || value === null || value === '')) {
        form.setFieldError(field.key, t('validation.required'));
        valid = false;
      } else if (field.validate) {
        const msg = field.validate(value);
        if (msg) {
          form.setFieldError(field.key, msg);
          valid = false;
        }
      }
    }
    return valid;
  }

  async function handleSubmit() {
    if (!validateCurrentStep()) return;

    if (!isLastStep) {
      form.next();
      return;
    }

    // Last step — submit the full form
    await form.submit({ redirect: 'list' });
  }
</script>

<div class="space-y-6">
  <!-- Step indicators -->
  <div class="space-y-3">
    <div class="flex items-center justify-between text-sm">
      {#each steps as step, i}
        <Button
          variant="ghost"
          type="button"
          class="flex items-center gap-2 transition-colors h-auto py-1 px-2 {i === form.currentStep ? 'text-primary font-semibold' : 'text-muted-foreground'}"
          onclick={() => form.gotoStep(i)}
        >
          <span
            class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors"
            class:bg-primary={i <= form.currentStep}
            class:text-primary-foreground={i <= form.currentStep}
            class:bg-muted={i > form.currentStep}
            class:text-muted-foreground={i > form.currentStep}
          >
            {#if i < form.currentStep}
              <Check class="h-3.5 w-3.5" />
            {:else}
              {i + 1}
            {/if}
          </span>
          <span class="hidden sm:inline">{step.title}</span>
        </Button>
        {#if i < steps.length - 1}
          <div class="flex-1 mx-2 h-px bg-border" class:bg-primary={i < form.currentStep}></div>
        {/if}
      {/each}
    </div>
    <Progress value={progressValue} class="h-1.5" />
  </div>

  <!-- Step content -->
  <Card.Root>
    <Card.CardHeader>
      <Card.CardTitle>{steps[form.currentStep]?.title ?? ''}</Card.CardTitle>
      <Badge variant="outline" class="w-fit">
        {t('common.step')} {form.currentStep + 1} / {totalSteps}
      </Badge>
    </Card.CardHeader>
    <Card.CardContent>
      {#key form.currentStep}
        <form class="space-y-5" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} in:fly={{ x: 30, duration: 250 }}>
        {#each currentFields as field (field.key)}
          <FieldRenderer
            {field}
            value={form.values[field.key]}
            onchange={(v) => form.setFieldValue(field.key, v)}
          />
          {#if form.errors[field.key]}
            <p class="text-destructive text-[0.8125rem] mt-1">{form.errors[field.key]}</p>
          {/if}
        {/each}

        <div class="flex items-center justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onclick={() => form.currentStep === 0 ? navigate(`/${resourceName}`) : form.prev()}
          >
            <ArrowLeft class="h-4 w-4" data-icon="inline-start" />
            {form.currentStep === 0 ? t('common.cancel') : t('common.back')}
          </Button>

          <Button type="submit" disabled={form.submitting}>
            {#if form.submitting}
              <Loader2 class="h-4 w-4 animate-spin" data-icon="inline-start" />
            {:else if isLastStep}
              <Save class="h-4 w-4" data-icon="inline-start" />
            {:else}
              <ArrowRight class="h-4 w-4" data-icon="inline-start" />
            {/if}
            {isLastStep ? t('common.save') : t('common.next')}
          </Button>
        </div>
      </form>
      {/key}
    </Card.CardContent>
  </Card.Root>
</div>
