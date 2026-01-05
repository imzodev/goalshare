"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const communityFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  kind: z.enum(["domain", "topic", "cohort"]),
  description: z.string().max(500).optional().or(z.literal("")),
});

type CommunityFormValues = z.infer<typeof communityFormSchema>;

interface CommunityFormProps {
  initialValues?: Partial<CommunityFormValues>;
  onSubmit: (values: CommunityFormValues) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function CommunityForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Save Community",
}: CommunityFormProps) {
  const form = useForm<CommunityFormValues>({
    resolver: zodResolver(communityFormSchema),
    defaultValues: {
      name: initialValues?.name || "",
      slug: initialValues?.slug || "",
      kind: initialValues?.kind || "topic",
      description: initialValues?.description || "",
    },
  });

  const handleSubmit = async (values: CommunityFormValues) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. React Developers" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>The public name of the community.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="react-developers" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>The unique URL identifier. Only lowercase, numbers, and hyphens.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="kind"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select community type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="topic">Topic</SelectItem>
                  <SelectItem value="domain">Domain</SelectItem>
                  <SelectItem value="cohort">Cohort</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>The classification of the community.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what this community is about..."
                  className="resize-none"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
