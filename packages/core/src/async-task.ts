/** Headless lifecycle for uploads, previews, searches, or generation jobs. */
export type TaskState<T> = {
    status: 'idle';
} | {
    status: 'pending';
} | {
    status: 'success';
    value: T;
} | {
    status: 'error';
    error: unknown;
} | {
    status: 'cancelled';
};
export class TaskCancelledError extends Error {
    constructor() { super('Task cancelled'); this.name = 'AbortError'; }
}
export interface AsyncTask<TInput, TOutput> {
    getSnapshot(): TaskState<TOutput>;
    subscribe(listener: () => void): () => void;
    run(input: TInput): Promise<TOutput>;
    cancel(): void;
    reset(): void;
}
/**
 * Latest invocation wins. Cancellation rejects promptly even if an adapter ignores
 * its AbortSignal; adapters must honor the signal to stop underlying side effects.
 * Consumers must handle run() rejections, including cancellation.
 */
export function createAsyncTask<TInput, TOutput>(execute: (input: TInput, context: {
    signal: AbortSignal;
}) => TOutput | Promise<TOutput>): AsyncTask<TInput, TOutput> {
    let state: TaskState<TOutput> = {
        status: 'idle'
    };
    let controller: AbortController | undefined;
    let generation = 0;
    const listeners = new Set<() => void>();
    function publish(next: TaskState<TOutput>) {
        state = next;
        for (const listener of [...listeners]) {
            try {
                listener();
            }
            catch (error) {
                queueMicrotask(() => { throw error; });
            }
        }
    }
    function cancel() {
        if (controller && !controller.signal.aborted) {
            controller.abort();
            publish({
                status: 'cancelled'
            });
        }
    }
    return {
        getSnapshot: () => state,
        subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
        cancel,
        reset() {
            cancel();
            generation++;
            controller = undefined;
            publish({
                status: 'idle'
            });
        },
        async run(input) {
            cancel();
            const current = ++generation;
            const active = new AbortController();
            controller = active;
            publish({
                status: 'pending'
            });
            let removeAbort = () => { };
            try {
                const aborted = new Promise<never>((_resolve, reject) => {
                    const onAbort = () => reject(new TaskCancelledError());
                    active.signal.addEventListener('abort', onAbort, {
                        once: true
                    });
                    removeAbort = () => active.signal.removeEventListener('abort', onAbort);
                    if (active.signal.aborted)
                        onAbort();
                });
                const operation = Promise.resolve().then(() => {
                    if (active.signal.aborted)
                        throw new TaskCancelledError();
                    return execute(input, {
                        signal: active.signal
                    });
                });
                const value = await Promise.race([operation, aborted]);
                if (active.signal.aborted)
                    throw new TaskCancelledError();
                if (current === generation) {
                    controller = undefined;
                    publish({
                        status: 'success', value
                    });
                }
                return value;
            }
            catch (error) {
                if (current === generation && state.status !== 'cancelled')
                    publish(active.signal.aborted ? {
                        status: 'cancelled'
                    } : {
                        status: 'error', error
                    });
                throw error;
            }
            finally {
                removeAbort();
                if (current === generation)
                    controller = undefined;
            }
        },
    };
}
