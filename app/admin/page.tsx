import { getAdminDashboardStats } from "@/app/actions/admin-stats";
import { MetricCard } from "@/components/admin/metric-card";
import { Users, Target, MessageSquare } from "lucide-react";

export default async function AdminPage() {
  const stats = await getAdminDashboardStats();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          description="Registered users on the platform"
        />
        <MetricCard
          title="Active Goals"
          value={stats.totalGoals}
          icon={Target}
          description="Goals currently being tracked"
        />
        <MetricCard
          title="Communities"
          value={stats.totalCommunities}
          icon={MessageSquare}
          description="Active communities"
        />
      </div>
    </div>
  );
}
