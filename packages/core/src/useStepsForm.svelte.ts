import { useForm } from './form-hooks.svelte';
import type { UseFormOptions, UseFormResult } from './form-hooks.svelte';
import type { BaseRecord, HttpError } from './types';

export interface UseStepsFormOptions<
  TQueryFnData extends BaseRecord = BaseRecord,
  TError = HttpError,
  TVariables = Record<string, unknown>,
  TData extends BaseRecord = TQueryFnData
> extends UseFormOptions<TQueryFnData, TError, TVariables, TData> {
  /** Default step index. Starts at 0. */
  defaultStep?: number;
  /** Validate the form when navigating back? */
  isBackValidate?: boolean;
}

export interface UseStepsFormResult<
  TQueryFnData extends BaseRecord = BaseRecord,
  TError = HttpError,
  TVariables = Record<string, unknown>,
  TData extends BaseRecord = TQueryFnData
> extends UseFormResult<TQueryFnData, TError, TVariables, TData> {
  currentStep: number;
  gotoStep: (step: number) => void;
  next: () => void;
  prev: () => void;
}

/**
 * useStepsForm
 * Extends `useForm` with step navigation state (currentStep, next, prev, gotoStep).
 */
export function useStepsForm<
  TQueryFnData extends BaseRecord = BaseRecord,
  TError = HttpError,
  TVariables = Record<string, unknown>,
  TData extends BaseRecord = TQueryFnData
>(options: UseStepsFormOptions<TQueryFnData, TError, TVariables, TData> = ({} as UseStepsFormOptions<TQueryFnData, TError, TVariables, TData>): UseStepsFormResult<TQueryFnData, TError, TVariables, TData> {
  const form = useForm<TQueryFnData, TError, TVariables, TData>(options);
  
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
  const result = form as unknown as UseStepsFormResult<TQueryFnData, TError, TVariables, TData>;
  
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
