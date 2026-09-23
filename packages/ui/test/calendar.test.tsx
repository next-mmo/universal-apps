// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Calendar } from '../src/components/ui/calendar.tsx';
import { DatePicker } from '../src/components/ui/date-picker.tsx';

const SEPTEMBER_2026 = new Date(2026, 8, 1);

// The component formats through `Intl` — at the runtime locale, or at a pinned `locale` prop —
// so the expectations derive the same way instead of hard-coding English.
const heading = (date: Date, locale?: string) =>
  new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);

const dayLabel = (date: Date, locale?: string) =>
  new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric', year: 'numeric' }).format(date);

const shortDate = (date: Date, locale?: string) =>
  new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);

const weekday = (date: Date, locale?: string) =>
  new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);

const day = (month: number, date: number) => dayLabel(new Date(2026, month, date));

const dayButtons = () =>
  screen.getAllByRole('button').filter((button) => /^\d+$/.test(button.textContent ?? ''));

describe('Calendar', () => {
  it('shows the requested month and year', () => {
    render(<Calendar month={SEPTEMBER_2026} />);
    expect(screen.getByText(heading(new Date(2026, 8, 1)))).toBeDefined();
  });

  it('formats the heading, weekdays, and day labels in a pinned locale', () => {
    render(<Calendar month={SEPTEMBER_2026} locale='fr-FR' />);

    expect(screen.getByText(heading(new Date(2026, 8, 1), 'fr-FR'))).toBeDefined();
    // The weekday header localizes too; only the grid order stays Sunday-first.
    expect(screen.getByText(weekday(new Date(2024, 0, 7), 'fr-FR'))).toBeDefined();
    expect(screen.getByRole('button', { name: dayLabel(new Date(2026, 8, 20), 'fr-FR') })).toBeDefined();
  });

  it('renders one button per day of the month', () => {
    render(<Calendar month={SEPTEMBER_2026} />);
    // September has 30 days.
    expect(dayButtons()).toHaveLength(30);
  });

  it('renders 29 days for a leap February and 28 otherwise', () => {
    const { unmount } = render(<Calendar month={new Date(2028, 1, 1)} />);
    expect(dayButtons()).toHaveLength(29);
    unmount();

    render(<Calendar month={new Date(2026, 1, 1)} />);
    expect(dayButtons()).toHaveLength(28);
  });

  it('reports the clicked day as a local-midnight Date', async () => {
    const onValueChange = vi.fn<(date: Date) => void>();
    render(<Calendar month={SEPTEMBER_2026} onValueChange={onValueChange} />);

    await userEvent.click(screen.getByRole('button', { name: day(8, 20) }));

    expect(onValueChange).toHaveBeenCalledTimes(1);
    const picked = onValueChange.mock.calls[0]![0];
    expect(picked.getFullYear()).toBe(2026);
    expect(picked.getMonth()).toBe(8);
    expect(picked.getDate()).toBe(20);
  });

  it('gives each day an accessible name with its full date', () => {
    render(<Calendar month={SEPTEMBER_2026} />);
    // "20" alone is meaningless to a screen reader.
    expect(screen.getByRole('button', { name: day(8, 20) })).toBeDefined();
  });

  it('names the month navigation buttons', () => {
    render(<Calendar month={SEPTEMBER_2026} />);
    expect(screen.getByRole('button', { name: /previous month/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /next month/i })).toBeDefined();
  });

  it('marks the selected day as pressed', () => {
    render(<Calendar month={SEPTEMBER_2026} value={new Date(2026, 8, 15)} />);
    expect(screen.getByRole('button', { name: day(8, 15) }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: day(8, 16) }).getAttribute('aria-pressed')).toBe('false');
  });

  it('marks today as the current date', () => {
    const today = new Date();
    render(<Calendar month={new Date(today.getFullYear(), today.getMonth(), 1)} />);
    expect(screen.getByRole('button', { name: dayLabel(today) }).getAttribute('aria-current')).toBe('date');
  });

  it('does not mark a day in another month as today', () => {
    // September 2026 cannot contain today unless today happens to be in it.
    const today = new Date();
    if (today.getFullYear() === 2026 && today.getMonth() === 8) return;
    render(<Calendar month={SEPTEMBER_2026} />);
    const marked = screen
      .getAllByRole('button')
      .filter((button) => button.getAttribute('aria-current') === 'date');
    expect(marked).toHaveLength(0);
  });

  it('disables the days the caller rejects', async () => {
    const onValueChange = vi.fn<(date: Date) => void>();
    render(
      <Calendar
        month={SEPTEMBER_2026}
        onValueChange={onValueChange}
        disabled={(date) => date.getDate() < 10}
      />,
    );

    const blocked = screen.getByRole('button', { name: day(8, 5) });
    expect((blocked as HTMLButtonElement).disabled).toBe(true);

    await userEvent.click(blocked);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('moves to the next and previous month when uncontrolled', async () => {
    // Seeded through `value` rather than `month`, so the month stays uncontrolled and can move.
    render(<Calendar value={new Date(2026, 8, 10)} />);
    expect(screen.getByText(heading(new Date(2026, 8, 1)))).toBeDefined();

    await userEvent.click(screen.getByRole('button', { name: /next month/i }));
    expect(screen.getByText(heading(new Date(2026, 9, 1)))).toBeDefined();
    // October has 31 days, so the grid actually changed rather than only the heading.
    expect(dayButtons()).toHaveLength(31);

    await userEvent.click(screen.getByRole('button', { name: /previous month/i }));
    expect(screen.getByText(heading(new Date(2026, 8, 1)))).toBeDefined();
    expect(dayButtons()).toHaveLength(30);
  });

  it('rolls the year over correctly in both directions', async () => {
    render(<Calendar value={new Date(2026, 11, 10)} />);

    await userEvent.click(screen.getByRole('button', { name: /next month/i }));
    expect(screen.getByText(heading(new Date(2027, 0, 1)))).toBeDefined();

    await userEvent.click(screen.getByRole('button', { name: /previous month/i }));
    await userEvent.click(screen.getByRole('button', { name: /previous month/i }));
    expect(screen.getByText(heading(new Date(2026, 10, 1)))).toBeDefined();
  });

  it('reports month navigation to the caller when the month is controlled', async () => {
    const onMonthChange = vi.fn<(month: Date) => void>();
    render(<Calendar month={SEPTEMBER_2026} onMonthChange={onMonthChange} />);

    await userEvent.click(screen.getByRole('button', { name: /next month/i }));

    expect(onMonthChange).toHaveBeenCalledTimes(1);
    expect(onMonthChange.mock.calls[0]![0].getMonth()).toBe(9);
    // A controlled month must not move on its own.
    expect(screen.getByText(heading(new Date(2026, 8, 1)))).toBeDefined();
  });

  it('follows a value that is set programmatically from outside', () => {
    const { rerender } = render(<Calendar value={new Date(2026, 8, 10)} />);
    expect(screen.getByText(heading(new Date(2026, 8, 1)))).toBeDefined();

    // A form loading a record from another month must move the view with it.
    rerender(<Calendar value={new Date(2026, 4, 3)} />);
    expect(screen.getByText(heading(new Date(2026, 4, 1)))).toBeDefined();
  });

  it('does not fight a caller that also controls the month', () => {
    const { rerender } = render(<Calendar month={SEPTEMBER_2026} value={new Date(2026, 8, 10)} />);
    rerender(<Calendar month={SEPTEMBER_2026} value={new Date(2026, 4, 3)} />);
    // The controlled month wins over the value's month.
    expect(screen.getByText(heading(new Date(2026, 8, 1)))).toBeDefined();
  });
});

describe('Calendar range mode', () => {
  const range = { from: new Date(2026, 8, 10), to: new Date(2026, 8, 20) };
  const stateOf = (date: Date) =>
    screen.getByRole('button', { name: new RegExp(`^${dayLabel(date)}`) }).getAttribute('data-range');
  const pressed = (date: Date) =>
    screen.getByRole('button', { name: new RegExp(`^${dayLabel(date)}`) }).getAttribute('aria-pressed');

  it('marks the committed span with start, middle, and end states', () => {
    render(<Calendar mode='range' month={SEPTEMBER_2026} selected={range} />);

    expect(stateOf(new Date(2026, 8, 10))).toBe('start');
    expect(stateOf(new Date(2026, 8, 15))).toBe('middle');
    expect(stateOf(new Date(2026, 8, 20))).toBe('end');
    expect(stateOf(new Date(2026, 8, 9))).toBeNull();
    expect(stateOf(new Date(2026, 8, 21))).toBeNull();
  });

  it('presses the span ends and not the middle', () => {
    render(<Calendar mode='range' month={SEPTEMBER_2026} selected={range} />);

    expect(pressed(new Date(2026, 8, 10))).toBe('true');
    expect(pressed(new Date(2026, 8, 20))).toBe('true');
    expect(pressed(new Date(2026, 8, 15))).toBe('false');
  });

  it('announces middle days as part of the selected range', () => {
    render(<Calendar mode='range' month={SEPTEMBER_2026} selected={range} />);
    // "September 15, 2026, in selected range" — the day number alone would hide the range membership.
    expect(screen.getByRole('button', { name: `${dayLabel(new Date(2026, 8, 15))}, in selected range` })).toBeDefined();
  });

  it('renders the preview span instead of the committed one while picking', () => {
    render(
      <Calendar
        mode='range'
        month={SEPTEMBER_2026}
        selected={{ from: new Date(2026, 8, 2), to: new Date(2026, 8, 3) }}
        preview={{ from: new Date(2026, 8, 10), to: new Date(2026, 8, 14) }}
      />,
    );

    expect(stateOf(new Date(2026, 8, 10))).toBe('start');
    expect(stateOf(new Date(2026, 8, 14))).toBe('end');
    expect(stateOf(new Date(2026, 8, 2))).toBeNull();
  });

  it('reports the pressed day through onSelect', async () => {
    const onSelect = vi.fn<(date: Date) => void>();
    render(<Calendar mode='range' month={SEPTEMBER_2026} selected={range} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole('button', { name: day(8, 25) }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]![0].getDate()).toBe(25);
  });

  it('previews the hovered day and clears on leave', async () => {
    const onHoverChange = vi.fn<(date: Date | null) => void>();
    render(
      <Calendar mode='range' month={SEPTEMBER_2026} selected={{ from: new Date(2026, 8, 10), to: new Date(2026, 8, 10) }} onHoverChange={onHoverChange} />,
    );

    await userEvent.hover(screen.getByRole('button', { name: day(8, 15) }));
    expect(onHoverChange).toHaveBeenLastCalledWith(new Date(2026, 8, 15));

    await userEvent.unhover(screen.getByRole('button', { name: day(8, 15) }));
    expect(onHoverChange).toHaveBeenLastCalledWith(null);
  });

  it('disables the days the range rule rejects and forwards the anchor', () => {
    const disabledDate = vi.fn<(date: Date, anchor?: Date) => boolean>(
      (date, anchor) => Boolean(anchor) && date.getDate() < anchor!.getDate(),
    );
    render(
      <Calendar
        mode='range'
        month={SEPTEMBER_2026}
        selected={{ from: new Date(2026, 8, 10) }}
        anchor={new Date(2026, 8, 10)}
        disabledDate={disabledDate}
      />,
    );

    expect((screen.getByRole('button', { name: day(8, 5) }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: day(8, 15) }) as HTMLButtonElement).disabled).toBe(false);
    expect(disabledDate).toHaveBeenCalledWith(new Date(2026, 8, 5), new Date(2026, 8, 10));
  });

  it('rounds and presses a one-day range', () => {
    render(<Calendar mode='range' month={SEPTEMBER_2026} selected={{ from: new Date(2026, 8, 10), to: new Date(2026, 8, 10) }} />);

    const dayButton = screen.getByRole('button', { name: day(8, 10) });
    expect(dayButton.getAttribute('data-range')).toBe('start');
    expect(dayButton.getAttribute('aria-pressed')).toBe('true');
  });
});

