// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Calendar } from '../src/components/ui/calendar.tsx';
import { DatePicker } from '../src/components/ui/date-picker.tsx';

const SEPTEMBER_2026 = new Date(2026, 8, 1);

// The heading is currently built from hard-coded English month names, unlike the day labels.
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const heading = (date: Date) => `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

// The component labels days with the runtime locale, so the expectations derive the same way
// instead of hard-coding English.
const dayLabel = (date: Date) =>
  new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric', year: 'numeric' }).format(date);

const day = (month: number, date: number) => dayLabel(new Date(2026, month, date));

const dayButtons = () =>
  screen.getAllByRole('button').filter((button) => /^\d+$/.test(button.textContent ?? ''));

describe('Calendar', () => {
  it('shows the requested month and year', () => {
    render(<Calendar month={SEPTEMBER_2026} />);
    expect(screen.getByText('September 2026')).toBeDefined();
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
    expect(screen.getByText('September 2026')).toBeDefined();
  });

  it('follows a value that is set programmatically from outside', () => {
    const { rerender } = render(<Calendar value={new Date(2026, 8, 10)} />);
    expect(screen.getByText('September 2026')).toBeDefined();

    // A form loading a record from another month must move the view with it.
    rerender(<Calendar value={new Date(2026, 4, 3)} />);
    expect(screen.getByText('May 2026')).toBeDefined();
  });

  it('does not fight a caller that also controls the month', () => {
    const { rerender } = render(<Calendar month={SEPTEMBER_2026} value={new Date(2026, 8, 10)} />);
    rerender(<Calendar month={SEPTEMBER_2026} value={new Date(2026, 4, 3)} />);
    // The controlled month wins over the value's month.
    expect(screen.getByText('September 2026')).toBeDefined();
  });
});

describe('DatePicker', () => {
  it('shows the placeholder while no date is chosen', () => {
    render(<DatePicker />);
    expect(screen.getByText('Pick a date...')).toBeDefined();
  });

  it('formats the chosen date', () => {
    render(<DatePicker value={new Date(2026, 8, 20)} />);
    expect(screen.getByText('Sep 20, 2026')).toBeDefined();
  });

  it('opens the calendar and reports the picked date', async () => {
    const onValueChange = vi.fn<(date: Date) => void>();
    render(<DatePicker value={new Date(2026, 8, 20)} onValueChange={onValueChange} />);

    await userEvent.click(screen.getByRole('button', { name: /Sep 20, 2026/i }));
    await userEvent.click(await screen.findByRole('button', { name: day(8, 25) }));

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0]![0].getDate()).toBe(25);
  });

  it('opens on the month of the current value', async () => {
    render(<DatePicker value={new Date(2026, 4, 3)} />);

    await userEvent.click(screen.getByRole('button', { name: /May 3, 2026/i }));

    expect(await screen.findByText('May 2026')).toBeDefined();
  });

  it('can be disabled', () => {
    render(<DatePicker disabled />);
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
  });
});
