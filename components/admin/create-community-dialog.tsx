"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CommunityForm } from "./community-form";
import { createCommunity } from "@/app/actions/admin-communities-mutations";
import { toast } from "sonner";

interface CommunityFormValues {
  name: string;
  slug: string;
  kind: "domain" | "topic" | "cohort";
  description?: string;
}

export function CreateCommunityDialog() {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (values: CommunityFormValues) => {
    setIsLoading(true);
    try {
      const result = await createCommunity(values);
      if (result.success) {
        toast.success("Community created successfully");
        setOpen(false);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create community");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Community
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Community</DialogTitle>
          <DialogDescription>Add a new thematic community to the platform.</DialogDescription>
        </DialogHeader>
        <CommunityForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isLoading={isLoading}
          submitLabel="Create Community"
        />
      </DialogContent>
    </Dialog>
  );
}
