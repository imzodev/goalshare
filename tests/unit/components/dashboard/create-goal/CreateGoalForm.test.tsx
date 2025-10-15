import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateGoalForm, type CreateGoalFormValues } from "@/components/dashboard/create-goal/CreateGoalForm";
import type { MilestoneItem } from "@/types/goals";

vi.mock("@/api-client/ai", () => {
  return {
    generateMilestones: vi.fn(
      async () =>
        [
          { title: "M1", weight: 50 },
          { title: "M2", weight: 50 },
        ] satisfies MilestoneItem[]
    ),
    generateDescription: vi.fn(async (title: string) => `Sugerencia para: ${title}`),
  };
});

const { generateMilestones, generateDescription } = await import("@/api-client/ai");

describe("CreateGoalForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderForm(overrides: Partial<Parameters<typeof CreateGoalForm>[0]> = {}) {
    const defaultValues: CreateGoalFormValues = {
      title: "",
      description: "",
      deadline: "",
      topicCommunityId: "",
    };
    const communities = [{ id: "c1", name: "Fitness", slug: "fitness" }];
    const onMilestonesReady = vi.fn();
    const onCancel = vi.fn();
    const onError = vi.fn();

    render(
      <CreateGoalForm
        defaultValues={{ ...defaultValues, ...(overrides as any)?.defaultValues }}
        communities={(overrides as any)?.communities ?? communities}
        loadingCommunities={(overrides as any)?.loadingCommunities ?? false}
        onMilestonesReady={(overrides as any)?.onMilestonesReady ?? onMilestonesReady}
        onCancel={(overrides as any)?.onCancel ?? onCancel}
        onError={(overrides as any)?.onError ?? onError}
      />
    );

    return { onMilestonesReady, onCancel, onError };
  }

  it("renderiza campos y valida con RHF (onTouched)", async () => {
    const user = userEvent.setup();
    renderForm();

    // Campos visibles
    const title = screen.getByLabelText(/Título/i);
    const desc = screen.getByLabelText(/Descripción/i);
    expect(title).toBeInTheDocument();
    expect(desc).toBeInTheDocument();
    expect(screen.getByLabelText(/Fecha límite/i)).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();

    // onTouched: disparar blur para que RHF marque los campos como tocados
    await user.click(title);
    await user.click(desc); // blur título
    await user.click(title); // blur descripción

    // Ahora los mensajes deben mostrarse por onTouched
    expect(await screen.findByText(/El título debe tener al menos 3 caracteres/i)).toBeInTheDocument();
    expect(await screen.findByText(/La descripción debe tener al menos 10 caracteres/i)).toBeInTheDocument();

    // Cuando el formulario es inválido, el botón de submit debe estar deshabilitado
    const submitBtn = screen.getByRole("button", { name: /Siguiente: Generar milestones/i });
    expect(submitBtn).toBeDisabled();
  });

  it("carga defaultValues y mantiene valores", async () => {
    const user = userEvent.setup();
    renderForm({
      defaultValues: { title: "Correr", description: "Desc suficiente", deadline: "", topicCommunityId: "c1" },
    });

    expect((screen.getByLabelText(/Título/i) as HTMLInputElement).value).toBe("Correr");
    expect((screen.getByLabelText(/Descripción/i) as HTMLTextAreaElement).value).toMatch(/Desc suficiente/);

    // Cambiar título
    await user.clear(screen.getByLabelText(/Título/i));
    await user.type(screen.getByLabelText(/Título/i), "Correr 5K");
    expect((screen.getByLabelText(/Título/i) as HTMLInputElement).value).toBe("Correr 5K");
  });

  it("genera descripción con AI y agrega al campo", async () => {
    const user = userEvent.setup();
    renderForm({ defaultValues: { title: "Leer", description: "Inicio", deadline: "", topicCommunityId: "c1" } });

    await user.click(screen.getByRole("button", { name: /Generar descripción/i }));
    await waitFor(() => expect(generateDescription).toHaveBeenCalled());

    const desc = screen.getByLabelText(/Descripción/i) as HTMLTextAreaElement;
    expect(desc.value).toMatch(/Sugerencia para: Leer/);
  });

  it("submit: llama generateMilestones y onMilestonesReady con datos", async () => {
    const user = userEvent.setup();
    const { onMilestonesReady } = renderForm();

    // Completar campos mínimos
    await user.type(screen.getByLabelText(/Título/i), "Correr 5K diarios");
    await user.type(screen.getByLabelText(/Descripción/i), "Correr todos los días por la mañana");

    // Seleccionar comunidad
    const combo = screen.getByRole("combobox");
    await user.click(combo);
    await user.keyboard("{ArrowDown}{Enter}");

    await user.click(screen.getByRole("button", { name: /Siguiente: Generar milestones/i }));

    await waitFor(() => expect(generateMilestones).toHaveBeenCalled());
    await waitFor(() => expect(onMilestonesReady).toHaveBeenCalled());

    const call = (onMilestonesReady as any).mock.calls[0];
    expect(call[0]).toMatchObject({
      title: expect.any(String),
      description: expect.any(String),
      topicCommunityId: expect.any(String),
    });
    expect(call[1]).toEqual([
      { title: "M1", weight: 50 },
      { title: "M2", weight: 50 },
    ]);
  });

  it("onCancel es llamado al presionar Cancelar", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderForm();

    await user.click(screen.getByRole("button", { name: /Cancelar/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("maneja errores de generación de milestones", async () => {
    (generateMilestones as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("boom"));
    const user = userEvent.setup();
    const { onError } = renderForm();

    await user.type(screen.getByLabelText(/Título/i), "Correr 5K diarios");
    await user.type(screen.getByLabelText(/Descripción/i), "Correr todos los días por la mañana");

    const combo = screen.getByRole("combobox");
    await user.click(combo);
    await user.keyboard("{ArrowDown}{Enter}");

    await user.click(screen.getByRole("button", { name: /Siguiente: Generar milestones/i }));
    await waitFor(() => expect(onError).toHaveBeenCalledWith(expect.stringMatching(/Error de red/)));
  });
});
