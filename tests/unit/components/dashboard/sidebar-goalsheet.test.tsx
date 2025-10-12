import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/navigation minimal API used
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: vi.fn() }),
}));

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { GoalSheetProvider } from "@/components/dashboard/goal-sheet-provider";
import { applyDomPolyfills } from "@/tests/test-utils/jsdom-polyfills";

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <GoalSheetProvider>{children}</GoalSheetProvider>
    </SidebarProvider>
  );
}

describe("Sidebar QuickActions -> CreateGoalSheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    applyDomPolyfills();
  });

  it("abre el CreateGoalSheet al hacer clic en 'Nueva Meta'", async () => {
    const user = userEvent.setup();
    // Mock topics fetch invoked on sheet open
    const originalFetch = global.fetch;
    const fetchMock = vi.fn().mockResolvedValueOnce(
      new Response(JSON.stringify({ communities: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }) as any
    );
    // Fallback to original if further calls happen
    global.fetch = fetchMock as any;

    render(<AppSidebar />, { wrapper: Wrapper as any });

    // Click en la acción rápida "Nueva Meta"
    await user.click(screen.getByRole("button", { name: /Nueva Meta/i }));

    // Debe aparecer el sheet con su título
    expect(await screen.findByText(/Crear nueva meta/i)).toBeInTheDocument();

    // restore
    global.fetch = originalFetch as any;
  });
});
