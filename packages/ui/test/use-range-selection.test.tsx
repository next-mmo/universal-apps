// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { addDays, rangeDayCount, rangeDayState, useRangeSelection } from '../src/lib/use-range-selection';
import type { DateRange, RangeSide, UseRangeSelectionOptions } from '../src/lib/use-range-selection';

const d = (day: number) => new Date(2026, 8, day);
const asRange = (from: number, to: number) => ({ from: d(from), to: d(to) });

function setup(options: UseRangeSelectionOptions = {}) {
  return renderHook((props: UseRangeSelectionOptions) => useRangeSelection(props), {
    initialProps: options,
  });
}

describe('useRangeSelection', () => {
  it('anchors on the first press without committing', () => {
    const onSelect = vi.fn<(range: DateRange) => void>();
    const onSelectInProgress = vi.fn<(range: DateRange, side: RangeSide) => void>();
    const { result } = setup({ onSelect, onSelectInProgress });

    act(() => result.current.press(d(10)));

    expect(onSelect).not.toHaveBeenCalled();
    expect(onSelectInProgress).toHaveBeenCalledWith({ from: d(10) }, 'start');
    expect(result.current.inProgress).toBe(true);
    expect(result.current.anchor).toEqual(d(10));
    expect(result.current.preview).toEqual({ from: d(10), to: d(10) });
  });

  it('commits the span on the second press', () => {
    const onSelect = vi.fn<(range: DateRange) => void>();
    const { result } = setup({ onSelect });

    act(() => result.current.press(d(10)));
    act(() => result.current.press(d(20)));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(asRange(10, 20));
    expect(result.current.inProgress).toBe(false);
    expect(result.current.anchor).toBeUndefined();
  });

  it('auto-swaps when the second press precedes the anchor', () => {
    const onSelect = vi.fn<(range: DateRange) => void>();
    const { result } = setup({ onSelect });

    act(() => result.current.press(d(20)));
    act(() => result.current.press(d(10)));

    expect(onSelect).toHaveBeenCalledWith(asRange(10, 20));
  });

  it('commits a one-day range when both presses hit the same day', () => {
    const onSelect = vi.fn<(range: DateRange) => void>();
    const { result } = setup({ onSelect });

    act(() => result.current.press(d(10)));
    act(() => result.current.press(d(10)));

    expect(onSelect).toHaveBeenCalledWith(asRange(10, 10));
  });

  it('previews the span from the anchor to the hovered day', () => {
    const onSelectInProgress = vi.fn<(range: DateRange, side: RangeSide) => void>();
    const { result } = setup({ onSelectInProgress });

    act(() => result.current.press(d(10)));
    act(() => result.current.hover(d(15)));

    expect(result.current.isPreviewing).toBe(true);
    expect(result.current.preview).toEqual(asRange(10, 15));
    expect(result.current.dayState(d(12))).toBe('middle');
    expect(onSelectInProgress).toHaveBeenLastCalledWith(asRange(10, 15), 'end');
  });

  it('normalizes a backwards hover preview', () => {
    const { result } = setup();

    act(() => result.current.press(d(20)));
    act(() => result.current.hover(d(12)));

    expect(result.current.preview).toEqual(asRange(12, 20));
  });

  it('ignores hover before an anchor exists', () => {
    const onSelectInProgress = vi.fn<(range: DateRange, side: RangeSide) => void>();
    const { result } = setup({ selected: asRange(4, 6), onSelectInProgress });

    act(() => result.current.hover(d(15)));

    expect(onSelectInProgress).not.toHaveBeenCalled();
    expect(result.current.preview).toEqual(asRange(4, 6));
    expect(result.current.selected).toEqual(asRange(4, 6));
  });

  it('extends the span to min days from the anchor', () => {
    const onSelect = vi.fn<(range: DateRange) => void>();
    const { result } = setup({ onSelect, min: 5 });

    act(() => result.current.press(d(10)));
    act(() => result.current.press(d(12)));

    expect(onSelect).toHaveBeenCalledWith(asRange(10, 14));
  });

  it('extends a backwards min span away from the anchor', () => {
    const onSelect = vi.fn<(range: DateRange) => void>();
    const { result } = setup({ onSelect, min: 5 });

    act(() => result.current.press(d(10)));
    act(() => result.current.press(d(8)));

    expect(onSelect).toHaveBeenCalledWith(asRange(6, 10));
  });

  it('trims the span to max days, keeping the anchor fixed', () => {
    const onSelect = vi.fn<(range: DateRange) => void>();
    const { result } = setup({ onSelect, max: 5 });

    act(() => result.current.press(d(10)));
    act(() => result.current.press(d(20)));

    expect(onSelect).toHaveBeenCalledWith(asRange(10, 14));
  });

  it('trims a backwards max span against the anchor', () => {
    const onSelect = vi.fn<(range: DateRange) => void>();
    const { result } = setup({ onSelect, max: 5 });

    act(() => result.current.press(d(20)));
    act(() => result.current.press(d(10)));

    expect(onSelect).toHaveBeenCalledWith(asRange(16, 20));
  });

  it('excludes blocked days by trimming the moving end', () => {
    const onSelect = vi.fn<(range: DateRange) => void>();
    const { result } = setup({ onSelect, excludeDisabled: true, disabledDate: (date) => date.getDate() === 14 });

    act(() => result.current.press(d(10)));
    act(() => result.current.press(d(20)));

    expect(onSelect).toHaveBeenCalledWith(asRange(10, 13));
  });

  it('excludes blocked days in a backwards span', () => {
    const onSelect = vi.fn<(range: DateRange) => void>();
    const { result } = setup({ onSelect, excludeDisabled: true, disabledDate: (date) => date.getDate() === 17 });

    act(() => result.current.press(d(20)));
    act(() => result.current.press(d(10)));

    expect(onSelect).toHaveBeenCalledWith(asRange(18, 20));
  });

  it('lets trimming win over min when the two conflict', () => {
    const onSelect = vi.fn<(range: DateRange) => void>();
    const { result } = setup({
      onSelect,
      min: 5,
      excludeDisabled: true,
      disabledDate: (date) => date.getDate() === 12,
    });

    act(() => result.current.press(d(10)));
    act(() => result.current.press(d(14)));

    expect(onSelect).toHaveBeenCalledWith(asRange(10, 11));
  });

  it('keeps the range when excludeDisabled finds no blocked day', () => {
    const onSelect = vi.fn<(range: DateRange) => void>();
    const { result } = setup({ onSelect, excludeDisabled: true, disabledDate: vi.fn<(date: Date, anchor?: Date) => boolean>(() => false) });

    act(() => result.current.press(d(10)));
    act(() => result.current.press(d(20)));

    expect(onSelect).toHaveBeenCalledWith(asRange(10, 20));
  });

  it('passes the anchor to an anchor-aware disabledDate', () => {
    const disabledDate = vi.fn<(date: Date, anchor?: Date) => boolean>(() => false);
    const { result } = setup({ disabledDate });

    act(() => result.current.press(d(10)));
    act(() => result.current.press(d(14)));

    expect(disabledDate).toHaveBeenLastCalledWith(d(14), d(10));
  });

  it('ignores a press on a disabled date', () => {
    const onSelect = vi.fn<(range: DateRange) => void>();
    const { result } = setup({ onSelect, disabledDate: (date) => date.getDate() === 10 });

    act(() => result.current.press(d(10)));

    expect(onSelect).not.toHaveBeenCalled();
    expect(result.current.inProgress).toBe(false);
  });

  it('ignores a second press the anchor-aware rule rejects', () => {
    const onSelect = vi.fn<(range: DateRange) => void>();
    const { result } = setup({
      onSelect,
      disabledDate: (date, anchor) => Boolean(anchor) && date.getDate() < anchor!.getDate(),
    });

    act(() => result.current.press(d(10)));
    act(() => result.current.press(d(5)));

    expect(onSelect).not.toHaveBeenCalled();
    expect(result.current.anchor).toEqual(d(10));
  });

  it('resets an in-progress pick on dismiss by default', () => {
    const onSelect = vi.fn<(range: DateRange) => void>();
    const { result } = setup({ onSelect, selected: asRange(1, 2) });

    act(() => result.current.press(d(10)));
    act(() => result.current.dismiss());

    expect(onSelect).not.toHaveBeenCalled();
    expect(result.current.inProgress).toBe(false);
    expect(result.current.preview).toEqual(asRange(1, 2));
  });

  it('clears the value on dismiss when commitBehavior is clear', () => {
    const onSelect = vi.fn<(range: DateRange) => void>();
    const { result } = setup({ onSelect, commitBehavior: 'clear' });

    act(() => result.current.press(d(10)));
    act(() => result.current.dismiss());

    expect(onSelect).toHaveBeenCalledWith({});
  });

  it('commits the anchor alone on dismiss when commitBehavior is select', () => {
    const onSelect = vi.fn<(range: DateRange) => void>();
    const { result } = setup({ onSelect, commitBehavior: 'select' });

    act(() => result.current.press(d(10)));
    act(() => result.current.dismiss());

    expect(onSelect).toHaveBeenCalledWith(asRange(10, 10));
  });

  it('leaves a plain dismiss alone when no pick is in progress', () => {
    const onSelect = vi.fn<(range: DateRange) => void>();
    const { result } = setup({ onSelect, commitBehavior: 'clear', selected: asRange(4, 6) });

    act(() => result.current.dismiss());

    expect(onSelect).not.toHaveBeenCalled();
    expect(result.current.preview).toEqual(asRange(4, 6));
  });

  it('clears through clear() and mirrors the controlled value back', () => {
    const onSelect = vi.fn<(range: DateRange) => void>();
    const { result, rerender } = setup({ onSelect, selected: asRange(4, 6) });

    act(() => result.current.clear());

    expect(onSelect).toHaveBeenCalledWith({});
    // Controlled: the preview follows the caller's value until it writes the clear back.
    expect(result.current.preview).toEqual(asRange(4, 6));

    rerender({ onSelect, selected: {} });
    expect(result.current.preview).toEqual({});
  });

  it('drops an in-progress anchor when clear() runs', () => {
    const onSelect = vi.fn<(range: DateRange) => void>();
    const { result } = setup({ onSelect });

    act(() => result.current.press(d(10)));
    act(() => result.current.clear());

    expect(onSelect).toHaveBeenCalledWith({});
    expect(result.current.inProgress).toBe(false);
    expect(result.current.preview).toEqual({});
  });
});

describe('range helpers', () => {
  it('reports start, middle, and end states', () => {
    const range = asRange(10, 20);
    expect(rangeDayState(range, d(10))).toBe('start');
    expect(rangeDayState(range, d(15))).toBe('middle');
    expect(rangeDayState(range, d(20))).toBe('end');
    expect(rangeDayState(range, d(9))).toBeNull();
    expect(rangeDayState(range, d(21))).toBeNull();
  });

  it('reports a one-day range as its start', () => {
    expect(rangeDayState(asRange(10, 10), d(10))).toBe('start');
  });

  it('treats a from-only range as that single day', () => {
    expect(rangeDayState({ from: d(10) }, d(10))).toBe('start');
    expect(rangeDayState({ from: d(10) }, d(11))).toBeNull();
  });

  it('counts days inclusively', () => {
    expect(rangeDayCount(d(10), d(10))).toBe(1);
    expect(rangeDayCount(d(10), d(20))).toBe(11);
  });

  it('adds days across month boundaries', () => {
    expect(addDays(new Date(2026, 8, 30), 3)).toEqual(new Date(2026, 9, 3));
  });
});
