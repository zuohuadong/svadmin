import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import TooltipLifecycleHarness from '../../test/fixtures/TooltipLifecycleHarness.svelte';
import TooltipTetherHarness from '../../test/fixtures/TooltipTetherHarness.svelte';

describe('TooltipButton server rendering', () => {
  it('renders the trigger without mounting browser-only floating content', () => {
    const { body } = render(TooltipLifecycleHarness);

    expect(body).toContain('aria-label="Edit record"');
    expect(body).toContain('existing-tooltip-description');
    expect(body).not.toContain('data-slot="tooltip-content"');
  });

  it('renders detached tether triggers without requiring a local tooltip context', () => {
    const { body } = render(TooltipTetherHarness);

    expect(body).toContain('First detached trigger');
    expect(body).toContain('Second detached trigger');
    expect(body).toContain('Third detached trigger');
    expect(body).not.toContain('data-slot="tooltip-content"');
  });
});
