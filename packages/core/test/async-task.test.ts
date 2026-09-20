import { describe, expect, it, vi } from 'vitest';

import { createAsyncTask, TaskCancelledError } from '../src/async-task.ts';

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe('createAsyncTask', () => {
  it('starts idle and reports the same snapshot until something runs', () => {
    const task = createAsyncTask(() => 'never');
    expect(task.getSnapshot()).toEqual({ status: 'idle' });
  });

  it('publishes pending synchronously, then success with the resolved value', async () => {
    const pending = deferred<string>();
    const task = createAsyncTask(() => pending.promise);

    const run = task.run(undefined);
    expect(task.getSnapshot()).toEqual({ status: 'pending' });

    pending.resolve('done');
    await expect(run).resolves.toBe('done');
    expect(task.getSnapshot()).toEqual({ status: 'success', value: 'done' });
  });

  it('publishes the error state and rejects with the same failure', async () => {
    const failure = new Error('boom');
    const task = createAsyncTask(() => {
      throw failure;
    });

    await expect(task.run(undefined)).rejects.toBe(failure);
    expect(task.getSnapshot()).toEqual({ status: 'error', error: failure });
  });

  it('rejects promptly with TaskCancelledError and publishes cancelled', async () => {
    const pending = deferred<string>();
    const task = createAsyncTask(() => pending.promise);

    const run = task.run(undefined);
    task.cancel();

    await expect(run).rejects.toBeInstanceOf(TaskCancelledError);
    expect(task.getSnapshot()).toEqual({ status: 'cancelled' });
  });

  it('lets the operation observe cancellation through its AbortSignal', async () => {
    const signals: Array<AbortSignal> = [];
    const task = createAsyncTask((_input, { signal }) => {
      signals.push(signal);
      return new Promise<string>((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new TaskCancelledError()));
      });
    });

    const run = task.run(undefined);
    await Promise.resolve();
    expect(signals[0]?.aborted).toBe(false);

    task.cancel();
    await expect(run).rejects.toBeInstanceOf(TaskCancelledError);
    expect(signals[0]?.aborted).toBe(true);
  });

  it('keeps the newest invocation and never starts the superseded one', async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    const seen: string[] = [];
    const task = createAsyncTask((input: string) => {
      seen.push(input);
      return input === 'first' ? first.promise : second.promise;
    });

    const firstRun = task.run('first');
    // The rejection handler is attached before the second run supersedes the first, so the
    // superseded promise is never left unhandled.
    const firstSettled = firstRun.catch((error: unknown) => error);
    const secondRun = task.run('second');

    // The superseded run had not begun, so the adapter must not be invoked for it at all.
    expect(await firstSettled).toBeInstanceOf(TaskCancelledError);
    await Promise.resolve();
    expect(seen).toEqual(['second']);

    second.resolve('second-value');
    await expect(secondRun).resolves.toBe('second-value');
    expect(task.getSnapshot()).toEqual({ status: 'success', value: 'second-value' });
  });

  it('notifies subscribers and stops after unsubscribe', async () => {
    const task = createAsyncTask(() => 'value');
    const listener = vi.fn<() => void>();
    const unsubscribe = task.subscribe(listener);

    await task.run(undefined);
    expect(listener).toHaveBeenCalled();

    unsubscribe();
    const before = listener.mock.calls.length;
    task.reset();
    expect(listener.mock.calls.length).toBe(before);
  });

  it('returns to idle on reset and keeps idle when cancelled while idle', () => {
    const task = createAsyncTask(() => 'value');

    task.cancel();
    expect(task.getSnapshot()).toEqual({ status: 'idle' });

    task.reset();
    expect(task.getSnapshot()).toEqual({ status: 'idle' });
  });

  it('lets a subscriber start the next run synchronously, and that run wins', async () => {
    const task = createAsyncTask((input: number) => input * 2);
    let started = false;
    task.subscribe(() => {
      if (started) return;
      started = true;
      // A subscriber may reenter run() while the outer invocation is still pending.
      void task.run(21).catch(() => {});
    });

    const outer = task.run(1);
    const outerSettled = outer.catch((error: unknown) => error);

    // Latest invocation wins, so the reentrant call supersedes the outer one.
    expect(await outerSettled).toBeInstanceOf(TaskCancelledError);
    await vi.waitFor(() => {
      expect(task.getSnapshot()).toEqual({ status: 'success', value: 42 });
    });
  });
});
