import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoalCard } from "@/components/goals/goal-card";
import { makeUserGoal } from "@/tests/test-utils/goal-fixtures";
import { withI18n } from "@/tests/helpers/i18n-test-wrapper";

describe("GoalCard (unificado)", () => {
  it("renderiza props base: título, descripción, labels y progreso", () => {
    const goal = makeUserGoal();

    render(withI18n(<GoalCard goal={goal} index={0} />));

    expect(screen.getByText(goal.title)).toBeInTheDocument();
    expect(screen.getByText(goal.description)).toBeInTheDocument();

    // Las traducciones se renderizan correctamente (texto exacto 'Progreso')
    expect(screen.getByText(/^Progreso$/i)).toBeInTheDocument();

    // Categoría
    expect(screen.getByText(goal.topicCommunity!.name)).toBeInTheDocument();

    // Porcentaje de progreso
    expect(screen.getByText(`${goal.progress}%`)).toBeInTheDocument();

    // Deadline null -> etiqueta de "Sin fecha límite" debería aparecer a través de formatDeadline
    expect(screen.getByText(/Sin fecha límite/i)).toBeInTheDocument();

    // daysLeft = 1 -> etiqueta "1 día restante"
    expect(screen.getByText(/1 día restante/i)).toBeInTheDocument();

    // lastUpdateAt reciente -> "Actualizado hace instantes"
    expect(screen.getByText(/Actualizado hace instantes/i)).toBeInTheDocument();
  });

  it("dispara onEdit y onDelete desde el menú (single-column)", async () => {
    const user = userEvent.setup();
    const goal = makeUserGoal();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const { container } = render(
      withI18n(<GoalCard goal={goal} index={1} layout="single-column" onEdit={onEdit} onDelete={onDelete} />)
    );

    // Abrir el dropdown de acciones
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
    await user.click(buttons[0]!);

    // Clicar en Editar
    await user.click(screen.getByText("Editar"));
    expect(onEdit).toHaveBeenCalledWith(goal);

    // Volver a abrir y clicar en Eliminar
    await user.click(buttons[0]!);
    await user.click(screen.getByText("Eliminar"));
    expect(onDelete).toHaveBeenCalledWith(goal);
  });

  it("renderiza acciones responsivas en multi-column (dropdown móvil presente)", async () => {
    const user = userEvent.setup();
    const goal = makeUserGoal();
    const onEdit = vi.fn();

    const { container } = render(withI18n(<GoalCard goal={goal} index={2} layout="multi-column" onEdit={onEdit} />));

    // Debe existir un botón para abrir el menú (md:hidden) presente en el DOM
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);

    // Abrimos el menú móvil y hacemos clic en Editar
    await user.click(buttons[0]!);
    await user.click(screen.getByText("Editar"));
    expect(onEdit).toHaveBeenCalledWith(goal);
  });
});
