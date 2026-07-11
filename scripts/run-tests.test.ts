import { describe, expect, test } from 'bun:test';
import { join } from 'node:path';
import { customVitestConfigTestPrefix, testsForCustomVitestConfig } from './run-tests';

describe('customVitestConfigTestPrefix', () => {
  test('discovers standard and suffixed custom Vitest configs', () => {
    expect(customVitestConfigTestPrefix('src/security.test.config.ts')).toBe('security.test');
    expect(customVitestConfigTestPrefix('src/admin-app.context.test-ssr.config.ts')).toBe(
      'admin-app.context.test-ssr',
    );
  });

  test('ignores default and unrelated config files', () => {
    expect(customVitestConfigTestPrefix('vitest.config.ts')).toBeNull();
    expect(customVitestConfigTestPrefix('src/security.integration.config.ts')).toBeNull();
    expect(customVitestConfigTestPrefix('src/security.test.config.js')).toBeNull();
    expect(customVitestConfigTestPrefix('src/security.tested.config.ts')).toBeNull();
  });
});

describe('testsForCustomVitestConfig', () => {
  const packageDirectory = join(process.cwd(), 'packages', 'ui');

  test('maps a custom config only to test files sharing its full prefix', () => {
    expect(
      testsForCustomVitestConfig(
        join(packageDirectory, 'src', 'components', 'admin-app.context.test-ssr.config.ts'),
        [
          join(packageDirectory, 'src', 'components', 'admin-app.context.test-ssr.spec.integration.ts'),
          join(packageDirectory, 'src', 'components', 'admin-app.context.test.integration.ts'),
          join(packageDirectory, 'src', 'components', 'toast-host.test-ssr.spec.integration.ts'),
        ],
        packageDirectory,
      ),
    ).toEqual(['src/components/admin-app.context.test-ssr.spec.integration.ts']);
  });

  test('fails closed when a custom config has no matching test file', () => {
    expect(() =>
      testsForCustomVitestConfig(
        join(packageDirectory, 'src', 'components', 'missing.test-ssr.config.ts'),
        [join(packageDirectory, 'src', 'components', 'admin-app.context.test-ssr.spec.integration.ts')],
        packageDirectory,
      ),
    ).toThrow('does not match any Vitest test files');
  });
});
