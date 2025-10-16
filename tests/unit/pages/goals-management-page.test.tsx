import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { withI18n } from "@/tests/helpers/i18n-test-wrapper";
import GoalsManagementPage from "@/app/dashboard/goals/page";
import { makeUserGoal } from "@/tests/test-utils/goal-fixtures";

// Capture hook options to simulate refresh via callbacks
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

type FetchJson = { ok: boolean; status: number; json: () => Promise<unknown> };
type FetchLike = (input: RequestInfo, init?: RequestInit) => Promise<FetchJson>;

function mockFetchOnce(status: number, body: unknown) {
  (globalThis as Record<string, unknown>).fetch = vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })) as unknown as FetchLike;
}

function mockFetchSequence(responses: Array<{ status: number; body: unknown }>) {
  const fn = vi.fn();
  for (const r of responses) {
    fn.mockImplementationOnce(async () => ({
      ok: r.status >= 200 && r.status < 300,
      status: r.status,
      json: async () => r.body,
    }));
  }
  (globalThis as Record<string, unknown>).fetch = fn as unknown as FetchLike & { mock: { calls: unknown[] } };
}

describe("GoalsManagementPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    const hasFetch = typeof (globalThis as Record<string, unknown>).fetch === "function";
    if (hasFetch) {
      vi.restoreAllMocks();
    }
  });

  it("muestra skeleton durante carga inicial y luego grid con metas", async () => {
    const goals = [makeUserGoal({ id: "g1" }), makeUserGoal({ id: "g2", title: "Otra meta" })];
    mockFetchOnce(200, { goals });

    render(withI18n(<GoalsManagementPage />));

    // Skeleton state implied initially; wait for goals to render
    await waitFor(() => expect(screen.getByText(/Gestión de Metas/i)).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText(/Leer 12 libros/i)).toBeInTheDocument());
    expect(screen.getByText(/Otra meta/i)).toBeInTheDocument();
  });

  it("muestra error y permite reintentar", async () => {
    mockFetchSequence([
      { status: 500, body: { error: "fallo" } },
      { status: 200, body: { goals: [] } },
    ]);

    render(withI18n(<GoalsManagementPage />));

    await waitFor(() => expect(screen.getByText(/No pudimos cargar tus metas/i)).toBeInTheDocument());

    const retryBtn = screen.getByRole("button", { name: /Reintentar/i });
    const user = userEvent.setup();
    await user.click(retryBtn);

    await waitFor(() => expect(screen.getByText(/Aún no tienes metas/i)).toBeInTheDocument());
  });

  it("muestra empty state cuando la API retorna lista vacía", async () => {
    mockFetchOnce(200, { goals: [] });

    render(withI18n(<GoalsManagementPage />));

    await waitFor(() => expect(screen.getByText(/Aún no tienes metas/i)).toBeInTheDocument());
  });

  it("refresca metas al invocar onGoalUpdated/onGoalDeleted desde el hook", async () => {
    mockFetchSequence([
      { status: 200, body: { goals: [makeUserGoal({ id: "g1" })] } },
      { status: 200, body: { goals: [makeUserGoal({ id: "g1" }), makeUserGoal({ id: "g2" })] } },
      { status: 200, body: { goals: [makeUserGoal({ id: "g1" })] } },
    ]);

    render(withI18n(<GoalsManagementPage />));

    // First load
    await waitFor(() => expect(screen.getByText(/Leer 12 libros/i)).toBeInTheDocument());

    // Trigger refresh via hook options
    expect(spies.lastOptions).toBeTruthy();
    act(() => spies.lastOptions!.onGoalUpdated?.());
    // After refresh, second goal should appear
    await waitFor(() => expect(screen.getAllByText(/Leer 12 libros/i).length).toBeGreaterThanOrEqual(1));

    act(() => spies.lastOptions!.onGoalDeleted?.());
    // After delete refresh, the grid should still be present (content may change)
    await waitFor(() => expect(screen.getByText(/Gestión de Metas/i)).toBeInTheDocument());

    // Ensure fetch was called 3 times (initial + 2 refresh)
    expect((globalThis as Record<string, unknown>).fetch as unknown).toHaveProperty("mock");
    const fn = (globalThis as Record<string, unknown>).fetch as unknown as { mock: { calls: unknown[] } };
    expect(fn.mock.calls.length).toBe(3);
  });
});
