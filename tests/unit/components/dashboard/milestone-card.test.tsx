import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// Mock date utils to avoid relying on fake timers; use a fixed base date (2025-01-01)
vi.mock("@/utils/date-utils", () => {
  const MS_IN_DAY = 24 * 60 * 60 * 1000;
  const base = new Date("2025-01-01T12:00:00Z");
  function toDateOnly(date: Date) {
    return date.toISOString().slice(0, 10);
  }
  return {
    weeksUntil: (dueDate?: string | null) => {
      if (!dueDate) return null;
      const parsed = new Date(`${dueDate}T00:00:00Z`);
      if (Number.isNaN(parsed.getTime())) return null;
      const diffMs = parsed.getTime() - base.getTime();
      const weeks = Math.ceil(diffMs / (MS_IN_DAY * 7));
      return weeks;
    },
    toISODate: (d: Date) => toDateOnly(d),
  } as unknown as typeof import("@/utils/date-utils");
});

import { MilestoneCard } from "../../../../components/dashboard/milestone-card";

function setup(overrides: Partial<React.ComponentProps<typeof MilestoneCard>> = {}) {
  const onToggle = vi.fn();
  const onChangeTitle = vi.fn();
  const onChangeDue = vi.fn();
  const onChangeDescription = vi.fn();
  const onChangeWeight = vi.fn();

  const props = {
    index: 0,
    item: { title: "", description: "", dueDate: undefined, weight: 25 },
    expanded: false,
    onToggle,
    onChangeTitle,
    onChangeDue,
    onChangeDescription,
    onChangeWeight,
    ...overrides,
  } as React.ComponentProps<typeof MilestoneCard>;

  const utils = render(<MilestoneCard {...props} />);
  return { utils, props, onToggle, onChangeTitle, onChangeDue, onChangeDescription, onChangeWeight };
}

describe("MilestoneCard", () => {
  it("renders with placeholder title and weight badge", () => {
    setup();
    expect(screen.getByPlaceholderText("Hito 1")).toBeInTheDocument();
    expect(screen.getAllByText(/25%/i)[0]).toBeInTheDocument();
  });

  it("calls onChangeTitle when typing in title input", async () => {
    const user = userEvent.setup();
    const { onChangeTitle } = setup();
    const input = screen.getByPlaceholderText("Hito 1");
    const text = "Plan inicial";
    await user.type(input, text);
    expect(onChangeTitle).toHaveBeenCalled();
    // With a pure callback and no state wiring, each keypress triggers a single-char value
    const calls = onChangeTitle.mock.calls.map((c) => c[0]);
    expect(calls.length).toBe(text.length);
    expect(calls[0]).toBe(text[0]);
    expect(calls.at(-1)).toBe(text.at(-1));
  });

  it("shows 'Sin fecha' when no dueDate and weeksUntil is null", () => {
    setup();
    expect(screen.getByText(/Sin fecha/i)).toBeInTheDocument();
  });

  it("shows weeks remaining string when dueDate provided", () => {
    // 2025-01-08 is 7 days from fixed base => 1 semana
    setup({ item: { title: "H1", weight: 25, dueDate: "2025-01-08" } as any });
    expect(screen.getByText(/1 semana\b/i)).toBeInTheDocument();
  });

  it("toggles details via button", async () => {
    const user = userEvent.setup();
    const { onToggle } = setup();
    const btn = screen.getByTitle(/editar|ocultar detalles/i);
    await user.click(btn);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("when expanded renders due date and description fields and calls change handlers", async () => {
    const user = userEvent.setup();
    const { onChangeDue, onChangeDescription } = setup({ expanded: true });

    const due = screen.getByLabelText(/Fecha objetivo/i) as HTMLInputElement;
    await user.clear(due);
    due.focus();
    await user.paste("2025-02-15");
    expect(onChangeDue).toHaveBeenCalled();
    const lastDue = (onChangeDue.mock.calls.at(-1) ?? [""])[0];
    expect(lastDue).toBe("2025-02-15");

    const desc = screen.getByLabelText(/Descripción/i) as HTMLTextAreaElement;
    const text = "Detalles del hito";
    await user.type(desc, text);
    expect(onChangeDescription).toHaveBeenCalled();
    const calls = onChangeDescription.mock.calls.map((c) => c[0]);
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[0]).toBe(text[0]);
    expect(calls.at(-1)).toBe(text.at(-1));
  });

  it("invokes onChangeWeight when moving the slider (keyboard)", async () => {
    const user = userEvent.setup();
    const { onChangeWeight } = setup();

    // Find the slider thumb (role="slider") and press ArrowRight
    const thumb = screen.getByRole("slider");
    thumb.focus();
    await user.keyboard("{ArrowRight}");
    expect(onChangeWeight).toHaveBeenCalled();
  });
});
