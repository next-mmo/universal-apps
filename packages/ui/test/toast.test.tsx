// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Toaster, toast, toastStore } from '../src/components/ui/toast.tsx';

beforeEach(() => {
  toast.dismiss();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('toast store', () => {
  it('adds a toast and returns its id', () => {
    const id = toast('Saved');

    expect(id).toBeTypeOf('string');
    expect(toastStore.getSnapshot().map((item) => item.title)).toEqual(['Saved']);
  });

  it('records the variant for each helper', () => {
    toast.success('ok');
    toast.error('failed');
    toast.warning('careful');
    toast.info('fyi');

    expect(toastStore.getSnapshot().map((item) => item.variant)).toEqual([
      'success',
      'error',
      'warning',
      'info',
    ]);
  });

  it('publishes a new snapshot reference on every change', () => {
    // useSyncExternalStore only re-renders when the reference changes, so mutating in place would
    // silently stop updating the UI.
    const before = toastStore.getSnapshot();
    toast('one');
    const after = toastStore.getSnapshot();

    expect(after).not.toBe(before);
  });

  it('notifies subscribers and stops after unsubscribe', () => {
    const listener = vi.fn<() => void>();
    const unsubscribe = toastStore.subscribe(listener);

    toast('one');
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    toast('two');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('dismisses a single toast by id', () => {
    const first = toast('one');
    toast('two');

    toast.dismiss(first);

    expect(toastStore.getSnapshot().map((item) => item.title)).toEqual(['two']);
  });

  it('clears every toast when dismissed without an id', () => {
    toast('one');
    toast('two');

    toast.dismiss();

    expect(toastStore.getSnapshot()).toEqual([]);
  });

  it('removes a toast once its duration elapses', () => {
    vi.useFakeTimers();
    toast('temporary', { duration: 1000 });

    vi.advanceTimersByTime(999);
    expect(toastStore.getSnapshot()).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(toastStore.getSnapshot()).toEqual([]);
  });

  it('keeps a toast with duration zero until it is dismissed', () => {
    vi.useFakeTimers();
    toast('sticky', { duration: 0 });

    vi.advanceTimersByTime(60_000);
    expect(toastStore.getSnapshot()).toHaveLength(1);
  });

  it('cancels the pending timer when a toast is dismissed early', () => {
    vi.useFakeTimers();
    const id = toast('temporary', { duration: 1000 });
    const listener = vi.fn<() => void>();
    toastStore.subscribe(listener);

    toast.dismiss(id);
    listener.mockClear();
    vi.advanceTimersByTime(5000);

    // A cleared timer must not fire a second dismissal.
    expect(listener).not.toHaveBeenCalled();
    expect(toastStore.getSnapshot()).toEqual([]);
  });
});

describe('Toaster', () => {
  it('renders nothing while there are no toasts', () => {
    const { container } = render(<Toaster />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the title and description', () => {
    render(<Toaster />);
    act(() => {
      toast('Saved', { description: 'Your changes are stored.' });
    });

    expect(screen.getByText('Saved')).toBeDefined();
    expect(screen.getByText('Your changes are stored.')).toBeDefined();
  });

  it('announces an informational toast politely', () => {
    render(<Toaster />);
    act(() => {
      toast.success('Saved');
    });

    const region = screen.getByRole('status');
    expect(region.getAttribute('aria-live')).toBe('polite');
    expect(region.textContent).toContain('Saved');
  });

  it('announces an error assertively', () => {
    render(<Toaster />);
    act(() => {
      toast.error('Upload failed');
    });

    // An error must interrupt rather than wait for the next pause.
    const region = screen.getByRole('alert');
    expect(region.getAttribute('aria-live')).toBe('assertive');
    expect(region.textContent).toContain('Upload failed');
  });

  it('closes a toast from its close button', async () => {
    render(<Toaster />);
    act(() => {
      toast('Saved');
    });

    await userEvent.click(screen.getByRole('button', { name: /close/i }));

    expect(toastStore.getSnapshot()).toEqual([]);
  });

  it('runs the action and then dismisses the toast', async () => {
    const onClick = vi.fn<() => void>();
    render(<Toaster />);
    act(() => {
      toast('Undo?', { action: { label: 'Undo', onClick } });
    });

    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(toastStore.getSnapshot()).toEqual([]);
  });

  it('renders several toasts at once', () => {
    render(<Toaster />);
    act(() => {
      toast('one');
      toast('two');
      toast('three');
    });

    expect(screen.getAllByRole('status')).toHaveLength(3);
  });

  it('server-renders with a stable snapshot', () => {
    // The docs app is server-rendered; an uncached getServerSnapshot loops during hydration.
    expect(() => renderToString(<Toaster />)).not.toThrow();
  });
});
