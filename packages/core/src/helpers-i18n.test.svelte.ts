import { describe, expect, it } from 'vitest';
import { deriveValidator } from './helpers';

describe('deriveValidator i18n capture', () => {
  it('uses the translator captured when the validator is created', () => {
    const validate = deriveValidator(
      [{ key: 'email', label: 'Email', type: 'email', required: true }],
      { translate: (key) => `scoped:${key}` },
    );

    expect(validate({ email: '' })).toEqual({ email: 'scoped:validation.required' });
    expect(validate({ email: 'invalid' })).toEqual({ email: 'scoped:validation.invalidEmail' });
  });
});