describe('DatePicker', () => {
  it('shows the placeholder while no date is chosen', () => {
    render(<DatePicker />);
    expect(screen.getByText('Pick a date...')).toBeDefined();
  });

  it('formats the chosen date', () => {
    render(<DatePicker value={new Date(2026, 8, 20)} />);
    expect(screen.getByText(shortDate(new Date(2026, 8, 20)))).toBeDefined();
  });

  it('opens the calendar and reports the picked date', async () => {
    const onValueChange = vi.fn<(date: Date) => void>();
    render(<DatePicker value={new Date(2026, 8, 20)} onValueChange={onValueChange} />);

    await userEvent.click(screen.getByRole('button', { name: shortDate(new Date(2026, 8, 20)) }));
    await userEvent.click(await screen.findByRole('button', { name: day(8, 25) }));

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0]![0].getDate()).toBe(25);
  });

  it('opens on the month of the current value', async () => {
    render(<DatePicker value={new Date(2026, 4, 3)} />);

    await userEvent.click(screen.getByRole('button', { name: shortDate(new Date(2026, 4, 3)) }));

    expect(await screen.findByText(heading(new Date(2026, 4, 1)))).toBeDefined();
  });

  it('threads a pinned locale to the trigger and the calendar', async () => {
    render(<DatePicker value={new Date(2026, 8, 20)} locale='fr-FR' />);

    await userEvent.click(screen.getByRole('button', { name: shortDate(new Date(2026, 8, 20), 'fr-FR') }));

    expect(await screen.findByText(heading(new Date(2026, 8, 1), 'fr-FR'))).toBeDefined();
  });

  it('can be disabled', () => {
    render(<DatePicker disabled />);
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
  });
});
