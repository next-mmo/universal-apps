import { afterEach } from 'vitest';

// Testing Library only self-registers cleanup when the test globals are enabled. This workspace
// imports `describe`/`it` explicitly instead, so unmounting is wired up here.
afterEach(async () => {
  if (typeof document === 'undefined') return;
  const { cleanup } = await import('@testing-library/react');
  cleanup();

  // Radix locks pointer events on the body while a Select, DropdownMenu, or Dialog is open. A test
  // that leaves one open would otherwise make every later click a silent no-op, because userEvent
  // honours pointer-events.
  document.body.style.pointerEvents = '';
  document.body.removeAttribute('data-scroll-locked');
  document.body.style.overflow = '';
});

// jsdom does not implement the APIs the Radix primitives reach for. Without these, a Select,
// DropdownMenu, or Tooltip trigger renders but never opens, which silently turns an interaction
// test into a no-op assertion.
if (typeof Element !== 'undefined') {
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => {};
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}
