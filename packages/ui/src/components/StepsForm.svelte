<script lang="ts">
  import { fly } from 'svelte/transition';
  import { useStepsForm } from '@svadmin/core';
  import type { FieldDefinition } from '@svadmin/core';
  import { getResource } from '@svadmin/core';
  import { navigate } from '@svadmin/core/router';
  import { t } from '@svadmin/core/i18n';
  import { Button } from './ui/button/index.js';
  import * as Card from './ui/card/index.js';
  import { Badge } from './ui/badge/index.js';
  import { Progress } from './ui/progress/index.js';
  import { Skeleton } from './ui/skeleton/index.js';
  import { Save, ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-svelte';
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

  const resource = getResource(resourceName);
  const primaryKey = resource.primaryKey ?? 'id';

  const stepsForm = useStepsForm({
    resource: resourceName,
    action: mode,
    id,
  });

  const { currentStep, next, prev, gotoStep } = stepsForm;

  const totalSteps = steps.length;
  const progressValue = $derived(((currentStep + 1) / totalSteps) * 100);
  const isLastStep = $derived(currentStep >= totalSteps - 1);

  // Get fields for current step
  const currentFields = $derived(
    steps[currentStep]?.fields
      .map(key => resource.fields.find(f => f.key === key))
      .filter((f): f is FieldDefinition => f != null && f.key !== primaryKey) ?? []
  );

  function handleSubmit() {
    if (!isLastStep) {
      next();
      return;
    }
    stepsForm.onFinish(stepsForm.formValues);
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
          class="flex items-center gap-2 transition-colors h-auto py-1 px-2 {i === currentStep ? 'text-primary font-semibold' : 'text-muted-foreground'}"
          onclick={() => gotoStep(i)}
        >
          <span
            class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors"
            class:bg-primary={i <= currentStep}
            class:text-primary-foreground={i <= currentStep}
            class:bg-muted={i > currentStep}
            class:text-muted-foreground={i > currentStep}
          >
            {#if i < currentStep}
              <Check class="h-3.5 w-3.5" />
            {:else}
              {i + 1}
            {/if}
          </span>
          <span class="hidden sm:inline">{step.title}</span>
        </Button>
        {#if i < steps.length - 1}
          <div class="flex-1 mx-2 h-px bg-border" class:bg-primary={i < currentStep}></div>
        {/if}
      {/each}
    </div>
    <Progress value={progressValue} class="h-1.5" />
  </div>

  <!-- Step content -->
  <Card.Root>
    <Card.CardHeader>
      <Card.CardTitle>{steps[currentStep]?.title ?? ''}</Card.CardTitle>
      <Badge variant="outline" class="w-fit">
        {t('common.step')} {currentStep + 1} / {totalSteps}
      </Badge>
    </Card.CardHeader>
    <Card.CardContent>
      {#key currentStep}
        <form class="space-y-5" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} in:fly={{ x: 30, duration: 250 }}>
        {#each currentFields as field}
          <FieldRenderer
            {field}
            value={stepsForm.formValues[field.key]}
            onchange={(v) => stepsForm.setFieldValue(field.key, v)}
          />
        {/each}

        <div class="flex items-center justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onclick={() => currentStep === 0 ? navigate(`/${resourceName}`) : prev()}
          >
            <ArrowLeft class="h-4 w-4" data-icon="inline-start" />
            {currentStep === 0 ? t('common.cancel') : t('common.back')}
          </Button>

          <Button type="submit" disabled={stepsForm.formLoading}>
            {#if stepsForm.formLoading}
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
