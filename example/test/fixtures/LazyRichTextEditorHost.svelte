<script lang="ts">
  import LazyRichTextEditor from '../../src/components/LazyRichTextEditor.svelte';

  let {
    onchange,
  }: {
    onchange: (html: string) => void;
  } = $props();

  let value = $state('<p>initial</p>');
</script>

<LazyRichTextEditor
  bind:value
  disabled
  placeholder="Write something"
  {onchange}
/>
<output>{value}</output>
