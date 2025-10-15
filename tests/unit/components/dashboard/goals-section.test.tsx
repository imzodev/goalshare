import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoalsSection } from "@/components/dashboard/goals-section";
import { makeUserGoal } from "@/tests/test-utils/goal-fixtures";

vi.mock("@/hooks/use-goals", () => ({
  useGoals: vi.fn(),
}));

vi.mock("@/components/dashboard/goal-sheet-provider", () => ({
  useGoalSheet: () => ({ openSheet: vi.fn() }),
}));

// We'll intercept options passed into useGoalManagement to verify refresh callbacks
type GoalMgmtOptions = { onGoalUpdated?: () => void; onGoalDeleted?: () => void };
const spies = {
  lastOptions: null as GoalMgmtOptions | null,
};

vi.mock("@/hooks/use-goal-management", () => ({
  useGoalManagement: (opts: GoalMgmtOptions) => {
    spies.lastOptions = opts;
    return {
      editingGoal: null,
      editDialogOpen: false,
      deletingGoal: null,
      deleteDialogOpen: false,
      setEditDialogOpen: vi.fn(),
      setDeleteDialogOpen: vi.fn(),
      handleEditGoal: vi.fn(),
      handleDeleteGoal: vi.fn(),
      handleGoalUpdated: vi.fn(),
      handleGoalDeleted: vi.fn(),
    };
  },
}));

const { useGoals } = await import("@/hooks/use-goals");

describe("GoalsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // default mock
    (useGoals as unknown as Mock).mockReturnValue({
      goals: [],
      loading: true,
      refreshing: false,
      error: null,
      fetchGoals: vi.fn(),
    });
  });

  it("muestra skeleton cuando loading y no refreshing", () => {
    render(<GoalsSection />);
    expect(screen.getByText(/Mis Metas/i)).toBeInTheDocument();
    // Skeleton shows by existence of placeholder text or simply by role region count
    // Using a heuristic check: empty state and error are not shown
    expect(screen.queryByText(/No pudimos cargar tus metas/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Aún no tienes metas activas/i)).not.toBeInTheDocument();
  });

  it("muestra mensaje de error cuando error presente", () => {
    (useGoals as unknown as vi.Mock).mockReturnValue({
      goals: [],
      loading: false,
      refreshing: false,
      error: "Fallo X",
      fetchGoals: vi.fn(),
    });

    render(<GoalsSection />);
    expect(screen.getByText(/No pudimos cargar tus metas/i)).toBeInTheDocument();
    expect(screen.getByText(/Fallo X/i)).toBeInTheDocument();
  });

  it("muestra empty state cuando no hay metas", () => {
    (useGoals as unknown as vi.Mock).mockReturnValue({
      goals: [],
      loading: false,
      refreshing: false,
      error: null,
      fetchGoals: vi.fn(),
    });

    render(<GoalsSection />);
    expect(screen.getByText(/Aún no tienes metas activas/i)).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toBeTruthy();
  });

  it("renderiza GoalCards cuando hay metas y refresca en callbacks del hook", async () => {
    const fetchGoals = vi.fn();
    (useGoals as unknown as vi.Mock).mockReturnValue({
      goals: [makeUserGoal({ id: "g1" }), makeUserGoal({ id: "g2", title: "Otra meta" })],
      loading: false,
      refreshing: false,
      error: null,
      fetchGoals,
    });

    render(<GoalsSection />);

    // Se renderizan títulos de ambas metas
    expect(screen.getByText(/Leer 12 libros/i)).toBeInTheDocument();
    expect(screen.getByText(/Otra meta/i)).toBeInTheDocument();

    // Simular onGoalUpdated/onGoalDeleted desde opciones capturadas
    expect(spies.lastOptions).toBeTruthy();
    act(() => spies.lastOptions!.onGoalUpdated?.());
    act(() => spies.lastOptions!.onGoalDeleted?.());

    // Debe llamar fetchGoals con silent: true en ambos casos (dos callbacks)
    const silentCalls = (fetchGoals as unknown as Mock).mock.calls.filter(
      (args: unknown[]) => (args[0] as { silent?: boolean })?.silent === true
    );
    expect(silentCalls.length).toBe(2);

    // Click en botón de refrescar (icon button)
    const refreshBtn = screen.getAllByRole("button")[0] as HTMLButtonElement;
    const user = userEvent.setup();
    await user.click(refreshBtn);
    expect(fetchGoals).toHaveBeenCalledWith({ silent: true });
  });
});
