import { createAsyncTask } from '@package/core/async-task';
/** The adapter owns transport and honors cancellation; the task owns lifecycle. */
export function createPreviewTask(load: (id: string, signal: AbortSignal) => Promise<string>) {
    return createAsyncTask((id: string, { signal }) => load(id, signal));
}
// Subscribe to getSnapshot() in the chosen framework. Await/catch run(id).
// cancel() rejects the run with AbortError; it is not a server-side rollback.
