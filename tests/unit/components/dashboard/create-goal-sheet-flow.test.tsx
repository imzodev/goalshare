import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { GoalSheetProvider, useGoalSheet } from "@/components/dashboard/goal-sheet-provider";
import { applyDomPolyfills } from "@/tests/test-utils/jsdom-polyfills";

// Minimal opener to trigger the sheet from context (simula click en 'Nueva Meta')
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

describe("CreateGoalSheet flow", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    applyDomPolyfills();
  });

  afterEach(() => {
    global.fetch = originalFetch as any;
  });

  it("genera milestones y crea la meta, cerrando el sheet y emitiendo evento", async () => {
    const user = userEvent.setup();

    // Mock fetch secuencial: 1) topics (when sheet opens), 2) ai/milestones, 3) goals (POST), 4) milestones (POST)
    const fetchMock = vi
      .fn()
      // topics
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ communities: [{ id: "c1", name: "Fitness", slug: "fitness" }] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }) as any
      )
      // ai/milestones
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
      // create goal
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ goal: { id: "g1" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }) as any
      )
      // persist milestones
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }) as any
      );
    global.fetch = fetchMock as any;

    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    render(<Wrapper />);

    // Abre el sheet
    await user.click(screen.getByRole("button", { name: /Abrir Sheet/i }));

    // Form step: llena campos mínimos
    await user.type(screen.getByLabelText(/Título/i), "Correr 5K diarios");
    await user.type(screen.getByLabelText(/Descripción/i), "Correr todos los días por la mañana");

    // Seleccionar comunidad (topics ya mockeado)
    const combo = screen.getByRole("combobox");
    await user.click(combo);
    // Usa navegación de teclado para evitar issues de pointer events en jsdom
    await user.keyboard("{ArrowDown}{Enter}");

    // Avanzar: generar milestones
    await user.click(screen.getByRole("button", { name: /Siguiente: Generar milestones/i }));

    // Ahora estamos en preview; botón debe estar habilitado (weights=100)
    const createBtn = await screen.findByRole("button", { name: /Crear meta y guardar milestones/i });
    expect(createBtn).toBeEnabled();

    // Click para persistir
    await user.click(createBtn);

    // Espera a que el sheet se cierre (título ya no visible)
    await waitFor(() => {
      expect(screen.queryByText(/Crear nueva meta/i)).not.toBeInTheDocument();
    });

    // Verifica que se haya emitido el evento global para refrescar
    expect(dispatchSpy).toHaveBeenCalled();
    const evt = dispatchSpy.mock.calls.find(
      (c) => c[0] instanceof CustomEvent && (c[0] as CustomEvent).type === "goal-created"
    );
    expect(evt).toBeTruthy();
  }, 15000);
});
