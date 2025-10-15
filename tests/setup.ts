import "@testing-library/jest-dom";
import { vi } from "vitest";
import React from "react";
// Ensure React is available globally for components expecting it in scope
(globalThis as any).React = React;

// Minimal DOM polyfills for Radix Select under jsdom
if (typeof Element !== "undefined") {
  if (typeof (Element as any).prototype.scrollIntoView !== "function") {
    (Element as any).prototype.scrollIntoView = () => {};
  }
}
if (typeof HTMLElement !== "undefined") {
  if (typeof (HTMLElement as any).prototype.hasPointerCapture !== "function") {
    (HTMLElement as any).prototype.hasPointerCapture = () => false;
  }
  if (typeof (HTMLElement as any).prototype.releasePointerCapture !== "function") {
    (HTMLElement as any).prototype.releasePointerCapture = () => {};
  }
}

// Polyfill ResizeObserver for Radix Slider and other components in jsdom
if (typeof (globalThis as any).ResizeObserver === "undefined") {
  class ResizeObserverPolyfill {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(callback: any) {
      this.callback = callback;
    }

    observe(_target: Element) {}

    unobserve(_target: Element) {}
    disconnect() {}
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).ResizeObserver = ResizeObserverPolyfill as unknown as typeof ResizeObserver;
}

// Mock next/navigation useRouter for client components
vi.mock("next/navigation", async () => {
  const actual = await vi.importActual<any>("next/navigation");
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  };
});

// Basic mock for supabase client in client components
const mockClient = {
  auth: {
    signInWithPassword: vi.fn(async () => ({ data: {}, error: null })),
    signInWithOAuth: vi.fn(async () => ({ data: {}, error: null })),
    signUp: vi.fn(async () => ({ data: {}, error: null })),
  },
};

vi.mock("@/lib/supabase/client", () => {
  return {
    createClient: () => mockClient,
    __mockSupabase: mockClient,
  };
});

// Mock sonner to avoid side effects in tests
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
