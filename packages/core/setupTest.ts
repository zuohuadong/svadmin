import '@testing-library/svelte/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/svelte';

// Unmounts any Svelte components mounted using @testing-library/svelte render()
afterEach(() => {
  cleanup();
});
