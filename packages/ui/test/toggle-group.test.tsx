// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ToggleGroup, ToggleGroupItem } from '../src/components/ui/toggle-group.tsx';

const renderGroup = (props: Parameters<typeof ToggleGroup>[0]) =>
  render(
    <ToggleGroup {...props}>
      <ToggleGroupItem value='a'>A</ToggleGroupItem>
      <ToggleGroupItem value='b'>B</ToggleGroupItem>
    </ToggleGroup>,
  );

describe('ToggleGroup single mode', () => {
  it('marks the selected item as pressed', () => {
    renderGroup({ type: 'single', value: 'a' });
    expect(screen.getByRole('button', { name: 'A' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'B' }).getAttribute('aria-pressed')).toBe('false');
  });

  it('reports the clicked value to the caller', async () => {
    const onValueChange = vi.fn<(value: string) => void>();
    renderGroup({ type: 'single', value: '', onValueChange });

    await userEvent.click(screen.getByRole('button', { name: 'A' }));

    expect(onValueChange).toHaveBeenCalledWith('a');
  });

  it('clears the value when the selected item is clicked again', async () => {
    const onValueChange = vi.fn<(value: string) => void>();
    renderGroup({ type: 'single', value: 'a', onValueChange });

    await userEvent.click(screen.getByRole('button', { name: 'A' }));

    expect(onValueChange).toHaveBeenCalledWith('');
  });

  it('ignores clicks while the group is disabled', async () => {
    const onValueChange = vi.fn<(value: string) => void>();
    renderGroup({ type: 'single', value: '', onValueChange, disabled: true });

    await userEvent.click(screen.getByRole('button', { name: 'A' }));

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('uses the newest onValueChange handler after a re-render', async () => {
    // Regression: the context memo previously omitted the handler, so a re-render that changed
    // only onValueChange kept calling the first handler.
    const first = vi.fn<(value: string) => void>();
    const second = vi.fn<(value: string) => void>();
    const { rerender } = render(
      <ToggleGroup type='single' value='' onValueChange={first}>
        <ToggleGroupItem value='a'>A</ToggleGroupItem>
      </ToggleGroup>,
    );

    rerender(
      <ToggleGroup type='single' value='' onValueChange={second}>
        <ToggleGroupItem value='a'>A</ToggleGroupItem>
      </ToggleGroup>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'A' }));

    expect(second).toHaveBeenCalledWith('a');
    expect(first).not.toHaveBeenCalled();
  });
});

describe('ToggleGroup multiple mode', () => {
  it('adds a value that is not yet selected', async () => {
    const onValueChange = vi.fn<(value: string[]) => void>();
    renderGroup({ type: 'multiple', value: ['a'], onValueChange });

    await userEvent.click(screen.getByRole('button', { name: 'B' }));

    expect(onValueChange).toHaveBeenCalledWith(['a', 'b']);
  });

  it('removes a value that is already selected', async () => {
    const onValueChange = vi.fn<(value: string[]) => void>();
    renderGroup({ type: 'multiple', value: ['a', 'b'], onValueChange });

    await userEvent.click(screen.getByRole('button', { name: 'A' }));

    expect(onValueChange).toHaveBeenCalledWith(['b']);
  });

  it('reports pressed state for each selected value', () => {
    renderGroup({ type: 'multiple', value: ['b'] });
    expect(screen.getByRole('button', { name: 'A' }).getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByRole('button', { name: 'B' }).getAttribute('aria-pressed')).toBe('true');
  });
});
