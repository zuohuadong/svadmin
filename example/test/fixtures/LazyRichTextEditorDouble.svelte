<script lang="ts">
  let {
    value = $bindable(''),
    editable = true,
    placeholder,
    onchange,
  }: {
    value?: string;
    editable?: boolean;
    placeholder?: string;
    onchange?: (html: string) => void;
  } = $props();

  function updateValue() {
    value = '<p>updated</p>';
    onchange?.(value);
  }
</script>

<div data-testid="editor" data-editable={editable} data-placeholder={placeholder}>{value}</div>
<button type="button" onclick={updateValue}>Update editor</button>
