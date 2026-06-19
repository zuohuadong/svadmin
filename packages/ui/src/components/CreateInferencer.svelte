<script lang="ts">
  // CreateInferencer — 基于资源定义零配置渲染创建表单
  import CreatePage from './CreatePage.svelte';

  interface Props {
    resourceName: string;
    class?: string;
  }

  let { resourceName, class: className = '' }: Props = $props();
</script>

<CreatePage {resourceName} class={className} />
