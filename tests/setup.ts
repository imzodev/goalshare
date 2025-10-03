import "@testing-library/jest-dom";
import { vi } from "vitest";
import React from "react";
// Ensure React is available globally for components expecting it in scope
(globalThis as any).React = React;

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
