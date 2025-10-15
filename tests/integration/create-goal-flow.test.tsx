import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoalSheetProvider, useGoalSheet } from "@/components/dashboard/goal-sheet-provider";

function TestOpener() {
  const { openSheet } = useGoalSheet();
  return (
    <button type="button" onClick={() => openSheet()}>
      Abrir Sheet
    </button>
  );
}

function Wrapper() {
  return (
    <GoalSheetProvider>
      <TestOpener />
    </GoalSheetProvider>
  );
}

const originalFetch = global.fetch;

describe("CreateGoalSheet integration - errores y edición", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch as any;
  });

  it("muestra error y mantiene abierto cuando falla createGoal", async () => {
    const user = userEvent.setup();

    // topics, ai, createGoal (fails)
    const fetchMock = vi
      .fn()
      // topics
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ communities: [{ id: "c1", name: "Fitness", slug: "fitness" }] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }) as any
      )
      // ai milestones
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            milestones: [
              { title: "M1", weight: 50 },
              { title: "M2", weight: 50 },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        ) as any
      )
      // createGoal (error)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "boom" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }) as any
      );

    global.fetch = fetchMock as any;

    render(<Wrapper />);

    await user.click(screen.getByRole("button", { name: /Abrir Sheet/i }));

    // Completar form mínimo
    await user.type(screen.getByLabelText(/Título/i), "Meta A");
    await user.type(screen.getByLabelText(/Descripción/i), "Descripción suficiente");
    const combo = screen.getByRole("combobox");
    await user.click(combo);
    await user.keyboard("{ArrowDown}{Enter}");

    await user.click(screen.getByRole("button", { name: /Siguiente: Generar milestones/i }));

    // En preview: guardar (debe fallar y mostrar error)
    const save = await screen.findByRole("button", { name: /Crear meta y guardar milestones/i });
    await user.click(save);

    // El sheet debe seguir abierto (título del sheet visible) y debe mostrar error de red
    expect(await screen.findByText(/Crear nueva meta/i)).toBeInTheDocument();
    expect(await screen.findByText(/Error de red/i)).toBeInTheDocument();
  }, 20000);

  it("muestra error cuando falla createGoalMilestones y mantiene abierto", async () => {
    const user = userEvent.setup();

    // topics, ai, createGoal (ok), milestones (fails)
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ communities: [{ id: "c1", name: "Fitness", slug: "fitness" }] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }) as any
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            milestones: [
              { title: "M1", weight: 50 },
              { title: "M2", weight: 50 },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        ) as any
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ goal: { id: "g1" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }) as any
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "boom" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }) as any
      );

    global.fetch = fetchMock as any;

    render(<Wrapper />);

    await user.click(screen.getByRole("button", { name: /Abrir Sheet/i }));

    await user.type(screen.getByLabelText(/Título/i), "Meta B");
    await user.type(screen.getByLabelText(/Descripción/i), "Descripción suficiente");
    const combo = screen.getByRole("combobox");
    await user.click(combo);
    await user.keyboard("{ArrowDown}{Enter}");

    await user.click(screen.getByRole("button", { name: /Siguiente: Generar milestones/i }));

    const save = await screen.findByRole("button", { name: /Crear meta y guardar milestones/i });
    await user.click(save);

    expect(await screen.findByText(/Crear nueva meta/i)).toBeInTheDocument();
    expect(await screen.findByText(/Error de red/i)).toBeInTheDocument();
  }, 20000);

  it("flujo de edición: volver a form, editar y regresar a preview", async () => {
    const user = userEvent.setup();

    // topics, ai (dos veces por volver a generar), createGoal ok, milestones ok
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ communities: [{ id: "c1", name: "Fitness", slug: "fitness" }] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }) as any
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            milestones: [
              { title: "M1", weight: 50 },
              { title: "M2", weight: 50 },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        ) as any
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            milestones: [
              { title: "M1", weight: 50 },
              { title: "M2", weight: 50 },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        ) as any
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ goal: { id: "g1" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }) as any
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }) as any
      );

    global.fetch = fetchMock as any;

    render(<Wrapper />);

    await user.click(screen.getByRole("button", { name: /Abrir Sheet/i }));

    await user.type(screen.getByLabelText(/Título/i), "Meta C");
    await user.type(screen.getByLabelText(/Descripción/i), "Descripción suficiente");
    const combo = screen.getByRole("combobox");
    await user.click(combo);
    await user.keyboard("{ArrowDown}{Enter}");

    await user.click(screen.getByRole("button", { name: /Siguiente: Generar milestones/i }));

    // Estamos en preview; botón Editar datos regresa a form
    await user.click(screen.getByRole("button", { name: /Editar datos/i }));

    // Editar el título y volver a generar
    const titleInput = screen.getByLabelText(/Título/i) as HTMLInputElement;
    await user.clear(titleInput);
    await user.type(titleInput, "Meta C Editada");

    await user.click(screen.getByRole("button", { name: /Siguiente: Generar milestones/i }));

    // En preview debe verse el nuevo título en el resumen (badge)
    expect(await screen.findByText(/Meta C Editada/i)).toBeInTheDocument();

    // Guardar para completar
    const save = await screen.findByRole("button", { name: /Crear meta y guardar milestones/i });
    await user.click(save);

    // Sheet debe cerrarse (título no visible)
    await waitFor(() => {
      expect(screen.queryByText(/Crear nueva meta/i)).not.toBeInTheDocument();
    });
  }, 25000);
});
