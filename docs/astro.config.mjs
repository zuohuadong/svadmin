import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';
import starlightImageZoom from 'starlight-image-zoom';
import starlightLinksValidator from 'starlight-links-validator';
import svelte from '@astrojs/svelte';

export default defineConfig({
  site: 'https://svadmin.nestjs.cn',
  integrations: [
    svelte(),
    starlight({
      plugins: [
        starlightLlmsTxt(),
        starlightImageZoom(),
        starlightLinksValidator(),
      ],
      title: 'svadmin',
      description: 'Headless admin framework for Svelte 5',
      head: [
        {
          tag: 'script',
          attrs: { is: 'inline' },
          content: `
            (function() {
              var theme = typeof localStorage !== 'undefined' && localStorage.getItem('starlight-theme');
              var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              var resolvedTheme = theme === 'dark' || (!theme && prefersDark) ? 'dark' : 'light';
              document.documentElement.dataset.theme = resolvedTheme;
            })();
          `,
        },
      ],
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        'zh-cn': { label: '简体中文', lang: 'zh-CN' },
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/zuohuadong/svadmin' },
      ],
      editLink: {
        baseUrl: 'https://github.com/zuohuadong/svadmin/edit/main/docs/',
      },
      sidebar: [
        {
          label: 'Getting Started',
          translations: { 'zh-CN': '快速上手' },
          items: [
            { slug: 'guides/introduction' },
            { slug: 'guides/quick-start' },
            { slug: 'guides/resource-type-registry' },
            { slug: 'guides/comparison' },
          ],
        },
        {
          label: 'Providers',
          translations: { 'zh-CN': '提供器' },
          items: [
            { slug: 'providers/data-provider' },
            { slug: 'providers/auth' },
            { slug: 'providers/router' },
            { slug: 'providers/live' },
            { slug: 'providers/elysia' },
            { slug: 'providers/drizzle' },
          ],
        },
        {
          label: 'Hooks',
          items: [
            { slug: 'hooks/data' },
            { slug: 'hooks/auth' },
            { slug: 'hooks/form-table' },
          ],
        },
        {
          label: 'Components',
          translations: { 'zh-CN': '组件' },
          items: [
            { slug: 'components/crud-pages' },
            { slug: 'components/buttons' },
            { slug: 'components/autosave' },
          ],
        },
        {
          label: 'Reference',
          translations: { 'zh-CN': '参考' },
          autogenerate: { directory: 'reference' },
        },
      ],
    }),
  ],
});
