import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    conditions: ['browser'],
  },
  ssr: {
    noExternal: ['@tanstack/svelte-query'],
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./setupTest.ts'],
    // Include specific test files
    include: ['src/**/*.test.svelte.ts'],
  },
});
