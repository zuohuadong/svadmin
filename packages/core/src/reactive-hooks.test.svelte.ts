import { describe, it, expect } from 'vitest';
import { useThemedLayoutContext } from './hooks.svelte';

describe('Svelte 5 Reactive Runes Compatibility', () => {

  it('verifies that sidebarCollapsed is correctly synchronized out of component lifecycle', () => {
    let observedValue = false;
    let layout: ReturnType<typeof useThemedLayoutContext>;
    
    const cleanup = $effect.root(() => {
        layout = useThemedLayoutContext();
        
        $effect(() => {
           observedValue = layout.sidebarCollapsed;
        });
    });

    expect(observedValue).toBe(false);

    layout!.toggleSidebar();

    expect(layout!.sidebarCollapsed).toBe(true);

    cleanup();
  });
});
