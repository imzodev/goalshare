import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MilestonesList } from "@/components/dashboard/create-goal/MilestonesList";
import type { MilestoneItem } from "@/types/goals";

function makeItems(n: number): MilestoneItem[] {
  return Array.from({ length: n }).map((_, i) => ({ title: `M${i + 1}`, weight: 10 }));
}

describe("MilestonesList", () => {
  it("renderiza los milestones y pasa callbacks al card", async () => {
    const items = makeItems(3);
    const onToggle = vi.fn();
    const onChangeTitle = vi.fn();
    const onChangeDue = vi.fn();
    const onChangeDescription = vi.fn();
    const onChangeWeight = vi.fn();

    render(
      <MilestonesList
        milestones={items}
        expanded={{ 1: true }}
        onToggle={onToggle}
        onChangeTitle={onChangeTitle}
        onChangeDue={onChangeDue}
        onChangeDescription={onChangeDescription}
        onChangeWeight={onChangeWeight}
      />
    );

    // Comprueba que se hayan renderizado los títulos (inputs con valores)
    expect(screen.getByDisplayValue(/M1/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/M2/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/M3/i)).toBeInTheDocument();
  });
});
