import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGoalManagement } from "@/hooks/use-goal-management";
import { makeUserGoal } from "@/tests/test-utils/goal-fixtures";

describe("useGoalManagement", () => {
  it("estado inicial cerrado sin metas en edición/eliminación", () => {
    const { result } = renderHook(() => useGoalManagement());

    expect(result.current.editDialogOpen).toBe(false);
    expect(result.current.deleteDialogOpen).toBe(false);
    expect(result.current.editingGoal).toBeNull();
    expect(result.current.deletingGoal).toBeNull();
  });

  it("handleEditGoal abre diálogo y asigna editingGoal", () => {
    const { result } = renderHook(() => useGoalManagement());

    act(() => {
      const goal = makeUserGoal();
      result.current.handleEditGoal(goal);
    });

    expect(result.current.editDialogOpen).toBe(true);
    expect(result.current.editingGoal).not.toBeNull();
  });

  it("handleDeleteGoal abre diálogo y asigna deletingGoal", () => {
    const { result } = renderHook(() => useGoalManagement());

    act(() => {
      const goal = makeUserGoal();
      result.current.handleDeleteGoal(goal);
    });

    expect(result.current.deleteDialogOpen).toBe(true);
    expect(result.current.deletingGoal).not.toBeNull();
  });

  it("handleGoalUpdated cierra diálogo, limpia estado y llama callback", () => {
    const onGoalUpdated = vi.fn();
    const { result } = renderHook(() => useGoalManagement({ onGoalUpdated }));

    act(() => {
      const goal = makeUserGoal();
      result.current.handleEditGoal(goal);
    });

    act(() => {
      result.current.handleGoalUpdated();
    });

    expect(result.current.editDialogOpen).toBe(false);
    expect(result.current.editingGoal).toBeNull();
    expect(onGoalUpdated).toHaveBeenCalledTimes(1);
  });

  it("handleGoalDeleted cierra diálogo, limpia estado y llama callback", () => {
    const onGoalDeleted = vi.fn();
    const { result } = renderHook(() => useGoalManagement({ onGoalDeleted }));

    act(() => {
      const goal = makeUserGoal();
      result.current.handleDeleteGoal(goal);
    });

    act(() => {
      result.current.handleGoalDeleted();
    });

    expect(result.current.deleteDialogOpen).toBe(false);
    expect(result.current.deletingGoal).toBeNull();
    expect(onGoalDeleted).toHaveBeenCalledTimes(1);
  });

  it("permite control manual de los flags de diálogo", () => {
    const { result } = renderHook(() => useGoalManagement());

    act(() => {
      result.current.setEditDialogOpen(true);
      result.current.setDeleteDialogOpen(true);
    });

    expect(result.current.editDialogOpen).toBe(true);
    expect(result.current.deleteDialogOpen).toBe(true);
  });

  it("handleGoalUpdated funciona sin callback opcional", () => {
    const { result } = renderHook(() => useGoalManagement());

    act(() => {
      const goal = makeUserGoal();
      result.current.handleEditGoal(goal);
    });

    act(() => {
      result.current.handleGoalUpdated();
    });

    expect(result.current.editDialogOpen).toBe(false);
    expect(result.current.editingGoal).toBeNull();
  });

  it("handleGoalDeleted funciona sin callback opcional", () => {
    const { result } = renderHook(() => useGoalManagement());

    act(() => {
      const goal = makeUserGoal();
      result.current.handleDeleteGoal(goal);
    });

    act(() => {
      result.current.handleGoalDeleted();
    });

    expect(result.current.deleteDialogOpen).toBe(false);
    expect(result.current.deletingGoal).toBeNull();
  });
});
