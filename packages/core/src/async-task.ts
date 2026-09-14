/** Headless lifecycle for uploads, previews, searches, or generation jobs. */
export type TaskState<T> =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'success'; value: T }
  | { status: 'error'; error: unknown }
  | { status: 'cancelled' };

export class TaskCancelledError extends Error {
  constructor() {
    super('Task cancelled');
    this.name = 'AbortError';
  }
}

export interface AsyncTask<TInput, TOutput> {
  getSnapshot(): TaskState<TOutput>;
  subscribe(listener: () => void): () => void;
  run(input: TInput): Promise<TOutput>;
  cancel(): void;
  reset(): void;
}

/**
 * Latest invocation wins, including calls from synchronous abort/subscriber callbacks.
 * Cancellation rejects promptly; adapters must honor AbortSignal to stop side effects.
 * Consumers must handle run() rejections, including cancellation.
 */
export function createAsyncTask<TInput, TOutput>(
  execute: (input: TInput, context: { signal: AbortSignal }) => TOutput | Promise<TOutput>,
): AsyncTask<TInput, TOutput> {
  let state: TaskState<TOutput> = { status: 'idle' };
  let controller: AbortController | undefined;
  let generation = 0;
  const listeners = new Set<() => void>();

  function publish(next: TaskState<TOutput>): void {
    state = next;
    for (const listener of [...listeners]) {
      // A listener may already have published a newer state.
      if (state !== next) break;
      try {
        listener();
      } catch (error) {
        queueMicrotask(() => { throw error; });
      }
    }
  }

  function stop(status: 'cancelled' | 'idle'): void {
    const previous = controller;
    if (!previous && status === 'cancelled') return;
    const current = ++generation;
    // Detach before abort(): abort handlers can synchronously start a new run.
    controller = undefined;
    previous?.abort();
    if (generation === current) publish({ status });
  }

  return {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    cancel: () => stop('cancelled'),
    reset: () => stop('idle'),
    async run(input) {
      const previous = controller;
      const current = ++generation;
      const active = new AbortController();
      controller = active;
      const ownsState = () => generation === current && controller === active;
      let removeAbort = () => {};
      try {
        const aborted = new Promise<never>((_resolve, reject) => {
          const onAbort = () => reject(new TaskCancelledError());
          active.signal.addEventListener('abort', onAbort, { once: true });
          removeAbort = () => active.signal.removeEventListener('abort', onAbort);
        });
        const operation = Promise.resolve().then(() => {
          if (active.signal.aborted || !ownsState()) throw new TaskCancelledError();
          return execute(input, { signal: active.signal });
        });
        // Observe both promises before invoking any reentrant user callbacks.
        const completion = Promise.race([operation, aborted]);
        previous?.abort();
        if (ownsState()) publish({ status: 'pending' });
        const value = await completion;
        if (active.signal.aborted || !ownsState()) throw new TaskCancelledError();
        controller = undefined;
        publish({ status: 'success', value });
        return value;
      } catch (error) {
        const failure = active.signal.aborted ? new TaskCancelledError() : error;
        if (ownsState()) {
          controller = undefined;
          publish(active.signal.aborted ? { status: 'cancelled' } : { status: 'error', error: failure });
        }
        throw failure;
      } finally {
        removeAbort();
        if (ownsState()) controller = undefined;
      }
    },
  };
}
