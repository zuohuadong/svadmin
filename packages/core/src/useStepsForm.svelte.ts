import { useForm } from './hooks.svelte';
import type { UseFormOptions, UseFormResult } from './hooks.svelte';

export interface UseStepsFormOptions extends UseFormOptions {
  /** Default step index. Starts at 0. */
  defaultStep?: number;
  /** Validate the form when navigating back? Refine uses this, though our current implementation handles it loosely. */
  isBackValidate?: boolean;
}

export interface UseStepsFormResult<T = Record<string, unknown>> extends UseFormResult<T> {
  currentStep: number;
  gotoStep: (step: number) => void;
  next: () => void;
  prev: () => void;
}

/**
 * useStepsForm
 * Extends `useForm` with step navigation state (currentStep, next, prev, gotoStep).
 */
export function useStepsForm<T = Record<string, unknown>>(options: UseStepsFormOptions = {}): UseStepsFormResult<T> {
  const form = useForm<T>(options);
  
  let currentStep = $state(options.defaultStep ?? 0);
  
  function gotoStep(step: number) {
    currentStep = Math.max(0, step);
  }
  
  function next() {
    gotoStep(currentStep + 1);
  }
  
  function prev() {
    if (currentStep > 0) {
      gotoStep(currentStep - 1);
    }
  }

  // Inject stepping features into the returned useForm object while preserving its reactive getters.
  const result = form as unknown as UseStepsFormResult<T>;
  
  Object.defineProperty(result, 'currentStep', {
    get: () => currentStep,
    enumerable: true,
    configurable: true
  });
  
  result.gotoStep = gotoStep;
  result.next = next;
  result.prev = prev;

  return result;
}
