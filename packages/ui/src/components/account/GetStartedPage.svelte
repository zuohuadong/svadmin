<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import * as Card from '../ui/card/index.js';
  import { Button } from '../ui/button/index.js';
  import { Badge } from '../ui/badge/index.js';
  import { Camera, UserPlus, Puzzle, Users, CheckCircle2, ArrowRight, Sparkles } from '@lucide/svelte';
  import type { Component } from 'svelte';

  interface Step {
    key: string;
    title: string;
    description: string;
    icon: Component;
    completed: boolean;
  }

  let currentStep = $state(0);

  let steps = $state<Step[]>([
    { key: 'avatar', title: t('account.uploadAvatar'), description: t('account.getStartedDescription'), icon: Camera, completed: false },
    { key: 'profile', title: t('account.setupProfile'), description: t('account.getStartedDescription'), icon: UserPlus, completed: false },
    { key: 'connect', title: t('account.connectProvider'), description: t('account.getStartedDescription'), icon: Puzzle, completed: false },
    { key: 'team', title: t('account.setupTeam'), description: t('account.getStartedDescription'), icon: Users, completed: false },
  ]);

  const completedCount = $derived(steps.filter(s => s.completed).length);
  const progressPercent = $derived(Math.round((completedCount / steps.length) * 100));
  const allCompleted = $derived(completedCount === steps.length);

  function markComplete(index: number) {
    steps[index] = { ...steps[index], completed: true };
    if (currentStep < steps.length - 1) {
      currentStep = index + 1;
    }
  }

  function goToStep(index: number) {
    if (index <= completedCount) {
      currentStep = index;
    }
  }

  function skipStep() {
    if (currentStep < steps.length - 1) {
      currentStep++;
    }
  }
</script>

<div class="space-y-6" data-svadmin-content-page="account">
  <div class="flex items-start justify-between gap-4">
    <div>
      <h2 class="text-xl font-semibold text-foreground">{t('account.getStarted')}</h2>
      <p class="mt-1 text-sm text-muted-foreground">{t('account.getStartedDescription')}</p>
    </div>
    <Badge variant="secondary">{progressPercent}%</Badge>
  </div>

  <!-- Progress bar -->
  <div class="space-y-1.5">
    <div class="h-2 rounded-full bg-muted overflow-hidden">
      <div class="h-full rounded-full bg-primary transition-all duration-500" style="width: {progressPercent}%"></div>
    </div>
    <p class="text-xs text-muted-foreground">{t('account.step', { current: completedCount, total: steps.length })}</p>
  </div>

  {#if allCompleted}
    <Card.Card class="border-success/30 bg-success/5">
      <Card.CardContent class="flex items-center gap-4 p-6">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
          <Sparkles class="h-6 w-6" />
        </div>
        <div>
          <h3 class="font-semibold text-success">{t('account.completeSetup')}</h3>
          <p class="text-sm text-success/70">{t('account.getStartedDescription')}</p>
        </div>
      </Card.CardContent>
    </Card.Card>
  {:else}
    <!-- Step cards -->
    <div class="space-y-3">
      {#each steps as step, i (i)}
        <Card.Card class="border-border/60 transition-all {currentStep === i ? 'border-primary/40 shadow-sm' : ''} {step.completed ? 'opacity-60' : ''}">
          <Card.CardContent class="p-4">
            <div class="flex items-start gap-4">
              <button
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors
                  {step.completed ? 'bg-success/10 text-success' : currentStep === i ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}"
                onclick={() => goToStep(i)}
              >
                {#if step.completed}
                  <CheckCircle2 class="h-5 w-5" />
                {:else}
                  <step.icon class="h-5 w-5" />
                {/if}
              </button>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h4 class="font-medium text-foreground">{step.title}</h4>
                  {#if currentStep === i && !step.completed}
                    <Badge variant="outline" class="text-[10px]">{t('account.step', { current: i + 1, total: steps.length })}</Badge>
                  {/if}
                </div>
                <p class="text-sm text-muted-foreground mt-0.5">{step.description}</p>

                {#if currentStep === i && !step.completed}
                  <div class="mt-3 flex gap-2">
                    <Button size="sm" onclick={() => markComplete(i)}>
                      {t('account.completeSetup')} <ArrowRight class="h-3.5 w-3.5 ml-1" />
                    </Button>
                    <Button size="sm" variant="ghost" onclick={skipStep}>
                      {t('account.skipSetup')}
                    </Button>
                  </div>
                {/if}
              </div>
            </div>
          </Card.CardContent>
        </Card.Card>
      {/each}
    </div>
  {/if}
</div>
