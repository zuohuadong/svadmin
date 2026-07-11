import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  test: {
    environment: 'node',
    globals: true,
    pool: 'threads',
    maxWorkers: 1,
    include: ['src/components/tooltip-button.test-ssr.spec.integration.ts'],
  },
});
