<script lang="ts">
  /**
   * SSR LineChart — Degraded to an HTML data table.
   * Drawing SVG/Canvas line charts inline is possible but complex.
   * For maximum compatibility (IE11), we render data as a simple table.
   */
  interface DataPoint {
    label: string;
    value: number;
  }

  interface Props {
    data: DataPoint[];
    title?: string;
    valueLabel?: string;
  }

  let { data, title, valueLabel = 'Value' }: Props = $props();
</script>

<div class="lite-card" style="margin-bottom: 16px;">
  {#if title}
    <div style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 600; font-size: 14px; color: #0f172a;">
      {title}
    </div>
  {/if}
  <table style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr>
        <th style="text-align: left; padding: 10px 16px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Label</th>
        <th style="text-align: right; padding: 10px 16px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">{valueLabel}</th>
      </tr>
    </thead>
    <tbody>
      {#each data as point, i}
        <tr style="background: {i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          <td style="padding: 8px 16px; font-size: 13px; color: #334155;">{point.label}</td>
          <td style="padding: 8px 16px; font-size: 13px; color: #0f172a; text-align: right; font-weight: 500;">{point.value}</td>
        </tr>
      {/each}
      {#if data.length === 0}
        <tr>
          <td colspan="2" style="padding: 16px; text-align: center; color: #94a3b8; font-style: italic;">No data</td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>
