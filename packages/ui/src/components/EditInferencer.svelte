<script lang="ts">
  // EditInferencer — 基于资源定义零配置渲染编辑表单
  // 从 URL 自动提取 :id 参数
  import EditPage from './EditPage.svelte';
  import { useParsed } from '@svadmin/core';

  interface Props {
    resourceName: string;
    /** 可选：显式指定 id，默认从 URL 解析 */
    id?: string | number;
    class?: string;
  }

  let { resourceName, id, class: className = '' }: Props = $props();
  const parsed = useParsed();
  const resolvedId = $derived(id ?? parsed.id ?? '');
</script>

{#if resolvedId}
  <EditPage {resourceName} id={resolvedId} class={className} />
{/if}
