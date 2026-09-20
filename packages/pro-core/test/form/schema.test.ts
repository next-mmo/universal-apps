import { describe, expect, it, vi } from 'vitest';

import { validateField } from '../../src/form/schema.ts';
import type { ProFieldSchema } from '../../src/form/schema.ts';

const field = (overrides: Partial<ProFieldSchema> = {}): ProFieldSchema => ({
  name: 'title',
  label: 'Title',
  type: 'text',
  ...overrides,
});

describe('validateField', () => {
  it('accepts a value for an optional field', () => {
    expect(validateField(field(), 'anything')).toBeUndefined();
  });

  it('accepts an empty value for an optional field', () => {
    expect(validateField(field(), '')).toBeUndefined();
    expect(validateField(field(), undefined)).toBeUndefined();
  });

  it('names the field in the required message', () => {
    const schema = field({ required: true, label: 'Job title' });
    expect(validateField(schema, undefined)).toBe('Job title is required');
  });

  it.each([undefined, null, ''])('rejects the missing value %p when required', (missing) => {
    expect(validateField(field({ required: true }), missing)).toBe('Title is required');
  });

  it('treats falsy but present values as satisfying a required field', () => {
    // `false` and `0` are real answers, not omissions.
    expect(validateField(field({ required: true, type: 'checkbox' }), false)).toBeUndefined();
    expect(validateField(field({ required: true, type: 'number' }), 0)).toBeUndefined();
  });

  it('returns the first validator error and stops', () => {
    const first = vi.fn<(value: unknown) => string | undefined>(() => 'first error');
    const second = vi.fn<(value: unknown) => string | undefined>(() => 'second error');
    const schema = field({ validators: [first, second] });

    expect(validateField(schema, 'value')).toBe('first error');
    expect(first).toHaveBeenCalledWith('value');
    expect(second).not.toHaveBeenCalled();
  });

  it('runs later validators when earlier ones pass', () => {
    const schema = field({
      validators: [() => undefined, () => 'too short'],
    });
    expect(validateField(schema, 'value')).toBe('too short');
  });

  it('passes the raw value to validators without coercion', () => {
    const validator = vi.fn<(value: unknown) => string | undefined>(() => undefined);
    const value = { nested: true };
    validateField(field({ validators: [validator] }), value);
    expect(validator).toHaveBeenCalledWith(value);
  });

  it('skips validators entirely when a required value is missing', () => {
    const validator = vi.fn<(value: unknown) => string | undefined>(() => undefined);
    const schema = field({ required: true, validators: [validator] });

    expect(validateField(schema, '')).toBe('Title is required');
    expect(validator).not.toHaveBeenCalled();
  });
});
