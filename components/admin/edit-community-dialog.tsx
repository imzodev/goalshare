"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CommunityForm } from "./community-form";
import { updateCommunity } from "@/app/actions/admin-communities-mutations";
import { toast } from "sonner";

interface Community {
  id: string;
  name: string;
  slug: string;
  kind: "domain" | "topic" | "cohort";
  description: string | null;
}

interface EditCommunityDialogProps {
  community: Community | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CommunityFormValues {
  name: string;
  slug: string;
  kind: "domain" | "topic" | "cohort";
  description?: string;
}

export function EditCommunityDialog({ community, open, onOpenChange }: EditCommunityDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  if (!community) return null;

  const handleSubmit = async (values: CommunityFormValues) => {
    setIsLoading(true);
    try {
      const result = await updateCommunity(community.id, values);
      if (result.success) {
        toast.success("Community updated successfully");
        onOpenChange(false);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update community");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Community</DialogTitle>
          <DialogDescription>Update the details for &quot;{community.name}&quot;.</DialogDescription>
        </DialogHeader>
        <CommunityForm
          initialValues={{
            name: community.name,
            slug: community.slug,
            kind: community.kind,
            description: community.description || "",
          }}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
          submitLabel="Update Community"
        />
      </DialogContent>
    </Dialog>
  );
}
