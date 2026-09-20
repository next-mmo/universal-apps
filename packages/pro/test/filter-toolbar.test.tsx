// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ProFilterToolbar } from '../src/table/pro-filter-toolbar.tsx';
import type { FilterField } from '../src/table/pro-filter-toolbar.tsx';

const fields: FilterField[] = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Open', value: 'open' }] },
];

describe('ProFilterToolbar', () => {
  it('renders a labelled control per field', () => {
    render(<ProFilterToolbar fields={fields} onFilter={vi.fn<(filters: Record<string, unknown>) => void>()} />);

    expect(screen.getByLabelText('Name')).toBeDefined();
    expect(screen.getByLabelText('Status')).toBeDefined();
  });

  it('seeds the controls from the field defaults', () => {
    render(
      <ProFilterToolbar
        fields={[{ name: 'name', label: 'Name', type: 'text', defaultValue: 'preset' }]}
        onFilter={vi.fn<(filters: Record<string, unknown>) => void>()}
      />,
    );

    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('preset');
  });

  it('updates the control as the user types', async () => {
    render(<ProFilterToolbar fields={fields} onFilter={vi.fn<(filters: Record<string, unknown>) => void>()} />);

    await userEvent.type(screen.getByLabelText('Name'), 'alp');

    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('alp');
  });

  it('hands the typed values to onFilter', async () => {
    const onFilter = vi.fn<(filters: Record<string, unknown>) => void>();
    render(<ProFilterToolbar fields={fields} onFilter={onFilter} />);

    await userEvent.type(screen.getByLabelText('Name'), 'alp');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(onFilter).toHaveBeenCalledWith(expect.objectContaining({ name: 'alp' }));
  });

  it('searches on Enter from a text field', async () => {
    const onFilter = vi.fn<(filters: Record<string, unknown>) => void>();
    render(<ProFilterToolbar fields={fields} onFilter={onFilter} />);

    await userEvent.type(screen.getByLabelText('Name'), 'alp{Enter}');

    expect(onFilter).toHaveBeenCalledWith(expect.objectContaining({ name: 'alp' }));
  });

  it('seeds from the supplied values without a writer', async () => {
    render(<ProFilterToolbar fields={fields} values={{ name: 'seeded' }} onFilter={vi.fn<(filters: Record<string, unknown>) => void>()} />);

    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('seeded');
  });

  it('starts from the supplied values and still accepts edits when uncontrolled', async () => {
    const onFilter = vi.fn<(filters: Record<string, unknown>) => void>();
    render(<ProFilterToolbar fields={fields} values={{ name: 'seeded' }} onFilter={onFilter} />);

    await userEvent.clear(screen.getByLabelText('Name'));
    await userEvent.type(screen.getByLabelText('Name'), 'edited');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    // Supplying `values` without `onValuesChange` must not make the toolbar read-only.
    expect(onFilter).toHaveBeenCalledWith(expect.objectContaining({ name: 'edited' }));
  });

  it('reports each edit to a controlled caller', async () => {
    const onValuesChange = vi.fn<(values: Record<string, unknown>) => void>();
    render(
      <ProFilterToolbar fields={fields} values={{}} onValuesChange={onValuesChange} onFilter={vi.fn<(filters: Record<string, unknown>) => void>()} />,
    );

    await userEvent.type(screen.getByLabelText('Name'), 'a');

    expect(onValuesChange).toHaveBeenCalledWith(expect.objectContaining({ name: 'a' }));
  });

  it('displays what a controlled caller passes back', async () => {
    const onValuesChange = vi.fn<(values: Record<string, unknown>) => void>();
    const { rerender } = render(
      <ProFilterToolbar fields={fields} values={{}} onValuesChange={onValuesChange} onFilter={vi.fn<(filters: Record<string, unknown>) => void>()} />,
    );

    rerender(
      <ProFilterToolbar
        fields={fields}
        values={{ name: 'from caller' }}
        onValuesChange={onValuesChange}
        onFilter={vi.fn<(filters: Record<string, unknown>) => void>()}
      />,
    );

    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('from caller');
  });

  it('searches with the values the caller last supplied', async () => {
    const onFilter = vi.fn<(filters: Record<string, unknown>) => void>();
    render(
      <ProFilterToolbar
        fields={fields}
        values={{ name: 'from caller' }}
        onValuesChange={vi.fn<(values: Record<string, unknown>) => void>()}
        onFilter={onFilter}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    // A controlled toolbar must not report the stale map it was handed.
    expect(onFilter).toHaveBeenCalledWith(expect.objectContaining({ name: 'from caller' }));
  });

  it('resets to the field defaults and reports them', async () => {
    const onFilter = vi.fn<(filters: Record<string, unknown>) => void>();
    const onReset = vi.fn<() => void>();
    render(
      <ProFilterToolbar
        fields={[{ name: 'name', label: 'Name', type: 'text', defaultValue: 'preset' }]}
        onFilter={onFilter}
        onReset={onReset}
      />,
    );

    await userEvent.clear(screen.getByLabelText('Name'));
    await userEvent.click(screen.getByRole('button', { name: /reset/i }));

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(onFilter).toHaveBeenCalledWith(expect.objectContaining({ name: 'preset' }));
    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('preset');
  });

  it('uses the caller’s button labels', () => {
    render(<ProFilterToolbar fields={fields} onFilter={vi.fn<(filters: Record<string, unknown>) => void>()} searchLabel='Apply' resetLabel='Clear' />);

    expect(screen.getByRole('button', { name: /apply/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /clear/i })).toBeDefined();
  });

  it('collapses the fields beyond the threshold', () => {
    const many: FilterField[] = Array.from({ length: 5 }, (_, i) => ({
      name: `f${i}`,
      label: `Field ${i}`,
      type: 'text' as const,
    }));
    render(<ProFilterToolbar fields={many} onFilter={vi.fn<(filters: Record<string, unknown>) => void>()} collapseThreshold={2} />);

    expect(screen.getByLabelText('Field 0')).toBeDefined();
    expect(screen.queryByLabelText('Field 4')).toBeNull();
    expect(screen.getByRole('button', { name: /more/i }).getAttribute('aria-expanded')).toBe('false');
  });

  it('reveals the hidden fields when expanded', async () => {
    const many: FilterField[] = Array.from({ length: 5 }, (_, i) => ({
      name: `f${i}`,
      label: `Field ${i}`,
      type: 'text' as const,
    }));
    render(<ProFilterToolbar fields={many} onFilter={vi.fn<(filters: Record<string, unknown>) => void>()} collapseThreshold={2} />);

    await userEvent.click(screen.getByRole('button', { name: /more/i }));

    expect(screen.getByLabelText('Field 4')).toBeDefined();
    expect(screen.getByRole('button', { name: /collapse/i }).getAttribute('aria-expanded')).toBe('true');
  });

  it('offers no collapse control when every field fits', () => {
    render(<ProFilterToolbar fields={fields} onFilter={vi.fn<(filters: Record<string, unknown>) => void>()} collapseThreshold={5} />);

    expect(screen.queryByRole('button', { name: /more/i })).toBeNull();
  });

  it('ignores a non-Date value in a date field instead of crashing', () => {
    // A date filter commonly arrives as a string from a query string.
    render(
      <ProFilterToolbar
        fields={[{ name: 'from', label: 'From', type: 'date' }]}
        values={{ from: '2026-09-20' }}
        onFilter={vi.fn<(filters: Record<string, unknown>) => void>()}
      />,
    );

    expect(screen.getByLabelText('From')).toBeDefined();
    expect(screen.getByText('Pick date...')).toBeDefined();
  });

  it('shows a Date value in a date field', () => {
    render(
      <ProFilterToolbar
        fields={[{ name: 'from', label: 'From', type: 'date' }]}
        values={{ from: new Date(2026, 8, 20) }}
        onFilter={vi.fn<(filters: Record<string, unknown>) => void>()}
      />,
    );

    expect(screen.getByText('Sep 20, 2026')).toBeDefined();
  });
});
