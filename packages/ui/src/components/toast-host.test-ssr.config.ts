import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'node:path';

export default defineConfig({
  root: resolve(import.meta.dirname, '../..'),
  plugins: [svelte()],
  ssr: {
    noExternal: ['@tanstack/svelte-query', 'svelte-sonner'],
  },
  test: {
    environment: 'node',
    globals: true,
    pool: 'threads',
    maxWorkers: 1,
    include: ['src/components/toast-host.test-ssr.spec.integration.ts'],
  },
});
