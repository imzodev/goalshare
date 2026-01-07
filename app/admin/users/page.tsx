import { getUsersList } from "@/app/actions/admin-users";
import { UsersTable } from "@/components/admin/users-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management | GoalShare Admin",
};

interface UsersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.search;

  const { users, pagination } = await getUsersList({
    page,
    pageSize: 10,
    search,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">View and manage all registered users on the platform.</p>
      </div>
      <UsersTable users={users as any} pagination={pagination} />
    </div>
  );
}
