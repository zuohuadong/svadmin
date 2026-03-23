<script lang="ts">
  import { getDataProvider, getResources, inferResource } from '@svadmin/core';
  import type { InferResult, ResourceDefinition } from '@svadmin/core';
  import { Button } from './ui/button/index.js';
  import { Wand2, Copy, Check, RefreshCw, Loader2 } from 'lucide-svelte';

  const dataProvider = getDataProvider();
  const resources = getResources();

  let selectedResource = $state('');
  let inferResult = $state<InferResult | null>(null);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let copied = $state(false);
  let customEndpoint = $state('');

  async function runInference() {
    const resourceName = customEndpoint.trim() || selectedResource;
    if (!resourceName) return;

    loading = true;
    error = null;
    inferResult = null;

    try {
      const response = await dataProvider.getList({
        resource: resourceName,
        pagination: { current: 1, pageSize: 25 },
      });

      if (!response.data || response.data.length === 0) {
        error = `No data returned from "${resourceName}". The API must return at least one record to infer fields.`;
        return;
      }

      inferResult = inferResource(
        resourceName,
        response.data as Record<string, unknown>[],
      );
    } catch (e: any) {
      error = e?.message ?? 'Failed to fetch data for inference.';
    } finally {
      loading = false;
    }
  }

  function copyCode() {
    if (!inferResult) return;
    navigator.clipboard.writeText(inferResult.code);
    copied = true;
    setTimeout(() => { copied = false; }, 2000);
  }

  const typeColors: Record<string, string> = {
    text: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    number: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    boolean: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    date: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    email: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    url: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    image: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    images: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    textarea: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    json: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    tags: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    select: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    relation: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    color: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200',
    phone: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  };
</script>

<div class="inferencer-panel space-y-4">
  <div class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
    <Wand2 class="h-4 w-4" />
    Resource Inferencer
  </div>

  <!-- Resource selector -->
  <div class="flex gap-2">
    <select
      class="flex-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
      bind:value={selectedResource}
    >
      <option value="">— Select a resource —</option>
      {#each resources as res}
        <option value={res.name}>{res.label} ({res.name})</option>
      {/each}
    </select>
    <span class="flex items-center text-xs text-gray-400">or</span>
    <input
      type="text"
      class="w-36 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
      placeholder="custom endpoint"
      bind:value={customEndpoint}
    />
  </div>

  <Button size="sm" onclick={runInference} disabled={loading || (!selectedResource && !customEndpoint.trim())}>
    {#if loading}
      <Loader2 class="mr-1 h-3 w-3 animate-spin" />
      Inferring...
    {:else}
      <RefreshCw class="mr-1 h-3 w-3" />
      Infer Fields
    {/if}
  </Button>

  {#if error}
    <div class="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
      {error}
    </div>
  {/if}

  {#if inferResult}
    <!-- Field table -->
    <div class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th class="px-3 py-2 font-medium">Field</th>
            <th class="px-3 py-2 font-medium">Type</th>
            <th class="px-3 py-2 font-medium">List</th>
            <th class="px-3 py-2 font-medium">Form</th>
          </tr>
        </thead>
        <tbody>
          {#each inferResult.fields as field}
            <tr class="border-t border-gray-100 dark:border-gray-700/50">
              <td class="px-3 py-1.5 font-mono text-xs">{field.key}</td>
              <td class="px-3 py-1.5">
                <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {typeColors[field.type] ?? 'bg-gray-100 text-gray-600'}">
                  {field.type}
                  {#if field.resource}→ {field.resource}{/if}
                </span>
              </td>
              <td class="px-3 py-1.5 text-center">{field.showInList ? '✓' : '—'}</td>
              <td class="px-3 py-1.5 text-center">{field.showInForm ? '✓' : '—'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Generated code -->
    <div class="relative">
      <div class="flex items-center justify-between rounded-t-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-400">
        <span>Generated ResourceDefinition</span>
        <button class="flex items-center gap-1 hover:text-white transition-colors" onclick={copyCode}>
          {#if copied}
            <Check class="h-3 w-3 text-green-400" />
            <span class="text-green-400">Copied!</span>
          {:else}
            <Copy class="h-3 w-3" />
            Copy
          {/if}
        </button>
      </div>
      <pre class="max-h-64 overflow-auto rounded-b-lg bg-gray-900 p-3 text-xs text-green-300 font-mono">{inferResult.code}</pre>
    </div>

    <p class="text-xs text-gray-400">
      Inferred {inferResult.fields.length} fields from sample data. Copy the code above into your <code>resources.ts</code> file.
    </p>
  {/if}
</div>
