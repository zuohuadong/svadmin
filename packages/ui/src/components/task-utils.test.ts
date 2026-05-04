import { describe, expect, it } from 'vitest';
import type { TaskRecord } from '@svadmin/core';
import {
  canCancelTask,
  canRetryTask,
  isTaskActive,
  normalizeTaskStatus,
  resolveTaskCreatedAt,
  resolveTaskError,
  resolveTaskMessage,
  resolveTaskProgress,
  resolveTaskQueueName,
  resolveTaskResult,
  resolveTaskTitle,
  resolveTaskUpdatedAt,
} from './task-utils';

describe('task-utils', () => {
  it('normalizes task status aliases into lifecycle buckets', () => {
    expect(normalizeTaskStatus('pending')).toBe('queued');
    expect(normalizeTaskStatus('retry_scheduled')).toBe('queued');
    expect(normalizeTaskStatus('leased')).toBe('processing');
    expect(normalizeTaskStatus('RUNNING')).toBe('processing');
    expect(normalizeTaskStatus('succeeded')).toBe('completed');
    expect(normalizeTaskStatus('dead_lettered')).toBe('failed');
    expect(normalizeTaskStatus('canceled')).toBe('cancelled');
    expect(normalizeTaskStatus('not-a-real-status')).toBe('unknown');
    expect(normalizeTaskStatus(null)).toBe('unknown');
  });

  it('resolves task operation availability from normalized lifecycle', () => {
    expect(isTaskActive({ id: 'queued', status: 'scheduled' })).toBe(true);
    expect(isTaskActive({ id: 'processing', status: 'active' })).toBe(true);
    expect(isTaskActive({ id: 'done', status: 'completed' })).toBe(false);
    expect(canCancelTask({ id: 'leased', status: 'leased' })).toBe(true);
    expect(canCancelTask({ id: 'failed', status: 'failed' })).toBe(false);
    expect(canRetryTask({ id: 'failed', status: 'dead_lettered' })).toBe(true);
    expect(canRetryTask({ id: 'queued', status: 'queued' })).toBe(false);
  });

  it('resolves display fields with camelCase precedence over snake_case fallbacks', () => {
    const task: TaskRecord = {
      id: 'task-1',
      name: 'Fallback name',
      title: 'Primary title',
      queueName: 'emails',
      queue_name: 'legacy-emails',
      message: 'Primary message',
      errorMessage: 'Camel error message',
      error_message: 'Snake error message',
      result: { ok: true },
      result_data: { ok: false },
      error: { code: 'E_TASK' },
      createdAt: '2026-04-20T10:00:00.000Z',
      created_at: '2026-04-19T10:00:00.000Z',
      updatedAt: '2026-04-20T10:10:00.000Z',
      updated_at: '2026-04-19T10:10:00.000Z',
    };

    expect(resolveTaskTitle(task)).toBe('Primary title');
    expect(resolveTaskMessage(task)).toBe('Primary message');
    expect(resolveTaskQueueName(task)).toBe('emails');
    expect(resolveTaskResult(task)).toEqual({ ok: true });
    expect(resolveTaskError(task)).toEqual({ code: 'E_TASK' });
    expect(resolveTaskCreatedAt(task)).toBe('2026-04-20T10:00:00.000Z');
    expect(resolveTaskUpdatedAt(task)).toBe('2026-04-20T10:10:00.000Z');
  });

  it('uses snake_case and id fallbacks when primary fields are absent', () => {
    const task: TaskRecord = {
      id: 'task-2',
      queue_name: 'reports',
      error_message: 'Remote API timeout',
      result_data: { retryable: true },
      created_at: '2026-04-19T10:00:00.000Z',
      finished_at: '2026-04-19T10:10:00.000Z',
    };

    expect(resolveTaskTitle(task)).toBe('task-2');
    expect(resolveTaskMessage(task)).toBe('Remote API timeout');
    expect(resolveTaskQueueName(task)).toBe('reports');
    expect(resolveTaskResult(task)).toEqual({ retryable: true });
    expect(resolveTaskError(task)).toBe('Remote API timeout');
    expect(resolveTaskCreatedAt(task)).toBe('2026-04-19T10:00:00.000Z');
    expect(resolveTaskUpdatedAt(task)).toBe('2026-04-19T10:10:00.000Z');
  });

  it('returns undefined for absent optional fields', () => {
    const task: TaskRecord = { id: 'task-3' };

    expect(resolveTaskMessage(task)).toBeUndefined();
    expect(resolveTaskResult(task)).toBeUndefined();
    expect(resolveTaskError(task)).toBeUndefined();
    expect(resolveTaskCreatedAt(task)).toBeUndefined();
    expect(resolveTaskUpdatedAt(task)).toBeUndefined();
    expect(resolveTaskProgress(task)).toBeUndefined();
  });

  it('normalizes progress values', () => {
    expect(resolveTaskProgress({ id: 'rounded', progress: 42.6 })).toBe(43);
    expect(resolveTaskProgress({ id: 'low', progress: -5 })).toBe(0);
    expect(resolveTaskProgress({ id: 'high', progress: 120 })).toBe(100);
    expect(resolveTaskProgress({ id: 'invalid', progress: Number.NaN })).toBeUndefined();
    expect(resolveTaskProgress({ id: 'completed', status: 'success' })).toBe(100);
  });
});
