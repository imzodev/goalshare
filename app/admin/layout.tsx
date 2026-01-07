import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { validateAdminSession } from "@/lib/admin-auth-server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await validateAdminSession();

  return (
    <SidebarProvider>
      <AdminSidebar className="z-40" />
      <SidebarInset className="flex min-h-svh flex-1 flex-col min-w-0">
        <AdminHeader />
        <div className="flex-1 overflow-x-hidden">
          <div className="flex min-h-0 flex-col gap-4 p-4 pt-0 md:p-6 md:pt-4 min-w-0">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
