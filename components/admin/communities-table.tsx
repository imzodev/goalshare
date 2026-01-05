"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, MoreHorizontal, Trash } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteCommunity } from "@/app/actions/admin-communities-mutations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Community {
  id: string;
  name: string;
  slug: string;
  kind: "domain" | "topic" | "cohort";
  description: string | null;
  createdAt: Date;
}

interface CommunitiesTableProps {
  communities: Community[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function CommunitiesTable({ communities, pagination }: CommunitiesTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const result = await deleteCommunity(deleteId);
      if (result.success) {
        toast.success("Community deleted successfully");
        setDeleteId(null);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete community");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {communities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No communities found.
                </TableCell>
              </TableRow>
            ) : (
              communities.map((community) => (
                <TableRow key={community.id}>
                  <TableCell className="font-medium">{community.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{community.kind}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{community.slug}</TableCell>
                  <TableCell className="text-sm">{format(new Date(community.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => setDeleteId(community.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Community
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {communities.length} of {pagination.total} communities
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1 || isPending}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm font-medium">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || isPending}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the community and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
