import { describe, expect, test } from 'vitest';
import type { TaskRecord } from '@svadmin/core';
import {
  resolveTaskCreatedAt,
  resolveTaskError,
  resolveTaskMessage,
  resolveTaskResult,
  resolveTaskUpdatedAt,
} from './task-utils';

describe('task-utils compatibility resolvers', () => {
  test('skips nullable timestamp fields using lifecycle fallback order', () => {
    const task: TaskRecord = {
      id: 'task-1',
      updatedAt: null,
      updated_at: null,
      finishedAt: null,
      finished_at: null,
      startedAt: null,
      started_at: '2026-04-26T01:00:00.000Z',
      createdAt: null,
      created_at: '2026-04-26T00:00:00.000Z',
    };

    expect(resolveTaskUpdatedAt(task)).toBe('2026-04-26T01:00:00.000Z');
    expect(resolveTaskCreatedAt(task)).toBe('2026-04-26T00:00:00.000Z');
  });

  test('keeps documented result and error fallback priority with null fields', () => {
    const task: TaskRecord = {
      id: 'task-2',
      result: null,
      result_data: { url: 'https://example.test/result.png' },
      error: null,
      errorMessage: null,
      error_message: 'Remote worker failed',
      message: null,
    };

    expect(resolveTaskResult(task)).toEqual({ url: 'https://example.test/result.png' });
    expect(resolveTaskError(task)).toBe('Remote worker failed');
    expect(resolveTaskMessage(task)).toBe('Remote worker failed');
  });
});
