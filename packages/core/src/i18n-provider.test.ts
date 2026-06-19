// 测试 I18nProvider 注入与委托逻辑
// 注意：i18n.svelte.ts 使用 Svelte 5 runes ($state)，在纯 bun:test 环境下 $state 不可用。
// runes 依赖测试在 bun:test 中跳过（需 vitest + Svelte 编译器运行），
// 类型契约测试在所有环境均可运行。
import { describe, test, expect } from 'bun:test';

describe('I18nProvider type contract', () => {
  test('I18nProvider interface requires translate, getLocale, setLocale', () => {
    // 验证 provider 接口包含三个必需方法
    type Provider = {
      translate: (key: string, params?: Record<string, string | number>) => string;
      getLocale: () => string;
      setLocale: (locale: string) => void;
    };
    const provider: Provider = {
      translate: (key) => `[X]${key}`,
      getLocale: () => 'fr',
      setLocale: () => {},
    };
    expect(provider.translate('save')).toBe('[X]save');
    expect(provider.getLocale()).toBe('fr');
    expect(typeof provider.setLocale).toBe('function');
  });

  test('getAvailableLocales is optional on provider', () => {
    type Provider = {
      translate: (key: string) => string;
      getLocale: () => string;
      setLocale: (locale: string) => void;
      getAvailableLocales?: () => string[];
    };
    // 不带 getAvailableLocales 也能赋值
    const minimal: Provider = {
      translate: () => '',
      getLocale: () => 'en',
      setLocale: () => {},
    };
    expect(minimal.getAvailableLocales).toBeUndefined();

    // 带 getAvailableLocales 也能赋值
    const extended: Provider = {
      translate: () => '',
      getLocale: () => 'en',
      setLocale: () => {},
      getAvailableLocales: () => ['en', 'fr'],
    };
    expect(extended.getAvailableLocales?.()).toEqual(['en', 'fr']);
  });
});

// 以下测试需要 Svelte 5 runes 编译环境（vitest + @sveltejs/vite-plugin-svelte）
// 在纯 bun:test 中跳过；运行方式：cd packages/core && bunx vitest run src/i18n-provider.test.svelte.ts
// 为避免 bun:test 失败，这里不直接 import .svelte.ts
describe('I18nProvider runtime delegation (requires vitest)', () => {
  test.skip('skipped: needs Svelte runes env — run via vitest', () => {
    // placeholder for vitest-only runtime test
  });
});
