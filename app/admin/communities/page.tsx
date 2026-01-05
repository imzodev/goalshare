import { getCommunitiesList } from "@/app/actions/admin-communities";
import { CommunitiesTable } from "@/components/admin/communities-table";
import { CreateCommunityDialog } from "@/components/admin/create-community-dialog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Management | GoalShare Admin",
};

interface CommunitiesPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function AdminCommunitiesPage({ searchParams }: CommunitiesPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);

  const { communities, pagination } = await getCommunitiesList({
    page,
    pageSize: 10,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community Management</h1>
          <p className="text-muted-foreground">View and manage all communities on the platform.</p>
        </div>
        <CreateCommunityDialog />
      </div>
      <CommunitiesTable communities={communities as any} pagination={pagination} />
    </div>
  );
}
