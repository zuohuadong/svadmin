import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    svelte(),
  ],
  server: {
    port: 5174,
  },
  optimizeDeps: {
    exclude: ['@svadmin/core', '@svadmin/ui'],
    include: ['highlight.js'],
  },
});
