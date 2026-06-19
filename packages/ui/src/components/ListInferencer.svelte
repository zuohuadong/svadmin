<script lang="ts">
  // ListInferencer — 基于资源定义零配置渲染列表视图
  // 直接复用 ListPage + AutoTable，不需要手写任何页面代码。
  import ListPage from './ListPage.svelte';

  interface Props {
    resourceName: string;
    class?: string;
  }

  let { resourceName, class: className = '' }: Props = $props();
</script>

<ListPage {resourceName} class={className} />
