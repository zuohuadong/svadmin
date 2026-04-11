import { useForm } from './form-hooks.svelte';
import type { UseFormOptions, UseFormReturn } from './form-hooks.svelte';
import type { BaseRecord, HttpError } from './types';

export interface UseStepsFormOptions<
  TVariables extends Record<string, unknown> = Record<string, unknown>,
  TData extends BaseRecord = BaseRecord,
  TError = HttpError,
> extends UseFormOptions<TVariables, TData, TError> {
  /** Total number of steps. Defaults to 1 */
  stepsCount?: number;
  /** Default step index. Starts at 0. */
  defaultStep?: number;
  /** Validate the form when navigating back? */
  isBackValidate?: boolean;
}

export interface UseStepsFormReturn<
  TVariables extends Record<string, unknown> = Record<string, unknown>,
  TData extends BaseRecord = BaseRecord,
> extends UseFormReturn<TVariables, TData> {
  steps: {
    currentStep: number;
    totalSteps: number;
    canGoNext: boolean;
    canGoPrev: boolean;
    gotoStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
  };
}

/**
 * useStepsForm
 * Extends `useForm` with a nested `steps` object tracking navigation state.
 */
export function useStepsForm<
  TVariables extends Record<string, unknown> = Record<string, unknown>,
  TData extends BaseRecord = BaseRecord,
  TError = HttpError,
>(options: UseStepsFormOptions<TVariables, TData, TError> = {} as UseStepsFormOptions<TVariables, TData, TError>): UseStepsFormReturn<TVariables, TData> {
  const form = useForm<TVariables, TData, TError>(options);

  let currentStep = $state(options.defaultStep ?? 0);
  const totalSteps = options.stepsCount ?? 1;

  function gotoStep(step: number) {
    currentStep = Math.max(0, Math.min(step, totalSteps - 1));
  }

  function nextStep() {
    if (currentStep < totalSteps - 1) gotoStep(currentStep + 1);
  }

  function prevStep() {
    if (currentStep > 0) gotoStep(currentStep - 1);
  }

  const result = form as unknown as UseStepsFormReturn<TVariables, TData>;

  const steps = {
    get currentStep() { return currentStep; },
    get totalSteps() { return totalSteps; },
    get canGoNext() { return currentStep < totalSteps - 1; },
    get canGoPrev() { return currentStep > 0; },
    gotoStep,
    nextStep,
    prevStep,
  };

  Object.defineProperty(result, 'steps', {
    get: () => steps,
    enumerable: true
  });

  return result;
}
