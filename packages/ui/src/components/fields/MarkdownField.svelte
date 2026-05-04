<script lang="ts">
  import * as DOMPurifyPkg from "isomorphic-dompurify";
  interface Props { value: string | null | undefined }
  let { value }: Props = $props();

  const DOMPurify = 'default' in DOMPurifyPkg ? DOMPurifyPkg.default : DOMPurifyPkg;

  const sanitizedHtml = $derived(
    value ? DOMPurify.sanitize(value, { USE_PROFILES: { html: true } }) : ''
  );
</script>
{#if value}
  <div class="prose prose-sm dark:prose-invert max-w-none leading-relaxed [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[0.875em] [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_a]:text-primary">{@html sanitizedHtml}</div>
{:else}
  <span class="text-muted-foreground">—</span>
{/if}
