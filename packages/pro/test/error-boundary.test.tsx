// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ProErrorBoundary } from '../src/layout/pro-error-boundary.tsx';
import type { ProErrorBoundaryProps } from '../src/layout/pro-error-boundary.tsx';

const Boom = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error('view exploded');
  return <p>Recovered</p>;
};

afterEach(() => {
  vi.restoreAllMocks();
});

const renderBoundary = (props: Partial<ProErrorBoundaryProps> = {}) => {
  // React logs the caught error to console.error; the boundary logs its own line too.
  vi.spyOn(console, 'error').mockImplementation(() => {});
  return render(
    <ProErrorBoundary {...props}>
      <p>Fine</p>
    </ProErrorBoundary>,
  );
};

describe('ProErrorBoundary', () => {
  it('renders its children while nothing throws', () => {
    renderBoundary();

    expect(screen.getByText('Fine')).toBeDefined();
  });

  it('shows a fallback instead of propagating the failure', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ProErrorBoundary>
        <Boom shouldThrow />
      </ProErrorBoundary>,
    );

    // An isolated widget failure must not take the shell down with it.
    expect(screen.getByText('Component encountered an unexpected error')).toBeDefined();
    expect(screen.getByText('view exploded')).toBeDefined();
  });

  it('reports the failure to the console for diagnostics', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ProErrorBoundary>
        <Boom shouldThrow />
      </ProErrorBoundary>,
    );

    expect(error.mock.calls.some((call) => String(call[0]).includes('[ProErrorBoundary]'))).toBe(true);
  });

  it('uses the caller’s title and description', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ProErrorBoundary fallbackTitle='Orders unavailable' fallbackDescription='Try again shortly.'>
        <Boom shouldThrow />
      </ProErrorBoundary>,
    );

    expect(screen.getByText('Orders unavailable')).toBeDefined();
    expect(screen.getByText('Try again shortly.')).toBeDefined();
  });

  it('recovers when the retry control is used and the child stops failing', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender } = render(
      <ProErrorBoundary>
        <Boom shouldThrow />
      </ProErrorBoundary>,
    );
    expect(screen.getByText('Component encountered an unexpected error')).toBeDefined();

    // The caller fixes the condition, then the user retries.
    rerender(
      <ProErrorBoundary>
        <Boom shouldThrow={false} />
      </ProErrorBoundary>,
    );
    await userEvent.click(screen.getByRole('button', { name: /retry view/i }));

    expect(screen.getByText('Recovered')).toBeDefined();
  });

  it('tells the caller when a reset happens', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const onReset = vi.fn<() => void>();
    render(
      <ProErrorBoundary onReset={onReset}>
        <Boom shouldThrow />
      </ProErrorBoundary>,
    );

    await userEvent.click(screen.getByRole('button', { name: /retry view/i }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
