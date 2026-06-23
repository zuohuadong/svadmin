import { describe, expect, test } from 'bun:test';
import type { GetListResult } from './types';

describe('core types', () => {
  test('GetListResult preserves provider extension fields', () => {
    const result = {
      data: [{ id: 1 }],
      total: 1,
      summary: { locked: 2 },
      facets: { status: ['open', 'closed'] },
    } satisfies GetListResult;

    expect(result.summary.locked).toBe(2);
    expect(result.facets.status).toEqual(['open', 'closed']);
  });
});
