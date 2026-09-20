// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ProDataTable } from '../src/data-table/pro-data-table.tsx';
import type { ProColumnDef } from '@package/pro-core/table';
import type { TableQuery } from '@package/pro-core/table-features';

type Row = { id: string; name: string; score: number };

const columns: Array<ProColumnDef<Row>> = [
  { key: 'name', header: 'Name', valueType: 'text' },
  { key: 'score', header: 'Score', valueType: 'number' },
];

const rows: Row[] = [
  { id: '1', name: 'Gamma', score: 30 },
  { id: '2', name: 'Alpha', score: 10 },
  { id: '3', name: 'Beta', score: 20 },
];

const bodyRowNames = () => {
  const body = screen.getAllByRole('rowgroup')[1]!;
  return within(body)
    .getAllByRole('row')
    .map((row) => within(row).getAllByRole('cell')[0]?.textContent ?? '')
    .filter((text) => text !== '');
};

// Radix Select can only be opened through the pointer once per test file under jsdom; the keyboard
// path is both reliable and the accessibility contract worth asserting.
const openPageSizeSelector = async () => {
  const trigger = screen.getByLabelText('Rows per page');
  trigger.focus();
  await userEvent.keyboard('{Enter}');
  return trigger;
};

const query = (overrides: Partial<{ page: number; pageSize: number; sortBy: string; sortDir: 'asc' | 'desc'; search: string }> = {}) => ({
  page: 0,
  pageSize: 10,
  ...overrides,
});

