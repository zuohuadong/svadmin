import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'svadmin',
      description: 'Headless admin framework for Svelte 5',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/zuohuadong/svadmin' },
      ],
      editLink: {
        baseUrl: 'https://github.com/zuohuadong/svadmin/edit/main/docs/',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', slug: 'guides/introduction' },
            { label: 'Quick Start', slug: 'guides/quick-start' },
            { label: 'Resource Type Registry', slug: 'guides/resource-type-registry' },
          ],
        },
        {
          label: 'Providers',
          items: [
            { label: 'Data Provider', slug: 'providers/data-provider' },
            { label: 'Auth Provider', slug: 'providers/auth' },
            { label: 'Router Provider', slug: 'providers/router' },
            { label: 'Live Provider', slug: 'providers/live' },
            { label: 'Elysia', slug: 'providers/elysia' },
          ],
        },
        {
          label: 'Hooks',
          items: [
            { label: 'Data Hooks', slug: 'hooks/data' },
            { label: 'Auth Hooks', slug: 'hooks/auth' },
            { label: 'Form & Table', slug: 'hooks/form-table' },
          ],
        },
        {
          label: 'Components',
          items: [
            { label: 'CRUD Pages', slug: 'components/crud-pages' },
            { label: 'CRUD Buttons', slug: 'components/buttons' },
            { label: 'Auto Save', slug: 'components/autosave' },
          ],
        },
        {
          label: 'Reference',
          autogenerate: { directory: 'reference' },
        },
      ],
    }),
  ],
});
