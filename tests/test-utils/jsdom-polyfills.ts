import { vi } from "vitest";

/**
 * Apply common JSDOM polyfills used by Radix UI and responsive hooks.
 * Call this in your test's beforeEach when you interact with Radix components
 * (Select, Dialog, Sheet, etc.) or rely on matchMedia.
 */
export function applyDomPolyfills() {
  mockMatchMedia();
  mockPointerCapture();
  mockScrollIntoView();
}

/** Polyfill window.matchMedia for responsive hooks */
export function mockMatchMedia() {
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).matchMedia = (query: string) =>
      ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() }) as any;
  }
}

/** Polyfill Pointer Events methods used by Radix UI */
export function mockPointerCapture() {
  const proto = HTMLElement.prototype as any;
  if (!proto.hasPointerCapture) proto.hasPointerCapture = () => false;
  if (!proto.setPointerCapture) proto.setPointerCapture = () => {};
  if (!proto.releasePointerCapture) proto.releasePointerCapture = () => {};
}

/** Polyfill scrollIntoView used by Radix UI lists */
export function mockScrollIntoView() {
  const proto = HTMLElement.prototype as any;
  if (!proto.scrollIntoView) proto.scrollIntoView = () => {};
}
