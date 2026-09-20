import { afterEach, describe, expect, it, vi } from 'vitest';

import { createTodo, reserveTodoIds } from '../src/todo.ts';

afterEach(() => {
  vi.useRealTimers();
});

describe('createTodo', () => {
  it('creates a not-done todo carrying the given text', () => {
    const todo = createTodo('write tests');
    expect(todo.text).toBe('write tests');
    expect(todo.done).toBe(false);
  });

  it('gives every todo a unique id even inside a single millisecond', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const ids = [createTodo('a').id, createTodo('b').id, createTodo('c').id];

    // Duplicate ids break React keys and make toggle/remove address the wrong row.
    expect(new Set(ids).size).toBe(3);
  });

  it('keeps ids increasing so a newer todo sorts after an older one', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const first = createTodo('a').id;
    const second = createTodo('b').id;

    expect(second).toBeGreaterThan(first);
  });

  it('stays ahead of a clock that moves backwards', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const first = createTodo('a').id;

    // A corrected system clock must not hand out an id that was already used.
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
    const second = createTodo('b').id;

    expect(second).toBeGreaterThan(first);
  });

  it('does not reuse an id that a previous session already persisted', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const persisted = { id: 9_999_999_999_999, text: 'from disk', done: false };

    reserveTodoIds([persisted]);
    const created = createTodo('new');

    expect(created.id).toBeGreaterThan(persisted.id);
  });
});
