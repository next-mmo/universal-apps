/** True when running inside a Tauri shell (desktop or mobile webview). */
export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}
