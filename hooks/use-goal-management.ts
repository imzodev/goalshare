import { useState, useCallback } from "react";
import type { UserGoalSummary } from "@/types/goals";

interface UseGoalManagementOptions {
  onGoalUpdated?: () => void;
  onGoalDeleted?: () => void;
}

export function useGoalManagement(options: UseGoalManagementOptions = {}) {
  const { onGoalUpdated, onGoalDeleted } = options;

  // Estados para edición
  const [editingGoal, setEditingGoal] = useState<UserGoalSummary | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Estados para eliminación
  const [deletingGoal, setDeletingGoal] = useState<UserGoalSummary | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleEditGoal = useCallback((goal: UserGoalSummary) => {
    setEditingGoal(goal);
    setEditDialogOpen(true);
  }, []);

  const handleDeleteGoal = useCallback((goal: UserGoalSummary) => {
    setDeletingGoal(goal);
    setDeleteDialogOpen(true);
  }, []);

  const handleGoalUpdated = useCallback(() => {
    setEditDialogOpen(false);
    setEditingGoal(null);
    onGoalUpdated?.();
  }, [onGoalUpdated]);

  const handleGoalDeleted = useCallback(() => {
    setDeleteDialogOpen(false);
    setDeletingGoal(null);
    onGoalDeleted?.();
  }, [onGoalDeleted]);

  return {
    // Estados
    editingGoal,
    editDialogOpen,
    deletingGoal,
    deleteDialogOpen,
    // Setters para control manual si es necesario
    setEditDialogOpen,
    setDeleteDialogOpen,
    // Handlers
    handleEditGoal,
    handleDeleteGoal,
    handleGoalUpdated,
    handleGoalDeleted,
  };
}
