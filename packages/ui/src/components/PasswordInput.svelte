<script lang="ts">
  import { Input } from './ui/input/index.js';
  import { Button } from './ui/button/index.js';
  import TooltipButton from './TooltipButton.svelte';
  import { Label } from './ui/label/index.js';
  import { Progress } from './ui/progress/index.js';
  import { Lock, Eye, EyeOff } from 'lucide-svelte';

  interface Props {
    id: string;
    label: string;
    value: string;
    placeholder?: string;
    autocomplete?: string;
    showStrength?: boolean;
    class?: string;
  }

  let {
    id,
    label,
    value = $bindable(''),
    placeholder = '••••••••',
    autocomplete = 'current-password',
    showStrength = false,
    class: className = '',
  }: Props = $props();

  let showPassword = $state(false);

  // Password strength calculation
  const strength = $derived.by(() => {
    if (!showStrength || !value) return 0;
    let score = 0;
    if (value.length >= 8) score += 25;
    if (value.length >= 12) score += 10;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 25;
    if (/\d/.test(value)) score += 20;
    if (/[^a-zA-Z0-9]/.test(value)) score += 20;
    return Math.min(score, 100);
  });

  const strengthColor = $derived(
    strength < 30 ? 'bg-destructive' :
    strength < 60 ? 'bg-amber-500' :
    strength < 80 ? 'bg-blue-500' : 'bg-emerald-500'
  );

  const strengthLabel = $derived(
    strength < 30 ? 'Weak' :
    strength < 60 ? 'Fair' :
    strength < 80 ? 'Good' : 'Strong'
  );
</script>

<div class="space-y-2 {className}">
  <Label for={id}>{label}</Label>
  <div class="relative">
    <Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-[1]" />
    <Input
      {id}
      type={showPassword ? 'text' : 'password'}
      {placeholder}
      bind:value
      class="pl-9 pr-9"
      autocomplete={autocomplete as any}
    />
    <TooltipButton
      tooltip={showPassword ? 'Hide password' : 'Show password'}
      variant="ghost"
      size="icon"
      type="button"
      class="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 z-[1]"
      onclick={() => showPassword = !showPassword}
      tabindex={-1}
    >
      {#if showPassword}
        <EyeOff class="h-4 w-4" />
      {:else}
        <Eye class="h-4 w-4" />
      {/if}
    </TooltipButton>
  </div>
  {#if showStrength && value}
    <div class="flex items-center gap-2">
      <div class="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-300 {strengthColor}"
          style="width: {strength}%"
        ></div>
      </div>
      <span class="text-xs text-muted-foreground w-12 text-right">{strengthLabel}</span>
    </div>
  {/if}
</div>
