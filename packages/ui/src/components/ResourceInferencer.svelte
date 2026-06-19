<script lang="ts">
  // ResourceInferencer — 一站式零配置 CRUD 渲染器
  // 根据 URL action（list/create/edit/show）自动分发到对应的 Inferencer 组件。
  // 用法：<ResourceInferencer resourceName="posts" />
  import { useParsed } from '@svadmin/core';
  import ListInferencer from './ListInferencer.svelte';
  import CreateInferencer from './CreateInferencer.svelte';
  import EditInferencer from './EditInferencer.svelte';
  import ShowInferencer from './ShowInferencer.svelte';

  interface Props {
    resourceName: string;
    class?: string;
  }

  let { resourceName, class: className = '' }: Props = $props();
  const parsed = useParsed();
</script>

{#if parsed.action === 'create'}
  <CreateInferencer {resourceName} class={className} />
{:else if parsed.action === 'edit'}
  <EditInferencer {resourceName} class={className} />
{:else if parsed.action === 'show'}
  <ShowInferencer {resourceName} class={className} />
{:else}
  <ListInferencer {resourceName} class={className} />
{/if}
