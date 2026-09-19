import { invoke } from '@tauri-apps/api/core';
import { isTauri } from './is-tauri';

/** Bridge smoke test: real Rust command on desktop, local fallback on web. */
export async function greet(name: string): Promise<string> {
  if (!isTauri()) {
    return `Hello, ${name}! (web fallback — no Rust backend in the browser)`;
  }
  return invoke<string>('greet', { name });
}
