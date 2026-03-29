<script lang="ts">
  /**
   * LiteConfirmDialog — SSR-compatible confirmation dialog.
   * Utilizes pure HTML <details> and <summary> to show a popup.
   * No client-side JS required.
   */

  interface Props {
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    /** The summary element (button) that triggers the dropdown */
    triggerLabel: string;
    triggerClass?: string;
    /** Form action to submit on confirm */
    action: string;
    /** Any hidden inputs to include in the form */
    hiddenInputs?: Record<string, string>;
    align?: 'left' | 'right';
  }

  let {
    title = 'Are you sure?',
    description = 'This action cannot be undone.',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    triggerLabel,
    triggerClass = 'lite-btn lite-btn-danger lite-btn-sm',
    action,
    hiddenInputs = {},
    align = 'right'
  }: Props = $props();
</script>

<details class="lite-confirm-details">
  <summary class={triggerClass}>{triggerLabel}</summary>
  <div class="lite-confirm-panel" style="text-align:left; {align === 'right' ? 'right:0;' : 'left:0;'}">
    <div style="font-weight:600;margin-bottom:8px;color:#0f172a;">{title}</div>
    {#if description}
      <div style="font-size:12px;color:#64748b;margin-bottom:16px;">{description}</div>
    {/if}
    <form method="POST" {action} style="display:flex;margin:0;justify-content:flex-end;">
      {#each Object.entries(hiddenInputs) as [key, val]}
        <input type="hidden" name={key} value={val} />
      {/each}
      <button
        type="button"
        class="lite-btn lite-btn-sm"
        style="margin-right:8px;"
        onclick="this.closest('details').removeAttribute('open')"
      >
        {cancelLabel}
      </button>
      <button type="submit" class="lite-btn lite-btn-primary lite-btn-sm lite-btn-danger">
        {confirmLabel}
      </button>
    </form>
  </div>
</details>
