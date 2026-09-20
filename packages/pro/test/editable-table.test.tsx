// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { EditableProTable } from '../src/table/editable-pro-table.tsx';
import type { ProColumnDef } from '@package/pro-core/table';

type Row = { id: string; name: string; score: number };

const columns: Array<ProColumnDef<Row>> = [
  { key: 'name', header: 'Name', valueType: 'text' },
  { key: 'score', header: 'Score', valueType: 'number' },
];

const rows: Row[] = [
  { id: '1', name: 'Alpha', score: 10 },
  { id: '2', name: 'Beta', score: 20 },
];

const renderTable = (props: Partial<Parameters<typeof EditableProTable<Row>>[0]> = {}) =>
  render(<EditableProTable<Row> columns={columns} value={rows} getRowId={(row) => row.id} {...props} />);

const rowFor = (name: string) => screen.getByRole('row', { name: new RegExp(name) });

describe('EditableProTable', () => {
  it('renders a row per record and an actions column', () => {
    renderTable();

    expect(screen.getByText('Alpha')).toBeDefined();
    expect(screen.getByText('Beta')).toBeDefined();
    expect(screen.getByRole('columnheader', { name: 'Actions' })).toBeDefined();
  });

  it('starts each row read-only', () => {
    renderTable();

    expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(2);
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
  });

  it('renders the caller’s empty state', () => {
    render(<EditableProTable<Row> columns={columns} value={[]} empty={<span>Nothing yet</span>} />);

    expect(screen.getByText('Nothing yet')).toBeDefined();
  });

  it('renders a loading skeleton instead of rows', () => {
    renderTable({ loading: true });

    expect(screen.queryByText('Alpha')).toBeNull();
  });

  it('enters edit mode when Edit is clicked', async () => {
    renderTable();

    await userEvent.click(within(rowFor('Alpha')).getByRole('button', { name: 'Edit' }));

    expect(within(rowFor('Alpha')).getByRole('button', { name: 'Save' })).toBeDefined();
    expect(within(rowFor('Alpha')).getByDisplayValue('Alpha')).toBeDefined();
  });

  it('enters edit mode when the caller supplies initial editableKeys without a writer', async () => {
    // `editableKeys` without `onChange` used to leave the component unable to start editing at all.
    renderTable({ editable: { editableKeys: [] } });

    await userEvent.click(within(rowFor('Alpha')).getByRole('button', { name: 'Edit' }));

    expect(within(rowFor('Alpha')).getByRole('button', { name: 'Save' })).toBeDefined();
  });

  it('reports every key change to a controlled caller', async () => {
    const onChange = vi.fn<(keys: string[]) => void>();
    renderTable({ editable: { editableKeys: [], onChange } });

    await userEvent.click(within(rowFor('Alpha')).getByRole('button', { name: 'Edit' }));

    expect(onChange).toHaveBeenCalledWith(['1']);
  });

  it('follows the keys a controlled caller passes back', async () => {
    const onChange = vi.fn<(keys: string[]) => void>();
    const { rerender } = render(
      <EditableProTable<Row>
        columns={columns}
        value={rows}
        getRowId={(row) => row.id}
        editable={{ editableKeys: [], onChange }}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();

    rerender(
      <EditableProTable<Row>
        columns={columns}
        value={rows}
        getRowId={(row) => row.id}
        editable={{ editableKeys: ['2'], onChange }}
      />,
    );

    expect(within(rowFor('Beta')).getByRole('button', { name: 'Save' })).toBeDefined();
  });

  it('leaves edit mode on cancel without changing the value', async () => {
    const onChange = vi.fn<(value: Row[]) => void>();
    renderTable({ onChange });

    await userEvent.click(within(rowFor('Alpha')).getByRole('button', { name: 'Edit' }));
    await userEvent.click(within(rowFor('Alpha')).getByRole('button', { name: 'Cancel' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(within(rowFor('Alpha')).getByRole('button', { name: 'Edit' })).toBeDefined();
  });

  it('saves the edited draft through onChange', async () => {
    const onChange = vi.fn<(value: Row[]) => void>();
    renderTable({ onChange });

    // The row is captured once: clearing the input changes the row's accessible name.
    const row = rowFor('Alpha');
    await userEvent.click(within(row).getByRole('button', { name: 'Edit' }));
    await userEvent.clear(within(row).getByDisplayValue('Alpha'));
    await userEvent.type(within(row).getByRole('textbox'), 'Renamed');
    await userEvent.click(within(row).getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    expect(onChange.mock.calls[0]![0][0]).toMatchObject({ id: '1', name: 'Renamed' });
  });

  it('awaits an asynchronous save before applying the value', async () => {
    const onSave = vi.fn<(draft: Row, original: Row, index: number) => Promise<void>>(async () => {});
    const onChange = vi.fn<(value: Row[]) => void>();
    renderTable({ editable: { onSave }, onChange });

    await userEvent.click(within(rowFor('Alpha')).getByRole('button', { name: 'Edit' }));
    await userEvent.click(within(rowFor('Alpha')).getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave.mock.calls[0]![1]).toMatchObject({ id: '1', name: 'Alpha' });
    expect(onChange).toHaveBeenCalled();
  });

  it('keeps the draft and reports a failed save instead of throwing', async () => {
    const onSave = vi.fn<() => Promise<void>>(async () => {
      throw new Error('Save rejected');
    });
    const onChange = vi.fn<(value: Row[]) => void>();
    renderTable({ editable: { onSave }, onChange });

    const row = rowFor('Alpha');
    await userEvent.click(within(row).getByRole('button', { name: 'Edit' }));
    await userEvent.clear(within(row).getByDisplayValue('Alpha'));
    await userEvent.type(within(row).getByRole('textbox'), 'Edited');
    await userEvent.click(within(row).getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Save rejected');
    // The value is unchanged and the row is still editable, so the work is not lost.
    expect(onChange).not.toHaveBeenCalled();
    expect(within(row).getByRole('button', { name: 'Save' })).toBeDefined();
    expect(within(row).getByDisplayValue('Edited')).toBeDefined();
  });

  it('deletes a row through onChange', async () => {
    const onChange = vi.fn<(value: Row[]) => void>();
    renderTable({ onChange });

    await userEvent.click(within(rowFor('Alpha')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    expect(onChange.mock.calls[0]![0].map((row) => row.id)).toEqual(['2']);
  });

  it('leaves the row in place when the delete is refused', async () => {
    const onDelete = vi.fn<() => Promise<void>>(async () => {
      throw new Error('Delete rejected');
    });
    const onChange = vi.fn<(value: Row[]) => void>();
    renderTable({ editable: { onDelete }, onChange });

    await userEvent.click(within(rowFor('Alpha')).getByRole('button', { name: 'Delete' }));

    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Delete rejected');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('adds a record at the bottom and starts editing it', async () => {
    const onChange = vi.fn<(value: Row[]) => void>();
    const onAdd = vi.fn<(record: Row) => void>();
    const creatorProps = { record: () => ({ id: 'new', name: 'New', score: 0 }), onAdd };
    const { rerender } = renderTable({ onChange, recordCreatorProps: creatorProps });

    await userEvent.click(screen.getByRole('button', { name: /add new row/i }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    const nextValue = onChange.mock.calls[0]![0];
    expect(nextValue.map((row) => row.id)).toEqual(['1', '2', 'new']);

    // `value` is controlled, so the caller feeds the new array back in.
    rerender(
      <EditableProTable<Row>
        columns={columns}
        value={nextValue}
        getRowId={(row) => row.id}
        onChange={onChange}
        recordCreatorProps={creatorProps}
      />,
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeDefined();
  });

  it('adds a record at the top when the caller asks for it', async () => {
    const onChange = vi.fn<(value: Row[]) => void>();
    renderTable({
      onChange,
      recordCreatorProps: { position: 'top', record: () => ({ id: 'new', name: 'New', score: 0 }) },
    });

    await userEvent.click(screen.getByRole('button', { name: /add new row/i }));

    expect(onChange.mock.calls[0]![0].map((row) => row.id)).toEqual(['new', '1', '2']);
  });

  it('uses the caller’s creator button label', () => {
    renderTable({
      recordCreatorProps: { creatorButtonText: 'Add a record', record: () => ({ id: 'new', name: 'N', score: 0 }) },
    });

    expect(screen.getByRole('button', { name: '+ Add a record' })).toBeDefined();
  });

  it('omits the creator when the caller disables it', () => {
    renderTable({ recordCreatorProps: false });

    expect(screen.queryByRole('button', { name: /add new row/i })).toBeNull();
  });

  it('lets the caller take over the row actions', () => {
    renderTable({
      editable: {
        actionRender: (_row, { isEditing }) => <span>{isEditing ? 'editing' : 'idle'}</span>,
      },
    });

    expect(screen.getAllByText('idle')).toHaveLength(2);
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
  });

  it('edits a numeric cell as a number', async () => {
    const onChange = vi.fn<(value: Row[]) => void>();
    renderTable({ onChange });

    await userEvent.click(within(rowFor('Alpha')).getByRole('button', { name: 'Edit' }));
    const spinbutton = within(rowFor('Alpha')).getByRole('spinbutton');
    await userEvent.clear(spinbutton);
    await userEvent.type(spinbutton, '99');
    await userEvent.click(within(rowFor('Alpha')).getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    expect(onChange.mock.calls[0]![0][0]!.score).toBe(99);
  });

  it('renders a placeholder for an empty cell', () => {
    render(
      <EditableProTable<Row>
        columns={[{ key: 'note', header: 'Note', valueType: 'text' }]}
        value={[{ id: '1' } as unknown as Row]}
        getRowId={(row) => row.id}
      />,
    );

    expect(screen.getByText('—')).toBeDefined();
  });

  it('renders a badge cell', () => {
    render(
      <EditableProTable<Row>
        columns={[{ key: 'tier', header: 'Tier', valueType: 'badge' }]}
        value={[{ id: '1', tier: 'Gold' } as unknown as Row]}
        getRowId={(row) => row.id}
      />,
    );

    expect(screen.getByText('Gold')).toBeDefined();
  });

  it('renders a status cell from its documented tone shape', () => {
    render(
      <EditableProTable<Row>
        columns={[{ key: 'state', header: 'State', valueType: 'status' }]}
        value={[{ id: '1', state: { label: 'Active', variant: 'success' } } as unknown as Row]}
        getRowId={(row) => row.id}
      />,
    );

    // A tone object used to render as "[object Object]".
    expect(screen.getByText('Active')).toBeDefined();
    expect(screen.queryByText('[object Object]')).toBeNull();
  });

  it('renders a status cell that carries a plain string', () => {
    render(
      <EditableProTable<Row>
        columns={[{ key: 'state', header: 'State', valueType: 'status' }]}
        value={[{ id: '1', state: 'Draft' } as unknown as Row]}
        getRowId={(row) => row.id}
      />,
    );

    expect(screen.getByText('Draft')).toBeDefined();
  });

  it('renders a date cell', () => {
    render(
      <EditableProTable<Row>
        columns={[{ key: 'when', header: 'When', valueType: 'date' }]}
        value={[{ id: '1', when: new Date(2026, 8, 20) } as unknown as Row]}
        getRowId={(row) => row.id}
      />,
    );

    expect(screen.getByText(new Date(2026, 8, 20).toLocaleDateString())).toBeDefined();
  });

  it('falls back to the raw string for an unparseable date', () => {
    render(
      <EditableProTable<Row>
        columns={[{ key: 'when', header: 'When', valueType: 'date' }]}
        value={[{ id: '1', when: 'not a date' } as unknown as Row]}
        getRowId={(row) => row.id}
      />,
    );

    expect(screen.getByText('not a date')).toBeDefined();
  });

  it('edits a date cell with a date input', async () => {
    render(
      <EditableProTable<Row>
        columns={[{ key: 'when', header: 'When', valueType: 'date' }]}
        value={[{ id: '1', when: '2026-09-20' } as unknown as Row]}
        getRowId={(row) => row.id}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

    const input = screen.getByDisplayValue('2026-09-20') as HTMLInputElement;
    expect(input.type).toBe('date');
  });

  it('derives a row key from the index when no getRowId is given', () => {
    render(
      <EditableProTable<Row>
        columns={columns}
        value={[{ name: 'No id', score: 1 } as unknown as Row]}
      />,
    );

    expect(screen.getByText('No id')).toBeDefined();
  });
});
