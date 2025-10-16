import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { withI18n } from "@/tests/helpers/i18n-test-wrapper";
import { CreateGoalPreview } from "@/components/dashboard/create-goal/CreateGoalPreview";

function renderPreview(overrides: Partial<Parameters<typeof CreateGoalPreview>[0]> = {}) {
  const props: Parameters<typeof CreateGoalPreview>[0] = {
    milestones: overrides.milestones ?? [],
    weightSum: overrides.weightSum ?? 80,
    expanded: overrides.expanded ?? {},
    onToggle: overrides.onToggle ?? vi.fn(),
    onChangeTitle: overrides.onChangeTitle ?? vi.fn(),
    onChangeDue: overrides.onChangeDue ?? vi.fn(),
    onChangeDescription: overrides.onChangeDescription ?? vi.fn(),
    onChangeWeight: overrides.onChangeWeight ?? vi.fn(),
    onRedistribute: overrides.onRedistribute ?? vi.fn(),
    onPersist: overrides.onPersist ?? vi.fn(),
    onBack: overrides.onBack ?? vi.fn(),
    onCancel: overrides.onCancel ?? vi.fn(),
    persisting: overrides.persisting ?? false,
    pending: overrides.pending ?? false,
  };
  render(withI18n(<CreateGoalPreview {...props} />));
  return props;
}

describe("CreateGoalPreview", () => {
  it("muestra suma de pesos y deshabilita Guardar cuando != 100", () => {
    renderPreview({ weightSum: 90 });
    expect(screen.getByText(/Suma de pesos: 90%/i)).toBeInTheDocument();
    const save = screen.getByRole("button", { name: /Ajusta los pesos a 100%/i });
    expect(save).toBeDisabled();
  });

  it("habilita Guardar cuando weightSum=100 y llama onPersist", async () => {
    const onPersist = vi.fn();
    renderPreview({ weightSum: 100, onPersist });
    const save = screen.getByRole("button", { name: /Crear meta y guardar milestones/i });
    expect(save).toBeEnabled();
    await save.click();
    expect(onPersist).toHaveBeenCalled();
  });

  it("llama onRedistribute/onBack/onCancel al hacer clic", async () => {
    const onRedistribute = vi.fn();
    const onBack = vi.fn();
    const onCancel = vi.fn();
    renderPreview({ onRedistribute, onBack, onCancel });

    await screen.getByRole("button", { name: /Redistribuir pesos/i }).click();
    await screen.getByRole("button", { name: /Volver/i }).click();
    await screen.getByRole("button", { name: /Cancelar/i }).click();

    expect(onRedistribute).toHaveBeenCalled();
    expect(onBack).toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });
});
