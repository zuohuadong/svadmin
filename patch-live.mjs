import fs from 'fs';

let content = fs.readFileSync('packages/core/src/query-hooks.svelte.ts', 'utf8');

const replacementLiveOne = `
  const overtime = createOvertimeTracker(() => query.isLoading, typeof optionsOrGetter === 'function' ? optionsOrGetter().overtimeOptions : optionsOrGetter.overtimeOptions ?? adminOptions.overtime);

  createLiveSubscription((): LiveSubscriptionParams => {
    const opts = getOptions();
    return {
      resource: getResource(),
      liveProvider: getLiveProvider(),
      liveMode: opts.liveMode ?? adminOptions.liveMode,
      onLiveEvent: (e: LiveEvent) => {
        opts.onLiveEvent?.(e);
        adminOptions.onLiveEvent?.(e);
      },
      liveParams: opts.liveParams,
      enabled: opts.queryOptions?.enabled ?? true,
    };
  });

  $effect(() => {
`;

content = content.replace(`
  const overtime = createOvertimeTracker(() => query.isLoading, typeof optionsOrGetter === 'function' ? optionsOrGetter().overtimeOptions : optionsOrGetter.overtimeOptions ?? adminOptions.overtime);

  $effect(() => {
`, replacementLiveOne);

const replacementLiveMany = `
  const overtime = createOvertimeTracker(() => query.isLoading, typeof optionsOrGetter === 'function' ? optionsOrGetter().overtimeOptions : optionsOrGetter.overtimeOptions ?? adminOptions.overtime);

  createLiveSubscription((): LiveSubscriptionParams => {
    const opts = getOptions();
    return {
      resource: opts.resource,
      liveProvider: getLiveProvider(),
      liveMode: opts.liveMode ?? adminOptions.liveMode,
      onLiveEvent: (e: LiveEvent) => {
        opts.onLiveEvent?.(e);
        adminOptions.onLiveEvent?.(e);
      },
      liveParams: opts.liveParams,
      enabled: opts.queryOptions?.enabled ?? true,
    };
  });

  $effect(() => {
`;

// There are multiple instances of "createOvertimeTracker(() => query.isLoading...". Replace specifically inside useMany.
// To do this reliably we can just use string matching for useMany implementation.
const getUseManyPart = content.split('export function useMany')[1];
const oldUseManyEff = `
  const overtime = createOvertimeTracker(() => query.isLoading, typeof optionsOrGetter === 'function' ? optionsOrGetter().overtimeOptions : optionsOrGetter.overtimeOptions ?? adminOptions.overtime);

  $effect(() => {`;
const newUseManyPart = getUseManyPart.replace(oldUseManyEff, replacementLiveMany);
content = content.split('export function useMany')[0] + 'export function useMany' + newUseManyPart;

fs.writeFileSync('packages/core/src/query-hooks.svelte.ts', content);

