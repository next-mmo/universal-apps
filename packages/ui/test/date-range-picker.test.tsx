// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DateRangePicker } from '../src/components/ui/date-range-picker.tsx';

const dayLabel = (date: Date, locale?: string) =>
  new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
const day = (month: number, date: number) => dayLabel(new Date(2026, month, date));
const heading = (date: Date, locale?: string) =>
  new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
const shortDate = (date: Date, locale?: string) =>
  new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
const rangeText = (from: Date, to: Date, locale?: string) =>
  `${shortDate(from, locale)} – ${shortDate(to, locale)}`;

// The trigger's accessible name is the full range, so it is opened by the value it displays.
const openPicker = async (from: Date, to: Date, locale?: string) =>
  userEvent.click(screen.getByRole('button', { name: rangeText(from, to, locale) }));
const pressDay = async (date: number) => userEvent.click(await screen.findByRole('button', { name: day(8, date) }));

describe('DateRangePicker', () => {
  it('shows the placeholder while no range is chosen', () => {
    render(<DateRangePicker />);
    expect(screen.getByText('Pick a range...')).toBeDefined();
  });

  it('formats the chosen range in the trigger', () => {
    render(<DateRangePicker value={[new Date(2026, 8, 1), new Date(2026, 8, 20)]} />);
    expect(screen.getByText(rangeText(new Date(2026, 8, 1), new Date(2026, 8, 20)))).toBeDefined();
  });

  it('commits the tuple after both days are pressed and closes', async () => {
    const onValueChange = vi.fn<(range: [Date, Date] | undefined) => void>();
    render(<DateRangePicker value={[new Date(2026, 8, 10), new Date(2026, 8, 10)]} onValueChange={onValueChange} />);

    await openPicker(new Date(2026, 8, 10), new Date(2026, 8, 10));
    await screen.findByText(heading(new Date(2026, 8, 1)));
    await pressDay(10);
    await pressDay(20);

    expect(onValueChange).toHaveBeenCalledTimes(1);
    const [from, to] = onValueChange.mock.calls[0]![0]!;
    expect([from.getDate(), to.getDate()]).toEqual([10, 20]);
    expect(screen.queryByText(heading(new Date(2026, 8, 1)))).toBeNull();
  });

  it('stays open after the first press without committing', async () => {
    const onValueChange = vi.fn<(range: [Date, Date] | undefined) => void>();
    render(<DateRangePicker value={[new Date(2026, 8, 1), new Date(2026, 8, 2)]} onValueChange={onValueChange} />);

    await openPicker(new Date(2026, 8, 1), new Date(2026, 8, 2));
    await pressDay(10);

    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByText(heading(new Date(2026, 8, 1)))).toBeDefined();
  });

  it('auto-swaps when the second press precedes the first', async () => {
    const onValueChange = vi.fn<(range: [Date, Date] | undefined) => void>();
    render(<DateRangePicker value={[new Date(2026, 8, 1), new Date(2026, 8, 2)]} onValueChange={onValueChange} />);

    await openPicker(new Date(2026, 8, 1), new Date(2026, 8, 2));
    await pressDay(20);
    await pressDay(10);

    const [from, to] = onValueChange.mock.calls[0]![0]!;
    expect([from.getDate(), to.getDate()]).toEqual([10, 20]);
  });

  it('applies min days through to the committed tuple', async () => {
    const onValueChange = vi.fn<(range: [Date, Date] | undefined) => void>();
    render(
      <DateRangePicker
        value={[new Date(2026, 8, 1), new Date(2026, 8, 2)]}
        onValueChange={onValueChange}
        min={5}
      />,
    );

    await openPicker(new Date(2026, 8, 1), new Date(2026, 8, 2));
    await pressDay(10);
    await pressDay(12);

    const [from, to] = onValueChange.mock.calls[0]![0]!;
    expect([from.getDate(), to.getDate()]).toEqual([10, 14]);
  });

  it('discards a mid-selection pick on dismiss by default', async () => {
    const onValueChange = vi.fn<(range: [Date, Date] | undefined) => void>();
    render(<DateRangePicker value={[new Date(2026, 8, 1), new Date(2026, 8, 2)]} onValueChange={onValueChange} />);

    await openPicker(new Date(2026, 8, 1), new Date(2026, 8, 2));
    await pressDay(10);
    await userEvent.keyboard('{Escape}');

    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.queryByText(heading(new Date(2026, 8, 1)))).toBeNull();
  });

  it('clears the value on a mid-selection dismiss when commitBehavior is clear', async () => {
    const onValueChange = vi.fn<(range: [Date, Date] | undefined) => void>();
    render(
      <DateRangePicker
        value={[new Date(2026, 8, 1), new Date(2026, 8, 2)]}
        onValueChange={onValueChange}
        commitBehavior='clear'
      />,
    );

    await openPicker(new Date(2026, 8, 1), new Date(2026, 8, 2));
    await pressDay(10);
    await userEvent.keyboard('{Escape}');

    expect(onValueChange).toHaveBeenCalledWith(undefined);
  });

  it('commits the start day alone on a mid-selection dismiss when commitBehavior is select', async () => {
    const onValueChange = vi.fn<(range: [Date, Date] | undefined) => void>();
    render(
      <DateRangePicker
        value={[new Date(2026, 8, 1), new Date(2026, 8, 2)]}
        onValueChange={onValueChange}
        commitBehavior='select'
      />,
    );

    await openPicker(new Date(2026, 8, 1), new Date(2026, 8, 2));
    await pressDay(10);
    await userEvent.keyboard('{Escape}');

    const [from, to] = onValueChange.mock.calls[0]![0]!;
    expect([from.getDate(), to.getDate()]).toEqual([10, 10]);
  });

  it('leaves a dismissed picker alone when nothing was in progress', async () => {
    const onValueChange = vi.fn<(range: [Date, Date] | undefined) => void>();
    render(
      <DateRangePicker value={[new Date(2026, 8, 1), new Date(2026, 8, 2)]} onValueChange={onValueChange} commitBehavior='clear' />,
    );

    await openPicker(new Date(2026, 8, 1), new Date(2026, 8, 2));
    await userEvent.keyboard('{Escape}');

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('can be disabled', () => {
    render(<DateRangePicker disabled />);
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
  });

  it('opens on the month of the current value', async () => {
    render(<DateRangePicker value={[new Date(2026, 4, 3), new Date(2026, 4, 9)]} />);

    await openPicker(new Date(2026, 4, 3), new Date(2026, 4, 9));

    expect(await screen.findByText(heading(new Date(2026, 4, 1)))).toBeDefined();
  });

  it('threads a pinned locale through the trigger and the calendar', async () => {
    render(<DateRangePicker value={[new Date(2026, 8, 1), new Date(2026, 8, 20)]} locale='fr-FR' />);

    await openPicker(new Date(2026, 8, 1), new Date(2026, 8, 20), 'fr-FR');

    expect(await screen.findByText(heading(new Date(2026, 8, 1), 'fr-FR'))).toBeDefined();
  });

  it('marks the committed span in the calendar', async () => {
    render(<DateRangePicker value={[new Date(2026, 8, 10), new Date(2026, 8, 20)]} />);

    await openPicker(new Date(2026, 8, 10), new Date(2026, 8, 20));

    expect((await screen.findByRole('button', { name: `${dayLabel(new Date(2026, 8, 15))}, in selected range` })).getAttribute('data-range')).toBe('middle');
    expect(screen.getByRole('button', { name: dayLabel(new Date(2026, 8, 10)) }).getAttribute('data-range')).toBe('start');
    expect(screen.getByRole('button', { name: dayLabel(new Date(2026, 8, 20)) }).getAttribute('data-range')).toBe('end');
  });
});
