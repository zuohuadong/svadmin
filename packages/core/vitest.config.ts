import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./setupTest.ts'],
    // Include specific test files
    include: ['src/**/*.test.{ts,svelte.ts}'],
    // Exclude basic bun:tests if needed, or unify
  },
});
