import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { I18nTestWrapper } from "@/tests/helpers/i18n-test-wrapper";

import { FloatingActionButton } from "@/components/dashboard/floating-action-button";
import { GoalSheetProvider } from "@/components/dashboard/goal-sheet-provider";

// Mock next/navigation minimal API used in other components (safe default)
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: vi.fn() }),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <I18nTestWrapper>
      <GoalSheetProvider>{children}</GoalSheetProvider>
    </I18nTestWrapper>
  );
}

describe("FAB -> CreateGoalSheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("abre el CreateGoalSheet al hacer clic en FAB 'Nueva Meta'", async () => {
    const user = userEvent.setup();
    render(<FloatingActionButton />, { wrapper: Wrapper as any });

    // Abrir FAB
    const mainFab = screen.getByRole("button", { name: /Abrir acciones/i });
    await user.click(mainFab);

    // Click directo en el botón de acción accesible 'Nueva Meta'
    const actionBtn = await screen.findByRole("button", { name: /Nueva Meta/i });
    await user.click(actionBtn);

    // Debe abrir el sheet
    expect(await screen.findByText(/Crear nueva meta/i)).toBeInTheDocument();
  });
});
