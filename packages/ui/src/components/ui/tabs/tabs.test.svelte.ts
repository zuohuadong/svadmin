import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import TabsHarness from '../../../../test/fixtures/TabsHarness.svelte';

describe('Tabs', () => {
	it('keeps trigger state, content, bindings, and callbacks in sync', async () => {
		render(TabsHarness);

		const stateTab = screen.getByRole('tab', { name: 'State' });
		const inferencerTab = screen.getByRole('tab', { name: 'Inferencer' });

		expect(stateTab.getAttribute('aria-selected')).toBe('true');
		expect(inferencerTab.getAttribute('aria-selected')).toBe('false');
		expect(screen.getByText('State panel')).toBeTruthy();
		expect(screen.queryByText('Inferencer panel')).toBeNull();

		await fireEvent.click(inferencerTab);

		expect(stateTab.getAttribute('aria-selected')).toBe('false');
		expect(inferencerTab.getAttribute('aria-selected')).toBe('true');
		expect(screen.queryByText('State panel')).toBeNull();
		expect(screen.getByText('Inferencer panel')).toBeTruthy();
		expect(screen.getByTestId('tabs-value').textContent).toBe('inferencer');
		expect(screen.getByTestId('tabs-changes').textContent).toBe('inferencer');
	});

	it('supports roving focus and keyboard activation', async () => {
		render(TabsHarness);

		const stateTab = screen.getByRole('tab', { name: 'State' });
		const inferencerTab = screen.getByRole('tab', { name: 'Inferencer' });

		stateTab.focus();
		await fireEvent.keyDown(stateTab, { key: 'ArrowRight' });

		expect(document.activeElement).toBe(inferencerTab);
		expect(inferencerTab.getAttribute('aria-selected')).toBe('true');
		expect(screen.getByText('Inferencer panel')).toBeTruthy();

		await fireEvent.keyDown(inferencerTab, { key: 'Home' });
		expect(document.activeElement).toBe(stateTab);
		expect(stateTab.getAttribute('aria-selected')).toBe('true');
	});
});
