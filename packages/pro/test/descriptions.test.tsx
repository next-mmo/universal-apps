// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  ProDescriptions,
  ProDescriptionsItem,
} from '../src/descriptions/pro-descriptions.tsx';

const record = { name: 'Ada', score: 42, active: true, joined: new Date(2026, 8, 20), id: 'user_1' };

describe('ProDescriptions', () => {
  it('renders the label and the value for each item', () => {
    render(
      <ProDescriptions
        data={record}
        items={[
          { label: 'Name', dataIndex: 'name' },
          { label: 'Score', dataIndex: 'score' },
        ]}
      />,
    );

    expect(screen.getByText('Name:')).toBeDefined();
    expect(screen.getByText('Ada')).toBeDefined();
    expect(screen.getByText('42')).toBeDefined();
  });

  it('renders the title and the extra content', () => {
    render(
      <ProDescriptions title='Profile' extra={<button type='button'>Edit</button>} data={record} items={[]} />,
    );

    expect(screen.getByText('Profile')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeDefined();
  });

  it('shows a placeholder for an empty value', () => {
    render(<ProDescriptions data={{}} items={[{ label: 'Missing', dataIndex: 'nope' }]} />);

    expect(screen.getByText('-')).toBeDefined();
  });

  it('renders a boolean as Yes or No', () => {
    render(
      <ProDescriptions
        data={record}
        items={[
          { label: 'Active', dataIndex: 'active', valueType: 'boolean' },
          { label: 'Blocked', value: false, valueType: 'boolean' },
        ]}
      />,
    );

    expect(screen.getByText('Yes')).toBeDefined();
    expect(screen.getByText('No')).toBeDefined();
  });

  it('renders a badge value', () => {
    render(<ProDescriptions data={{ tier: 'Gold' }} items={[{ label: 'Tier', dataIndex: 'tier', valueType: 'badge' }]} />);

    expect(screen.getByText('Gold')).toBeDefined();
  });

  it('renders a code value in a monospace element', () => {
    render(<ProDescriptions data={record} items={[{ label: 'ID', dataIndex: 'id', valueType: 'code' }]} />);

    expect(screen.getByText('user_1').tagName).toBe('CODE');
  });

  it('renders a date value', () => {
    render(<ProDescriptions data={record} items={[{ label: 'Joined', dataIndex: 'joined', valueType: 'date' }]} />);

    expect(screen.getByText(new Date(2026, 8, 20).toLocaleDateString())).toBeDefined();
  });

  it('falls back to the raw string when a date value is not a Date', () => {
    render(
      <ProDescriptions
        data={{ joined: '2026-09-20' }}
        items={[{ label: 'Joined', dataIndex: 'joined', valueType: 'date' }]}
      />,
    );

    // A string date must not crash the formatter.
    expect(screen.getByText('2026-09-20')).toBeDefined();
  });

  it('prefers a custom render', () => {
    const renderer = vi.fn<(value: unknown, data: Record<string, unknown>) => React.ReactNode>(
      (value) => <strong>custom {String(value)}</strong>,
    );
    render(<ProDescriptions data={record} items={[{ label: 'Name', dataIndex: 'name', render: renderer }]} />);

    expect(screen.getByText('custom Ada')).toBeDefined();
    expect(renderer.mock.calls[0]![1]).toBe(record);
  });

  it('reads an inline value when there is no dataIndex', () => {
    render(<ProDescriptions items={[{ label: 'Plan', value: 'Enterprise' }]} />);

    expect(screen.getByText('Enterprise')).toBeDefined();
  });

  it('builds items from a flat field schema', () => {
    render(
      <ProDescriptions
        data={record}
        // Unlike ProForm, this prop takes a flat field list rather than groups.
        schema={[{ name: 'name', label: 'Name', type: 'text' }]}
      />,
    );

    expect(screen.getByText('Name:')).toBeDefined();
    expect(screen.getByText('Ada')).toBeDefined();
  });

  it('renders a checkbox field from a schema as a boolean', () => {
    render(
      <ProDescriptions data={record} schema={[{ name: 'active', label: 'Active', type: 'checkbox' }]} />,
    );

    expect(screen.getByText('Yes')).toBeDefined();
  });

  it('builds items from declarative children', () => {
    render(
      <ProDescriptions data={record}>
        <ProDescriptionsItem label='Name' dataIndex='name' />
      </ProDescriptions>,
    );

    expect(screen.getByText('Name:')).toBeDefined();
    expect(screen.getByText('Ada')).toBeDefined();
  });

  it('spans an item across the grid with a class Tailwind can generate', () => {
    const { container } = render(
      <ProDescriptions data={record} column={3} items={[{ label: 'Name', dataIndex: 'name', span: 2 }]} />,
    );
    const cell = container.querySelector('[data-slot="pro-descriptions"] .bg-card')!;

    // A template-built class is invisible to the scanner, so the span silently did nothing.
    expect(cell.className).toContain('sm:col-span-2');
    expect(cell.className).not.toContain('${');
  });

  it('never spans wider than the column count', () => {
    const { container } = render(
      <ProDescriptions data={record} column={2} items={[{ label: 'Name', dataIndex: 'name', span: 4 }]} />,
    );
    const cell = container.querySelector('[data-slot="pro-descriptions"] .bg-card')!;

    expect(cell.className).toContain('sm:col-span-2');
  });

  it('adds no span class for a single-column item', () => {
    const { container } = render(
      <ProDescriptions data={record} items={[{ label: 'Name', dataIndex: 'name' }]} />,
    );
    const cell = container.querySelector('[data-slot="pro-descriptions"] .bg-card')!;

    expect(cell.className).not.toContain('col-span');
  });

  it('varies the grid by column count', () => {
    const { container, unmount } = render(<ProDescriptions data={record} column={1} items={[]} />);
    expect(container.querySelector('.grid')!.className).toContain('grid-cols-1');
    unmount();

    const { container: two } = render(<ProDescriptions data={record} column={2} items={[]} />);
    expect(two.querySelector('.grid')!.className).toContain('sm:grid-cols-2');

    const { container: four } = render(<ProDescriptions data={record} column={4} items={[]} />);
    expect(four.querySelector('.grid')!.className).toContain('md:grid-cols-4');
  });

  it('stacks label and value in the vertical layout', () => {
    const { container } = render(
      <ProDescriptions data={record} layout='vertical' items={[{ label: 'Name', dataIndex: 'name' }]} />,
    );
    const cell = container.querySelector('[data-slot="pro-descriptions"] .bg-card')!;

    expect(cell.className).toContain('flex-col');
  });

  it('appends a colon to the label in the horizontal layout', () => {
    render(<ProDescriptions data={record} layout='horizontal' items={[{ label: 'Name', dataIndex: 'name' }]} />);

    expect(screen.getByText('Name:')).toBeDefined();
  });

  it('drops the border styling when bordered is off', () => {
    const { container } = render(<ProDescriptions data={record} bordered={false} items={[]} />);

    expect(container.querySelector('.grid')!.className).toContain('border-0');
  });
});