describe('ProDataTable client mode', () => {
  it('renders every row', () => {
    render(<ProDataTable columns={columns} data={rows} getRowId={(row) => row.id} />);
    expect(bodyRowNames()).toEqual(['Gamma', 'Alpha', 'Beta']);
  });

  it('filters rows from the toolbar search', async () => {
    render(<ProDataTable columns={columns} data={rows} getRowId={(row) => row.id} />);

    await userEvent.type(screen.getByLabelText('Search table'), 'alp');

    expect(bodyRowNames()).toEqual(['Alpha']);
  });

  it('sorts rows from a column header', async () => {
    render(<ProDataTable columns={columns} data={rows} getRowId={(row) => row.id} />);

    // TanStack v9 picks the first direction from the column's data: numbers start at the largest.
    await userEvent.click(screen.getByRole('button', { name: /Score/ }));

    expect(bodyRowNames()).toEqual(['Gamma', 'Beta', 'Alpha']);
  });

  it('starts text columns ascending', async () => {
    render(<ProDataTable columns={columns} data={rows} getRowId={(row) => row.id} />);

    await userEvent.click(screen.getByRole('button', { name: /Name/ }));

    expect(bodyRowNames()).toEqual(['Alpha', 'Beta', 'Gamma']);
  });

  it('reverses the order on a second header click', async () => {
    render(<ProDataTable columns={columns} data={rows} getRowId={(row) => row.id} />);

    const header = screen.getByRole('button', { name: /Score/ });
    await userEvent.click(header);
    await userEvent.click(header);

    expect(bodyRowNames()).toEqual(['Alpha', 'Beta', 'Gamma']);
  });

  it('clears the sort on a third header click', async () => {
    render(<ProDataTable columns={columns} data={rows} getRowId={(row) => row.id} />);

    const header = screen.getByRole('button', { name: /Score/ });
    await userEvent.click(header);
    await userEvent.click(header);
    await userEvent.click(header);

    // Back to the caller's original order.
    expect(bodyRowNames()).toEqual(['Gamma', 'Alpha', 'Beta']);
    expect(screen.getByRole('columnheader', { name: /Score/ }).getAttribute('aria-sort')).toBe('none');
  });

  it('reports the sort state on the column header', async () => {
    render(<ProDataTable columns={columns} data={rows} getRowId={(row) => row.id} />);

    expect(screen.getByRole('columnheader', { name: /Score/ }).getAttribute('aria-sort')).toBe('none');

    await userEvent.click(screen.getByRole('button', { name: /Score/ }));
    expect(screen.getByRole('columnheader', { name: /Score/ }).getAttribute('aria-sort')).toBe('descending');

    await userEvent.click(screen.getByRole('button', { name: /Score/ }));
    expect(screen.getByRole('columnheader', { name: /Score/ }).getAttribute('aria-sort')).toBe('ascending');
  });

  it('leaves an unsortable column without a sort state', () => {
    render(
      <ProDataTable
        columns={[{ ...columns[0]!, sortable: false }, columns[1]!]}
        data={rows}
        getRowId={(row) => row.id}
      />,
    );

    expect(screen.getByRole('columnheader', { name: /Name/ }).getAttribute('aria-sort')).toBeNull();
  });

  it('paginates locally and reports the page count', async () => {
    render(
      <ProDataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        features={{ pagination: true, pageSizeOptions: [2] }}
      />,
    );

    expect(screen.getByText('Page 1 of 2')).toBeDefined();
    expect(bodyRowNames()).toEqual(['Gamma', 'Alpha']);

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByText('Page 2 of 2')).toBeDefined();
    expect(bodyRowNames()).toEqual(['Beta']);
  });

  it('renders the caller’s empty state', () => {
    render(
      <ProDataTable columns={columns} data={[]} empty={<span>Nothing here yet</span>} />,
    );
    expect(screen.getByText('Nothing here yet')).toBeDefined();
  });

  it('renders a loading skeleton instead of rows', () => {
    render(<ProDataTable columns={columns} data={rows} loading getRowId={(row) => row.id} />);
    expect(bodyRowNames()).toEqual([]);
  });

  it('renders the error message and retries', async () => {
    const onRetry = vi.fn<() => void>();
    render(
      <ProDataTable
        columns={columns}
        data={[]}
        error={new Error('network down')}
        onRetry={onRetry}
      />,
    );

    expect(screen.getByText(/network down/)).toBeDefined();
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('starts a column hidden when it is marked hiddenByDefault', () => {
    render(
      <ProDataTable
        columns={[{ ...columns[0]!, hiddenByDefault: true }, columns[1]!]}
        data={rows}
        getRowId={(row) => row.id}
      />,
    );

    expect(screen.queryByRole('columnheader', { name: /Name/ })).toBeNull();
    expect(screen.getByRole('columnheader', { name: /Score/ })).toBeDefined();
  });
});

describe('ProDataTable cell rendering', () => {
  it('renders a placeholder for an empty cell', () => {
    render(
      <ProDataTable
        columns={[{ key: 'note', header: 'Note', valueType: 'text' }]}
        data={[{ id: '1', note: null } as unknown as Row]}
        getRowId={(row) => row.id}
      />,
    );

    expect(screen.getByText('—')).toBeDefined();
  });

  it('formats a numeric cell with grouping', () => {
    render(
      <ProDataTable
        columns={[{ key: 'score', header: 'Score', valueType: 'number' }]}
        data={[{ id: '1', score: 1234567 } as unknown as Row]}
        getRowId={(row) => row.id}
      />,
    );

    expect(screen.getByText((1234567).toLocaleString())).toBeDefined();
  });

  it('renders a badge cell', () => {
    render(
      <ProDataTable
        columns={[{ key: 'tier', header: 'Tier', valueType: 'badge' }]}
        data={[{ id: '1', tier: 'Gold' } as unknown as Row]}
        getRowId={(row) => row.id}
      />,
    );

    expect(screen.getByText('Gold')).toBeDefined();
  });

  it('renders a status cell from its label', () => {
    render(
      <ProDataTable
        columns={[{ key: 'state', header: 'State', valueType: 'status' }]}
        data={[{ id: '1', state: { label: 'Active', variant: 'success' } } as unknown as Row]}
        getRowId={(row) => row.id}
      />,
    );

    expect(screen.getByText('Active')).toBeDefined();
  });

  it('renders a date cell', () => {
    render(
      <ProDataTable
        columns={[{ key: 'when', header: 'When', valueType: 'date' }]}
        data={[{ id: '1', when: new Date(2026, 8, 20) } as unknown as Row]}
        getRowId={(row) => row.id}
      />,
    );

    const body = screen.getAllByRole('rowgroup')[1]!;
    expect(within(body).getAllByRole('cell')[0]!.textContent).not.toBe('—');
  });

  it('renders an action column with its buttons', async () => {
    const onSelect = vi.fn<(row: Row) => void>();
    render(
      <ProDataTable
        columns={[
          columns[0]!,
          {
            key: 'actions',
            header: '',
            valueType: 'actions',
            actions: [{ label: 'Open', onSelect }],
          },
        ]}
        data={rows}
        getRowId={(row) => row.id}
      />,
    );

    await userEvent.click(screen.getAllByRole('button', { name: 'Open' })[0]!);
    expect(onSelect).toHaveBeenCalledWith(rows[0]);
  });

  it('hides an action the column marks hidden for that row', () => {
    render(
      <ProDataTable
        columns={[
          columns[0]!,
          {
            key: 'actions',
            header: '',
            valueType: 'actions',
            actions: [{ label: 'Archive', hidden: (row) => row.score > 20, onSelect: () => {} }],
          },
        ]}
        data={rows}
        getRowId={(row) => row.id}
      />,
    );

    // Gamma has score 30 and is the only row that hides the action.
    expect(screen.getAllByRole('button', { name: 'Archive' })).toHaveLength(2);
  });
});

describe('ProDataTable row selection', () => {
  const selectionColumns: Array<ProColumnDef<Row>> = [
    { key: 'name', header: 'Name', valueType: 'text' },
  ];

  it('renders one checkbox per row when selection is enabled', () => {
    render(
      <ProDataTable
        columns={selectionColumns}
        data={rows}
        getRowId={(row) => row.id}
        features={{ rowSelection: true }}
      />,
    );

    // The selection column's header is deliberately empty, so there is no select-all control.
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  });

  it('labels the row checkboxes for assistive technology', () => {
    render(
      <ProDataTable
        columns={selectionColumns}
        data={rows}
        getRowId={(row) => row.id}
        features={{ rowSelection: true }}
      />,
    );

    expect(screen.getAllByRole('checkbox', { name: 'Select row' })).toHaveLength(3);
  });

  it('reports how many rows are selected', async () => {
    render(
      <ProDataTable
        columns={selectionColumns}
        data={rows}
        getRowId={(row) => row.id}
        features={{ rowSelection: true }}
      />,
    );

    await userEvent.click(screen.getAllByRole('checkbox')[1]!);

    expect(screen.getByText('1 selected')).toBeDefined();
  });

  it('omits the selection column when the feature is off', () => {
    render(<ProDataTable columns={selectionColumns} data={rows} getRowId={(row) => row.id} />);

    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });
});

describe('ProDataTable toolbar', () => {
  it('reports the total row count', () => {
    render(
      <ProDataTable columns={columns} data={rows} getRowId={(row) => row.id} />,
    );

    expect(screen.getByText('3 rows')).toBeDefined();
  });

  it('uses the singular for one row', () => {
    render(<ProDataTable columns={columns} data={[rows[0]!]} getRowId={(row) => row.id} />);

    expect(screen.getByText('1 row')).toBeDefined();
  });

  it('hides a column through the Columns menu', async () => {
    render(<ProDataTable columns={columns} data={rows} getRowId={(row) => row.id} />);
    expect(screen.getByRole('columnheader', { name: /Name/ })).toBeDefined();

    const trigger = screen.getByRole('button', { name: /Columns/ });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.click(await screen.findByRole('menuitemcheckbox', { name: 'Name' }));

    expect(screen.queryByRole('columnheader', { name: /Name/ })).toBeNull();
  });

  it('offers a refresh control only when a handler is given', () => {
    const { unmount } = render(<ProDataTable columns={columns} data={rows} />);
    expect(screen.queryByRole('button', { name: 'Refresh data' })).toBeNull();
    unmount();

    render(<ProDataTable columns={columns} data={rows} onRefresh={vi.fn<() => void>()} />);
    expect(screen.getByRole('button', { name: 'Refresh data' })).toBeDefined();
  });

  it('hides the refresh control when the feature is disabled', () => {
    render(
      <ProDataTable
        columns={columns}
        data={rows}
        onRefresh={vi.fn<() => void>()}
        features={{ refresh: false }}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Refresh data' })).toBeNull();
  });

  it('renders the caller’s toolbar extra', () => {
    render(<ProDataTable columns={columns} data={rows} toolbarExtra={<span>Export</span>} />);

    expect(screen.getByText('Export')).toBeDefined();
  });

  it('uses the caller’s search placeholder', () => {
    render(
      <ProDataTable columns={columns} data={rows} searchPlaceholder='Find a record…' />,
    );

    expect(screen.getByPlaceholderText('Find a record…')).toBeDefined();
  });

  it('can hide pagination entirely', () => {
    render(<ProDataTable columns={columns} data={rows} features={{ pagination: false }} />);

    expect(screen.queryByLabelText('Rows per page')).toBeNull();
  });
});

describe('ProDataTable server mode', () => {
  it('is not entered unless both query and onQueryChange are supplied', async () => {
    // A caller who passes only one of the pair gets a client-side table over a single server page.
    const onQueryChange = vi.fn<(query: TableQuery) => void>();
    render(
      <ProDataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        query={query()}
      />,
    );

    await userEvent.type(screen.getByLabelText('Search table'), 'alp');
    expect(onQueryChange).not.toHaveBeenCalled();
    expect(bodyRowNames()).toEqual(['Alpha']);
  });

  it('does not filter the page it was given', async () => {
    const onQueryChange = vi.fn<(query: TableQuery) => void>();
    render(
      <ProDataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        query={query()}
        totalRows={rows.length}
        onQueryChange={onQueryChange}
      />,
    );

    // Server mode must send the search up rather than filtering the current page locally.
    expect(bodyRowNames()).toEqual(['Gamma', 'Alpha', 'Beta']);
  });

  it('sends a search with the page reset to the first page', async () => {
    const onQueryChange = vi.fn<(query: TableQuery) => void>();
    render(
      <ProDataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        query={query({ page: 3 })}
        totalRows={100}
        onQueryChange={onQueryChange}
      />,
    );

    await userEvent.type(screen.getByLabelText('Search table'), 'a');

    expect(onQueryChange).toHaveBeenCalledWith(expect.objectContaining({ page: 0, search: 'a' }));
  });

  it('sends a cleared search as undefined', async () => {
    const onQueryChange = vi.fn<(query: TableQuery) => void>();
    render(
      <ProDataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        query={query({ search: 'x' })}
        totalRows={100}
        onQueryChange={onQueryChange}
      />,
    );

    await userEvent.clear(screen.getByLabelText('Search table'));

    expect(onQueryChange).toHaveBeenCalledWith(expect.objectContaining({ search: undefined }));
  });

  it('sends a sort with the page reset to the first page', async () => {
    const onQueryChange = vi.fn<(query: TableQuery) => void>();
    render(
      <ProDataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        query={query({ page: 2 })}
        totalRows={100}
        onQueryChange={onQueryChange}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /Score/ }));

    // Numbers start descending, so the first click asks the server for 'desc'.
    expect(onQueryChange).toHaveBeenCalledWith(
      expect.objectContaining({ page: 0, sortBy: 'score', sortDir: 'desc' }),
    );
  });

  it('asks the server for the opposite direction on the next click', async () => {
    const onQueryChange = vi.fn<(query: TableQuery) => void>();
    const { rerender } = render(
      <ProDataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        query={query({ sortBy: 'score', sortDir: 'desc' })}
        totalRows={100}
        onQueryChange={onQueryChange}
      />,
    );

    rerender(
      <ProDataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        query={query({ sortBy: 'score', sortDir: 'desc' })}
        totalRows={100}
        onQueryChange={onQueryChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Score/ }));

    // The cycle must continue from what the server reported, not restart from nothing.
    expect(onQueryChange).toHaveBeenCalledWith(
      expect.objectContaining({ sortBy: 'score', sortDir: 'asc' }),
    );
  });

  it('sends the requested page', async () => {
    const onQueryChange = vi.fn<(query: TableQuery) => void>();
    render(
      <ProDataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        query={query({ pageSize: 3 })}
        totalRows={9}
        onQueryChange={onQueryChange}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));

    expect(onQueryChange).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
  });

  it('sends a page-size change with the page reset', async () => {
    const onQueryChange = vi.fn<(query: TableQuery) => void>();
    render(
      <ProDataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        query={query({ page: 2 })}
        totalRows={100}
        features={{ pageSizeOptions: [10, 20] }}
        onQueryChange={onQueryChange}
      />,
    );

    await openPageSizeSelector();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');

    expect(onQueryChange).toHaveBeenCalledWith(expect.objectContaining({ page: 0, pageSize: 20 }));
  });

  it('offers only the page sizes the caller configured', async () => {
    render(
      <ProDataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        query={query()}
        totalRows={100}
        features={{ pageSizeOptions: [5, 25] }}
        onQueryChange={vi.fn<(query: TableQuery) => void>()}
      />,
    );

    await openPageSizeSelector();

    // The configured choices must reach the selector, not just the initial page size.
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['5', '25']);
  });

  it('derives the page count from the server total, not the page length', () => {
    render(
      <ProDataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        query={query({ pageSize: 3 })}
        totalRows={9}
        onQueryChange={vi.fn<(query: TableQuery) => void>()}
      />,
    );

    expect(screen.getByText('Page 1 of 3')).toBeDefined();
  });

  it('shows the sort the server reports', () => {
    render(
      <ProDataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        query={query({ sortBy: 'score', sortDir: 'desc' })}
        totalRows={3}
        onQueryChange={vi.fn<(query: TableQuery) => void>()}
      />,
    );

    // Without this the user sorts, the query round-trips, and nothing indicates the order.
    expect(screen.getByRole('columnheader', { name: /Score/ }).getAttribute('aria-sort')).toBe('descending');
    expect(screen.getByRole('columnheader', { name: /Name/ }).getAttribute('aria-sort')).toBe('none');
  });
});
