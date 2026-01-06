"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { UserFormValues } from "./user-form";
import { UserForm } from "./user-form";
import { updateUser } from "@/app/actions/admin-users-mutations";
import { toast } from "sonner";

interface User {
  userId: string;
  username: string | null;
  displayName: string | null;
  role: "user" | "admin";
}

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  if (!user) return null;

  const handleSubmit = async (values: UserFormValues) => {
    setIsLoading(true);
    try {
      const result = await updateUser(user.userId, values);
      if (result.success) {
        toast.success("User updated successfully");
        onOpenChange(false);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User Profile</DialogTitle>
          <DialogDescription>Modify details for &quot;{user.displayName || user.username}&quot;.</DialogDescription>
        </DialogHeader>
        <UserForm
          initialValues={{
            displayName: user.displayName || "",
            username: user.username || "",
            role: user.role,
          }}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
