import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  ssr: {
    noExternal: ['@tanstack/svelte-query'],
  },
  test: {
    environment: 'node',
    globals: true,
    pool: 'threads',
    maxWorkers: 1,
    include: ['src/components/admin-app.context.test-ssr.spec.integration.ts'],
  },
});
